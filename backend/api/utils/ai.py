import json
from openai import OpenAI
from google import genai
from django.conf import settings
from typing import List, Literal
from pydantic import BaseModel

# Models for the AI response
class Choice(BaseModel):
    text: str
    is_correct: bool

class Question(BaseModel):
    question_text: str
    question_type: Literal["MCQ", "MRQ", "TF"]
    choices: List[Choice]

class ChapterContent(BaseModel):
    title: str
    description: str

class ChapterSchema(BaseModel):
    chapter: ChapterContent
    questions: List[Question]

BASE_INSTRUCTIONS = """
You are an expert quiz generator and a helpful assistant that creates questions from lecture or textbook content.

Your tasks:
1. Write a concise **summary of the chapter content** (3–5 sentences), highlighting the most important definitions, formulas, concepts, processes, and examples.
2. Generate **exactly 20–25 quiz questions** strictly based on the core learning material in the chapter. Cover all key points, ensuring that each major topic has at least one question.

Question Types & Rules:
- **MCQ (Multiple Choice Question)**: 3–4 options, exactly one correct answer.
- **MRQ (Multi Response Question)**: 3–4 options, one or more correct answers.
- **TF (True/False)**: Only two options (True, False), exactly one correct answer.
- Ensure **diversity**: approximately 50% MCQs, 25% MRQs, 25% TFs, unless the content is unsuitable.
- Choices must be **plausible** and non-trivial; avoid obviously wrong answers or jokes.

Content Coverage:
- Focus **only** on lecture or textbook content.
- Include definitions, formulas, key concepts, processes, examples, and comparisons.
- Ignore: administrative info (exam dates, office hours, announcements), section dividers (e.g., "Summary", "Questions?"), references, citations, URLs, and image captions without context.
- Ignore course descriptions, motivations, or learning objectives.
"""

def build_user_prompt(chapter_title: str, chapter_content: str) -> str:
    """
    Build content to send to the AI model
    """

    return f"""
      <chapter_title>
      {chapter_title}
      </chapter_title>

      <chapter_content>
      {chapter_content}
      </chapter_content>
      """
    
def call_gpt_model(chapter_title: str, chapter_content: str) -> dict:
    prompt = build_user_prompt(chapter_title, chapter_content)
    client = OpenAI(api_key = settings.OPENAI_API_KEY)
    response = client.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": BASE_INSTRUCTIONS},
            {"role": "user", "content": prompt}
        ],
        response_format=ChapterSchema,
    )
    return response.choices[0].message.parsed.dict()

def call_gemini_model(chapter_title: str, chapter_content: str) -> dict:
    prompt = build_user_prompt(chapter_title, chapter_content)
    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": ChapterSchema
        },
    )
    print(response)
    generated_text = response.candidates[0].content.parts[0].text
    print("Generated text:", generated_text)
    data = json.loads(generated_text)
    return data