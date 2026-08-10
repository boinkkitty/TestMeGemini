from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import connection
from django.test import override_settings
from django.test.utils import CaptureQueriesContext
from rest_framework import status
from rest_framework.test import APITestCase
from unittest.mock import patch

from chapters.models import Chapter
from api.utils.pdf import PdfUploadError, extract_text
from questions.models import Choice, Question


def question_payload(text="Question?"):
    return {
        "question_text": text,
        "question_type": "MCQ",
        "choices": [
            {"text": "Right", "is_correct": True},
            {"text": "Wrong", "is_correct": False},
        ],
    }


class ChapterQuestionAPITests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.user = user_model.objects.create_user(
            email="user@example.com",
            username="user",
            password="pw",
        )
        self.other_user = user_model.objects.create_user(
            email="other@example.com",
            username="other",
            password="pw",
        )
        self.client.force_authenticate(self.user)

    def create_chapter_with_question(self, *, user=None, is_deleted=False):
        chapter = Chapter.objects.create(
            user=user or self.user,
            title="Chapter",
            description="Description",
            category="Category",
            is_deleted=is_deleted,
        )
        question = Question.objects.create(
            chapter=chapter,
            question_text="Question?",
            question_type=Question.QuestionType.MCQ,
        )
        Choice.objects.create(question=question, text="Right", is_correct=True)
        Choice.objects.create(question=question, text="Wrong", is_correct=False)
        return chapter

    def test_chapter_detail_does_not_expose_correct_answers(self):
        chapter = self.create_chapter_with_question()

        response = self.client.get(f"/api/v1/chapters/{chapter.id}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        choices = response.data["questions"][0]["choices"]
        self.assertNotIn("is_correct", choices[0])
        self.assertNotIn("is_correct", choices[1])

    def test_chapter_and_question_reads_have_bounded_query_counts(self):
        chapter = self.create_chapter_with_question()
        for index in range(4):
            question = Question.objects.create(
                chapter=chapter,
                question_text=f"Question {index}?",
                question_type=Question.QuestionType.MCQ,
            )
            Choice.objects.create(question=question, text="Right", is_correct=True)
            Choice.objects.create(question=question, text="Wrong", is_correct=False)

        with CaptureQueriesContext(connection) as detail_queries:
            detail = self.client.get(f"/api/v1/chapters/{chapter.id}/")
        with CaptureQueriesContext(connection) as question_queries:
            questions = self.client.get(
                f"/api/v1/chapters/{chapter.id}/questions/?limit=5"
            )

        self.assertEqual(detail.status_code, status.HTTP_200_OK)
        self.assertEqual(questions.status_code, status.HTTP_200_OK)
        self.assertLessEqual(len(detail_queries), 3)
        self.assertLessEqual(len(question_queries), 4)

    def test_question_list_filters_deleted_and_foreign_chapters(self):
        deleted = self.create_chapter_with_question(is_deleted=True)
        foreign = self.create_chapter_with_question(user=self.other_user)

        deleted_response = self.client.get(f"/api/v1/chapters/{deleted.id}/questions/")
        foreign_response = self.client.get(f"/api/v1/chapters/{foreign.id}/questions/")

        self.assertEqual(deleted_response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(foreign_response.status_code, status.HTTP_404_NOT_FOUND)

    def test_invalid_list_limits_are_rejected(self):
        chapter = self.create_chapter_with_question()

        chapter_response = self.client.get("/api/v1/chapters/?limit=unbounded")
        question_response = self.client.get(
            f"/api/v1/chapters/{chapter.id}/questions/?limit=0"
        )

        self.assertEqual(chapter_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(question_response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_soft_deletes_and_hides_chapter(self):
        chapter = self.create_chapter_with_question()

        delete_response = self.client.delete(f"/api/v1/chapters/{chapter.id}/")
        chapter.refresh_from_db()
        get_response = self.client.get(f"/api/v1/chapters/{chapter.id}/")

        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertTrue(chapter.is_deleted)
        self.assertTrue(Question.objects.filter(chapter=chapter).exists())
        self.assertEqual(get_response.status_code, status.HTTP_404_NOT_FOUND)

    def test_nested_creation_is_atomic_for_invalid_questions(self):
        payload = {
            "title": "Atomic",
            "description": "Description",
            "category": "Category",
            "questions": [
                question_payload("Valid?"),
                {
                    "question_text": "Invalid?",
                    "question_type": "MCQ",
                    "choices": [
                        {"text": "A", "is_correct": True},
                        {"text": "B", "is_correct": True},
                    ],
                },
            ],
        }

        response = self.client.post("/api/v1/chapters/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(Chapter.objects.filter(title="Atomic").exists())
        self.assertEqual(Question.objects.count(), 0)

    def test_nested_creation_response_keeps_answers_secret(self):
        payload = {
            "title": "Safe",
            "description": "Description",
            "category": "Category",
            "questions": [question_payload()],
        }

        response = self.client.post("/api/v1/chapters/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertNotIn("is_correct", response.data["questions"][0]["choices"][0])

    def test_update_uses_flat_contract_without_nested_questions(self):
        chapter = self.create_chapter_with_question()
        payload = {
            "title": "Updated",
            "description": "Updated description",
            "category": "Updated category",
            "questions": [],
        }

        response = self.client.put(f"/api/v1/chapters/{chapter.id}/", payload, format="json")
        chapter.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(chapter.title, "Updated")
        self.assertEqual(chapter.questions.count(), 1)

    @patch("chapters.services.call_gemini_model")
    def test_generation_rejects_non_pdf_upload_before_ai(self, call_gemini):
        upload = SimpleUploadedFile("notes.txt", b"hello", content_type="text/plain")

        response = self.client.post(
            "/api/v1/chapter-generations/",
            {"title": "Upload", "category": "Category", "files": [upload]},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)
        call_gemini.assert_not_called()

    @override_settings(CHAPTER_QUESTION_LIMIT_MAX=3)
    @patch("questions.managers.random.sample", side_effect=lambda population, size: population[:size])
    def test_question_limit_is_capped_before_sampling(self, sample):
        chapter = self.create_chapter_with_question()
        question = chapter.questions.first()
        Choice.objects.filter(question=question).delete()
        question.delete()
        for index in range(10):
            new_question = Question.objects.create(
                chapter=chapter,
                question_text=f"Question {index}?",
                question_type=Question.QuestionType.MCQ,
            )
            Choice.objects.create(question=new_question, text="Right", is_correct=True)
            Choice.objects.create(question=new_question, text="Wrong", is_correct=False)

        response = self.client.get(f"/api/v1/chapters/{chapter.id}/questions/?limit=999")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)
        sample.assert_called_once()
        self.assertEqual(sample.call_args.args[1], 3)
        self.assertNotIn("is_correct", response.data[0]["choices"][0])


class PdfExtractionTests(APITestCase):
    def test_spoofed_pdf_content_type_is_rejected(self):
        upload = SimpleUploadedFile(
            "notes.pdf",
            b"this is not a PDF",
            content_type="application/pdf",
        )

        with self.assertRaises(PdfUploadError):
            extract_text([upload])

    @override_settings(CHAPTER_UPLOAD_MAX_PDF_PAGES=5)
    @patch("api.utils.pdf.pdfplumber.open")
    def test_empty_pdf_extraction_is_rejected(self, pdf_open):
        class EmptyPage:
            def extract_text(self):
                return ""

        class EmptyPdf:
            pages = [EmptyPage()]

            def __enter__(self):
                return self

            def __exit__(self, exc_type, exc, tb):
                return False

        pdf_open.return_value = EmptyPdf()
        upload = SimpleUploadedFile("notes.pdf", b"%PDF-1.4", content_type="application/pdf")

        with self.assertRaises(PdfUploadError):
            extract_text([upload])
