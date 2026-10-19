import json
from types import SimpleNamespace
from unittest.mock import patch

from django.test import SimpleTestCase, TestCase, override_settings

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

    @patch("api.utils.ai._gemini_client")
    def test_falls_back_through_current_free_tier_models(self, gemini_client):
        generate_content = gemini_client.return_value.models.generate_content
        generate_content.side_effect = [
            RuntimeError("503 overloaded"),
            RuntimeError("503 overloaded"),
            completion_for(generated_payload(10)),
        ]

        result = call_gemini_model(
            "Network Resource Allocation",
            "Course content",
            question_count=10,
            max_retries_per_model=1,
        )

        self.assertEqual(result["_model_used"], "gemini-3.5-flash-lite")
        self.assertEqual(
            [call.kwargs["model"] for call in generate_content.call_args_list],
            [
                "gemini-3.8-flash",
                "gemini-3.6-flash",
                "gemini-3.5-flash-lite",
            ],
        )

    @patch("api.utils.ai._gemini_client")
    def test_falls_back_when_provider_deadline_expires(self, gemini_client):
        generate_content = gemini_client.return_value.models.generate_content
        generate_content.side_effect = [
            RuntimeError("504 DEADLINE_EXCEEDED"),
            completion_for(generated_payload(10)),
        ]

        result = call_gemini_model(
            "Network Resource Allocation",
            "Course content",
            question_count=10,
            max_retries_per_model=1,
        )

        self.assertEqual(result["_model_used"], "gemini-3.6-flash")


class OpenAPISchemaTests(TestCase):
    def test_schema_exposes_only_canonical_versioned_api_paths(self):
        response = self.client.get("/api/schema/?format=json")

        self.assertEqual(response.status_code, 200)
        schema = json.loads(response.content)
        self.assertIn("/api/v1/chapters/", schema["paths"])
        self.assertIn("/api/v1/chapter-generations/", schema["paths"])
        self.assertIn("/api/v1/attempts/", schema["paths"])
        self.assertNotIn("/api/chapters/", schema["paths"])

    def test_interactive_documentation_routes_are_available(self):
        self.assertEqual(self.client.get("/api/schema/swagger-ui/").status_code, 200)
        self.assertEqual(self.client.get("/api/schema/redoc/").status_code, 200)

    def test_generation_schema_describes_multipart_request_and_response(self):
        schema = json.loads(self.client.get("/api/schema/?format=json").content)
        operation = schema["paths"]["/api/v1/chapter-generations/"]["post"]

        self.assertIn("multipart/form-data", operation["requestBody"]["content"])
        request_schema = operation["requestBody"]["content"]["multipart/form-data"]["schema"]
        request_schema = schema["components"]["schemas"][request_schema["$ref"].rsplit("/", 1)[-1]]
        properties = request_schema["properties"]
        self.assertEqual(set(properties), {"files", "title", "category", "description", "question_count"})
        response_schema = operation["responses"]["201"]["content"]["application/json"]["schema"]
        response_schema = schema["components"]["schemas"][response_schema["$ref"].rsplit("/", 1)[-1]]
        self.assertEqual(set(response_schema["properties"]), {"chapter_id", "question_ids"})

    def test_auth_schema_matches_the_runtime_response_envelopes(self):
        schema = json.loads(self.client.get("/api/schema/?format=json").content)

        for path, method, expected_properties in (
            ("/api/v1/auth/login/", "post", {"user"}),
            ("/api/v1/auth/logout/", "post", {"message"}),
            ("/api/v1/auth/token/refresh/", "post", {"message"}),
        ):
            response_schema = schema["paths"][path][method]["responses"]["200"]["content"][
                "application/json"
            ]["schema"]
            response_schema = schema["components"]["schemas"][
                response_schema["$ref"].rsplit("/", 1)[-1]
            ]
            self.assertEqual(set(response_schema["properties"]), expected_properties)
