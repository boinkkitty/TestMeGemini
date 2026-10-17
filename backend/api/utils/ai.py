"""Gemini utilities for generating validated chapter quizzes."""

import logging
from collections import Counter
from time import sleep
from typing import List, Literal

from django.conf import settings
from google import genai
from pydantic import BaseModel, ConfigDict, Field, ValidationError, model_validator


logger = logging.getLogger(__name__)


class Choice(BaseModel):
    """A possible answer to a generated question."""

    model_config = ConfigDict(extra="forbid")

    text: str = Field(min_length=1)
    is_correct: bool


class Question(BaseModel):
    """A generated quiz question with enforceable answer rules."""

    model_config = ConfigDict(extra="forbid")

    question_text: str = Field(min_length=1)
    question_type: Literal["MCQ", "MRQ", "TF"]
    choices: List[Choice] = Field(min_length=2, max_length=4)

    @model_validator(mode="after")
    def validate_choices(self):
        correct_count = sum(choice.is_correct for choice in self.choices)

        if self.question_type in {"MCQ", "MRQ"} and len(self.choices) != 4:
            raise ValueError(f"{self.question_type} questions require exactly four choices")
        if self.question_type == "MCQ" and correct_count != 1:
            raise ValueError("MCQ questions require exactly one correct choice")
        if self.question_type == "MRQ" and correct_count < 2:
            raise ValueError("MRQ questions require at least two correct choices")
        if self.question_type == "TF":
            labels = {choice.text.strip().lower() for choice in self.choices}
            if labels != {"true", "false"} or correct_count != 1:
                raise ValueError("TF questions require True/False choices and one correct choice")

        return self


class ChapterContent(BaseModel):
    """Generated chapter title and summary."""

    model_config = ConfigDict(extra="forbid")

    title: str = Field(min_length=1)
    description: str = Field(min_length=1)


class ChapterSchema(BaseModel):
    """Complete structured response expected from Gemini."""

    model_config = ConfigDict(extra="forbid")

    chapter: ChapterContent
    questions: List[Question]

    @model_validator(mode="after")
    def reject_duplicate_questions(self):
        normalized = [
            " ".join(question.question_text.lower().split())
            for question in self.questions
        ]
        if len(normalized) != len(set(normalized)):
            raise ValueError("Generated questions must be unique")
        return self


BASE_INSTRUCTIONS = """
You are a senior university assessment designer. Create a rigorous, fair quiz from the supplied lecture content.

Follow these non-negotiable rules:
- Ground every question and answer only in the supplied source. Never add outside facts.
- Test meaningful concepts, definitions, formulas, procedures, assumptions, interpretations, and comparisons—not administrative text or trivia.
- Make every question self-contained, unambiguous, and answerable without seeing the source.
- Use plausible distractors based on realistic misconceptions. Avoid joke answers, giveaways, and overlapping choices.
- Do not use "all of the above" or "none of the above".
- MCQ: exactly four choices and exactly one correct choice.
- MRQ: exactly four choices and at least two correct choices. Make it clear that multiple answers may be correct.
- TF: exactly two choices named True and False, with exactly one correct choice.
- Avoid duplicate questions and avoid testing the same fact with superficial rewording.
- Spread questions across the source and vary cognitive demand between recall, conceptual understanding, application, and analysis.
- Write a concise 3-5 sentence chapter summary covering the most important learning points.
"""


MODEL_CHAIN = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.5-flash-lite",
]
OVERLOAD_MARKERS = ("unavailable", "overloaded", "503")


class AIServiceError(RuntimeError):
    """Client-safe AI generation failure."""


def _question_type_targets(question_count: int) -> tuple[int, int, int]:
    mcq_count = question_count // 2
    mrq_count = question_count // 4
    tf_count = question_count - mcq_count - mrq_count
    return mcq_count, mrq_count, tf_count


def build_user_prompt(chapter_title: str, chapter_content: str, question_count: int) -> str:
    """Build a precise task prompt without duplicating the JSON response schema."""
    mcq_count, mrq_count, tf_count = _question_type_targets(question_count)
    return f"""
Generate exactly {question_count} questions from the source below.

Required composition:
- {mcq_count} MCQ questions
- {mrq_count} MRQ questions
- {tf_count} TF questions

Hard acceptance criteria:
- Return exactly {question_count} question objects—no more and no fewer.
- Cover the source proportionally; do not over-focus on its opening sections.
- Prefer questions about high-value learning outcomes over minor details.
- Before returning, silently count the questions and verify the total is exactly {question_count}.

<chapter_title>
{chapter_title}
</chapter_title>

<chapter_content>
{chapter_content}
</chapter_content>
""".strip()


def build_response_schema(question_count: int) -> dict:
    """Return a JSON Schema that requires the exact requested array length."""
    schema = ChapterSchema.model_json_schema()
    questions_schema = schema["properties"]["questions"]
    questions_schema["minItems"] = question_count
    questions_schema["maxItems"] = question_count
    return schema


def _gemini_client():
    timeout = getattr(settings, "GEMINI_TIMEOUT_SECONDS", 30)
    try:
        return genai.Client(
            api_key=settings.GEMINI_API_KEY,
            http_options={"timeout": timeout * 1000},
        )
    except TypeError:
        logger.warning("[Gemini] SDK client does not support http_options timeout")
        return genai.Client(api_key=settings.GEMINI_API_KEY)


def call_gemini_model(
    chapter_title: str,
    chapter_content: str,
    *,
    question_count: int = 10,
    max_retries_per_model: int = 2,
    base_backoff: float = 0.75,
) -> dict:
    """Generate an exact-count quiz with validation, retry, and model fallback."""
    if not settings.GEMINI_API_KEY:
        raise AIServiceError(
            "Gemini is not configured. Set GEMINI_API_KEY to generate questions."
        )
    if question_count < 1:
        raise ValueError("question_count must be positive")
    if max_retries_per_model < 1:
        raise ValueError("max_retries_per_model must be positive")

    prompt = build_user_prompt(chapter_title, chapter_content, question_count)
    response_schema = build_response_schema(question_count)
    client = _gemini_client()
    last_error = None

    for model in MODEL_CHAIN:
        for attempt in range(max_retries_per_model):
            try:
                logger.info(
                    "[Gemini] model=%s attempt=%d requested_questions=%d",
                    model,
                    attempt + 1,
                    question_count,
                )
                response = client.models.generate_content(
                    model=model,
                    contents=prompt,
                    config={
                        "system_instruction": BASE_INSTRUCTIONS.strip(),
                        "response_mime_type": "application/json",
                        "response_json_schema": response_schema,
                    },
                )
            except Exception as error:  # Google SDK exposes several provider exception types.
                message = str(error)
                is_overload = any(marker in message.lower() for marker in OVERLOAD_MARKERS)
                logger.warning(
                    "[Gemini] provider failure model=%s attempt=%d overload=%s category=%s",
                    model,
                    attempt + 1,
                    is_overload,
                    type(error).__name__,
                )
                last_error = error
                if is_overload and attempt + 1 < max_retries_per_model:
                    sleep(base_backoff * (2 ** attempt))
                    continue
                if is_overload:
                    break
                raise AIServiceError("Question generation failed.") from error

            try:
                text = response.candidates[0].content.parts[0].text
                parsed = ChapterSchema.model_validate_json(text)
                if len(parsed.questions) != question_count:
                    raise ValueError(
                        f"Expected {question_count} questions, received {len(parsed.questions)}"
                    )
                expected_types = dict(
                    zip(("MCQ", "MRQ", "TF"), _question_type_targets(question_count))
                )
                actual_types = Counter(
                    question.question_type for question in parsed.questions
                )
                if actual_types != expected_types:
                    raise ValueError(
                        f"Expected question types {expected_types}, received {dict(actual_types)}"
                    )
                data = parsed.model_dump()
                data["_model_used"] = model
                return data
            except (ValidationError, ValueError, IndexError, AttributeError) as error:
                logger.warning(
                    "[Gemini] invalid output model=%s attempt=%d category=%s",
                    model,
                    attempt + 1,
                    type(error).__name__,
                )
                last_error = error
                if attempt + 1 < max_retries_per_model:
                    sleep(base_backoff * (2 ** attempt))
                    continue
                break

    raise AIServiceError("Question generation did not return a valid exact-count quiz.") from last_error
