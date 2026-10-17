import json
from types import SimpleNamespace
from unittest.mock import patch

from django.test import SimpleTestCase, override_settings

from api.utils.ai import (
    AIServiceError,
    BASE_INSTRUCTIONS,
    build_response_schema,
    call_gemini_model,
)


def generated_payload(question_count):
    mcq_count = question_count // 2
    mrq_count = question_count // 4

    def question_for(index):
        if index < mcq_count:
            return {
                "question_text": f"MCQ question {index + 1}?",
                "question_type": "MCQ",
                "choices": [
                    {"text": "Correct", "is_correct": True},
                    {"text": "Distractor A", "is_correct": False},
                    {"text": "Distractor B", "is_correct": False},
                    {"text": "Distractor C", "is_correct": False},
                ],
            }
        if index < mcq_count + mrq_count:
            return {
                "question_text": f"MRQ question {index + 1}?",
                "question_type": "MRQ",
                "choices": [
                    {"text": "Correct A", "is_correct": True},
                    {"text": "Correct B", "is_correct": True},
                    {"text": "Distractor A", "is_correct": False},
                    {"text": "Distractor B", "is_correct": False},
                ],
            }
        return {
            "question_text": f"TF question {index + 1}?",
            "question_type": "TF",
            "choices": [
                {"text": "True", "is_correct": True},
                {"text": "False", "is_correct": False},
            ],
        }

    return {
        "chapter": {
            "title": "Linear Regression",
            "description": "A concise chapter summary.",
        },
        "questions": [question_for(index) for index in range(question_count)],
    }


def completion_for(payload):
    return SimpleNamespace(
        candidates=[
            SimpleNamespace(
                content=SimpleNamespace(
                    parts=[SimpleNamespace(text=json.dumps(payload))]
                )
            )
        ]
    )


@override_settings(GEMINI_API_KEY="test-key", GEMINI_TIMEOUT_SECONDS=30)
class GeminiGenerationTests(SimpleTestCase):
    @override_settings(GEMINI_API_KEY="")
    def test_missing_gemini_key_fails_only_when_generation_is_called(self):
        with self.assertRaisesRegex(
            AIServiceError,
            "Gemini is not configured. Set GEMINI_API_KEY to generate questions.",
        ):
            call_gemini_model(
                "Linear Regression",
                "Course content",
                question_count=10,
                max_retries_per_model=1,
            )

    def test_response_schema_requires_exact_question_count(self):
        schema = build_response_schema(20)

        self.assertEqual(schema["properties"]["questions"]["minItems"], 20)
        self.assertEqual(schema["properties"]["questions"]["maxItems"], 20)

    @patch("api.utils.ai._gemini_client")
    def test_sends_expert_instructions_and_exact_count_contract(self, gemini_client):
        generate_content = gemini_client.return_value.models.generate_content
        generate_content.return_value = completion_for(generated_payload(10))

        result = call_gemini_model(
            "Linear Regression",
            "Mean squared error measures prediction error.",
            question_count=10,
            max_retries_per_model=1,
        )

        self.assertEqual(len(result["questions"]), 10)
        request = generate_content.call_args.kwargs
        self.assertEqual(request["config"]["system_instruction"], BASE_INSTRUCTIONS.strip())
        self.assertEqual(
            request["config"]["response_json_schema"]["properties"]["questions"]["minItems"],
            10,
        )
        self.assertIn("Generate exactly 10 questions", request["contents"])
        self.assertIn("Return exactly 10 question objects", request["contents"])

    @patch("api.utils.ai.sleep")
    @patch("api.utils.ai._gemini_client")
    def test_retries_when_model_returns_wrong_count(self, gemini_client, sleep_mock):
        generate_content = gemini_client.return_value.models.generate_content
        generate_content.side_effect = [
            completion_for(generated_payload(9)),
            completion_for(generated_payload(10)),
        ]

        result = call_gemini_model(
            "Linear Regression",
            "Course content",
            question_count=10,
            max_retries_per_model=2,
        )

        self.assertEqual(len(result["questions"]), 10)
        self.assertEqual(generate_content.call_count, 2)
        sleep_mock.assert_called_once_with(0.75)
