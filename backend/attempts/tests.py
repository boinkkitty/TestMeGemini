from datetime import timedelta
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test.utils import CaptureQueriesContext
from django.urls import reverse
from django.utils import timezone
from django.db import connection
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.test import APITestCase

from attempts.models import ChapterAttempt, QuestionAttempt
from attempts.serializers import ChapterAttemptInputSerializer
from attempts.services import create_chapter_attempt
from chapters.models import Chapter
from questions.models import Choice, Question


class ChapterAttemptAPITests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(
            email="owner@example.com",
            password="pass",
            username="owner",
        )
        self.other_user = User.objects.create_user(
            email="other@example.com",
            password="pass",
            username="other",
        )
        self.client.force_authenticate(self.user)

        self.chapter = Chapter.objects.create(
            user=self.user,
            title="Algebra",
            description="Linear equations",
            category="Math",
        )
        self.other_chapter = Chapter.objects.create(
            user=self.other_user,
            title="Private",
            description="Other user's chapter",
            category="Math",
        )
        self.second_chapter = Chapter.objects.create(
            user=self.user,
            title="Geometry",
            description="Triangles",
            category="Math",
        )

        self.mcq = Question.objects.create(
            chapter=self.chapter,
            question_text="2 + 2?",
            question_type=Question.QuestionType.MCQ,
        )
        self.mcq_correct = Choice.objects.create(question=self.mcq, text="4", is_correct=True)
        self.mcq_wrong = Choice.objects.create(question=self.mcq, text="5", is_correct=False)

        self.mrq = Question.objects.create(
            chapter=self.chapter,
            question_text="Prime numbers",
            question_type=Question.QuestionType.MRQ,
        )
        self.mrq_correct_one = Choice.objects.create(question=self.mrq, text="2", is_correct=True)
        self.mrq_correct_two = Choice.objects.create(question=self.mrq, text="3", is_correct=True)
        self.mrq_wrong = Choice.objects.create(question=self.mrq, text="4", is_correct=False)

        self.tf = Question.objects.create(
            chapter=self.chapter,
            question_text="Sky is green",
            question_type=Question.QuestionType.TF,
        )
        self.tf_true = Choice.objects.create(question=self.tf, text="True", is_correct=False)
        self.tf_false = Choice.objects.create(question=self.tf, text="False", is_correct=True)

        self.cross_chapter_question = Question.objects.create(
            chapter=self.second_chapter,
            question_text="Not in attempted chapter",
            question_type=Question.QuestionType.MCQ,
        )
        self.cross_chapter_choice = Choice.objects.create(
            question=self.cross_chapter_question,
            text="Choice",
            is_correct=True,
        )

        self.other_user_question = Question.objects.create(
            chapter=self.other_chapter,
            question_text="Other user's question",
            question_type=Question.QuestionType.MCQ,
        )
        self.other_user_choice = Choice.objects.create(
            question=self.other_user_question,
            text="Secret",
            is_correct=True,
        )

        self.list_url = reverse("v1-attempts:chapter_attempts_list_create")

    def payload(self, *, chapter_id=None, order=None, questions=None):
        question_payloads = questions or [
            {"question_id": self.mcq.id, "selected_choices": [self.mcq_correct.id]},
            {"question_id": self.mrq.id, "selected_choices": [self.mrq_correct_one.id]},
            {"question_id": self.tf.id, "selected_choices": [self.tf_true.id]},
        ]
        return {
            "chapter_id": chapter_id or self.chapter.id,
            "order": order or [item["question_id"] for item in question_payloads],
            "questions": question_payloads,
        }

    def post_attempt(self, payload):
        return self.client.post(self.list_url, payload, format="json")

    def test_creates_attempt_atomically_with_server_computed_score(self):
        payload = self.payload()
        payload["score"] = 999
        payload["user"] = self.other_user.id

        response = self.post_attempt(payload)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["score"], 1.5)
        self.assertEqual(response.data["max_score"], 3)

        attempt = ChapterAttempt.objects.get()
        self.assertEqual(attempt.user, self.user)
        self.assertEqual(attempt.chapter, self.chapter)
        self.assertEqual(attempt.score, 1.5)

        question_attempts = QuestionAttempt.objects.order_by("id")
        self.assertEqual(question_attempts.count(), 3)
        self.assertEqual(question_attempts[0].selected_choices.get(), self.mcq_correct)
        self.assertEqual(question_attempts[1].selected_choices.get(), self.mrq_correct_one)
        self.assertEqual(question_attempts[2].selected_choices.get(), self.tf_true)

    def test_mrq_incorrect_selections_reduce_partial_credit(self):
        response = self.post_attempt(
            self.payload(
                questions=[
                    {
                        "question_id": self.mrq.id,
                        "selected_choices": [
                            self.mrq_correct_one.id,
                            self.mrq_correct_two.id,
                            self.mrq_wrong.id,
                        ],
                    }
                ]
            )
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["score"], 0.5)

    def test_denies_cross_user_and_deleted_chapters(self):
        cross_user = self.post_attempt(self.payload(chapter_id=self.other_chapter.id))
        self.assertEqual(cross_user.status_code, status.HTTP_400_BAD_REQUEST)

        self.chapter.is_deleted = True
        self.chapter.save(update_fields=["is_deleted"])
        deleted = self.post_attempt(self.payload())
        self.assertEqual(deleted.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertEqual(ChapterAttempt.objects.count(), 0)

    def test_rejects_cross_chapter_question(self):
        response = self.post_attempt(
            self.payload(
                questions=[
                    {
                        "question_id": self.cross_chapter_question.id,
                        "selected_choices": [self.cross_chapter_choice.id],
                    }
                ]
            )
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(ChapterAttempt.objects.count(), 0)

    def test_rejects_choice_that_does_not_belong_to_question(self):
        response = self.post_attempt(
            self.payload(
                questions=[
                    {
                        "question_id": self.mcq.id,
                        "selected_choices": [self.cross_chapter_choice.id],
                    }
                ]
            )
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(ChapterAttempt.objects.count(), 0)

    def test_rejects_duplicate_question_order_and_choice_ids(self):
        duplicate_questions = self.post_attempt(
            self.payload(
                order=[self.mcq.id, self.mcq.id],
                questions=[
                    {"question_id": self.mcq.id, "selected_choices": [self.mcq_correct.id]},
                    {"question_id": self.mcq.id, "selected_choices": [self.mcq_correct.id]},
                ],
            )
        )
        self.assertEqual(duplicate_questions.status_code, status.HTTP_400_BAD_REQUEST)

        duplicate_choices = self.post_attempt(
            self.payload(
                questions=[
                    {
                        "question_id": self.mcq.id,
                        "selected_choices": [self.mcq_correct.id, self.mcq_correct.id],
                    }
                ]
            )
        )
        self.assertEqual(duplicate_choices.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertEqual(ChapterAttempt.objects.count(), 0)

    def test_rejects_order_missing_or_unknown_submitted_question_ids(self):
        missing_from_order = self.post_attempt(
            self.payload(order=[self.mcq.id], questions=[
                {"question_id": self.mcq.id, "selected_choices": [self.mcq_correct.id]},
                {"question_id": self.mrq.id, "selected_choices": [self.mrq_correct_one.id]},
            ])
        )
        self.assertEqual(missing_from_order.status_code, status.HTTP_400_BAD_REQUEST)

        unknown_question = self.post_attempt(
            self.payload(
                order=[999999],
                questions=[{"question_id": 999999, "selected_choices": []}],
            )
        )
        self.assertEqual(unknown_question.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertEqual(ChapterAttempt.objects.count(), 0)

    def test_service_rolls_back_parent_attempt_when_child_write_fails(self):
        request = type("Request", (), {"user": self.user})()
        serializer = ChapterAttemptInputSerializer(
            data=self.payload(),
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)

        with patch(
            "attempts.services.QuestionAttempt.objects.bulk_create",
            side_effect=RuntimeError("boom"),
        ):
            with self.assertRaises(RuntimeError):
                create_chapter_attempt(
                    user=self.user,
                    validated_data=serializer.validated_data,
                )

        self.assertEqual(ChapterAttempt.objects.count(), 0)
        self.assertEqual(QuestionAttempt.objects.count(), 0)

    def test_service_revalidates_state_inside_transaction(self):
        request = type("Request", (), {"user": self.user})()
        serializer = ChapterAttemptInputSerializer(
            data=self.payload(),
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        self.chapter.is_deleted = True
        self.chapter.save(update_fields=["is_deleted"])

        with self.assertRaises(ValidationError):
            create_chapter_attempt(
                user=self.user,
                validated_data=serializer.validated_data,
            )

        self.assertEqual(ChapterAttempt.objects.count(), 0)

    def test_detail_is_owned_and_prefetched(self):
        owned_response = self.post_attempt(self.payload())
        self.assertEqual(owned_response.status_code, status.HTTP_201_CREATED)
        owned_attempt_id = owned_response.data["id"]

        self.client.force_authenticate(self.other_user)
        other_response = self.post_attempt(
            self.payload(
                chapter_id=self.other_chapter.id,
                questions=[
                    {
                        "question_id": self.other_user_question.id,
                        "selected_choices": [self.other_user_choice.id],
                    }
                ],
            )
        )
        self.assertEqual(other_response.status_code, status.HTTP_201_CREATED)

        forbidden = self.client.get(
            reverse("v1-attempts:chapter_attempt_detail", args=[owned_attempt_id])
        )
        self.assertEqual(forbidden.status_code, status.HTTP_404_NOT_FOUND)

        self.client.force_authenticate(self.user)
        with CaptureQueriesContext(connection) as ctx:
            response = self.client.get(
                reverse("v1-attempts:chapter_attempt_detail", args=[owned_attempt_id])
            )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["question_attempts"]), 3)
        self.assertIn(
            "is_correct",
            response.data["question_attempts"][0]["question_detail"]["choices"][0],
        )
        self.assertLessEqual(len(ctx), 8)

    def test_attempt_review_uses_immutable_question_and_choice_snapshots(self):
        create_response = self.post_attempt(self.payload())
        attempt_id = create_response.data["id"]
        selected_choice_id = self.mcq_correct.id

        self.mcq.question_text = "Changed after submission"
        self.mcq.save(update_fields=["question_text"])
        self.mcq_correct.text = "Changed choice"
        self.mcq_correct.is_correct = False
        self.mcq_correct.save(update_fields=["text", "is_correct"])
        self.mcq_correct.delete()

        response = self.client.get(
            reverse("v1-attempts:chapter_attempt_detail", args=[attempt_id])
        )
        mcq_review = response.data["question_attempts"][0]

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(mcq_review["question_detail"]["question_text"], "2 + 2?")
        self.assertEqual(mcq_review["question_detail"]["choices"][0]["text"], "4")
        self.assertTrue(mcq_review["question_detail"]["choices"][0]["is_correct"])
        self.assertEqual(mcq_review["selected_choices"], [selected_choice_id])

    def test_list_filters_validate_and_use_bounded_queries(self):
        first = self.post_attempt(self.payload())
        self.assertEqual(first.status_code, status.HTTP_201_CREATED)
        second = self.post_attempt(self.payload())
        self.assertEqual(second.status_code, status.HTTP_201_CREATED)

        older_attempt = ChapterAttempt.objects.order_by("id").first()
        old_completed_at = timezone.now() - timedelta(days=3)
        ChapterAttempt.objects.filter(id=older_attempt.id).update(completed_at=old_completed_at)

        with CaptureQueriesContext(connection) as ctx:
            response = self.client.get(
                self.list_url,
                {"start_date": timezone.localdate().isoformat(), "limit": 1},
            )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], second.data["id"])
        self.assertLessEqual(len(ctx), 4)

        invalid_date = self.client.get(self.list_url, {"start_date": "not-a-date"})
        self.assertEqual(invalid_date.status_code, status.HTTP_400_BAD_REQUEST)

        invalid_range = self.client.get(
            self.list_url,
            {"start_date": "2026-01-02", "end_date": "2026-01-01"},
        )
        self.assertEqual(invalid_range.status_code, status.HTTP_400_BAD_REQUEST)
