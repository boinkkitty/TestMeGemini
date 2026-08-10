"""
Domain services for chapter attempts.
"""

from django.db import transaction
from rest_framework.exceptions import ValidationError

from api.utils.score import get_score
from attempts.models import ChapterAttempt, QuestionAttempt
from chapters.models import Chapter
from questions.models import Choice, Question


@transaction.atomic
def create_chapter_attempt(*, user, validated_data):
    """
    Create a chapter attempt, question attempts, selected-choice rows, and score atomically.
    """
    try:
        chapter = Chapter.objects.select_for_update().get(
            id=validated_data["chapter"].id,
            user=user,
            is_deleted=False,
        )
    except Chapter.DoesNotExist as exc:
        raise ValidationError({"chapter_id": "Chapter is no longer available."}) from exc

    question_payloads = validated_data["questions"]
    payload_map = {item["question_id"]: item for item in question_payloads}
    question_ids = validated_data["order"]
    questions = (
        Question.objects.select_for_update()
        .filter(id__in=question_ids, chapter=chapter)
    )
    question_map = {question.id: question for question in questions}
    if set(question_map) != set(question_ids):
        raise ValidationError({"questions": "One or more questions are no longer available."})
    choices_by_question = {question_id: [] for question_id in question_ids}
    for choice in (
        Choice.objects.select_for_update()
        .filter(question_id__in=question_ids)
        .order_by("id")
    ):
        choices_by_question[choice.question_id].append(choice)

    chapter_attempt = ChapterAttempt.objects.create(
        chapter=chapter,
        user=user,
        score=0.0,
    )

    total_score = 0.0
    question_attempts = []
    selected_ids_by_question = {}

    for question_id in question_ids:
        item = payload_map[question_id]
        question = question_map[question_id]
        selected_choice_ids = item["selected_choices"]
        current_choices = choices_by_question[question.id]
        current_choice_ids = {choice.id for choice in current_choices}
        if not set(selected_choice_ids).issubset(current_choice_ids):
            raise ValidationError(
                {"questions": f"Choices for question {question.id} are no longer valid."}
            )
        correct_choice_ids = {
            choice.id
            for choice in current_choices
            if choice.is_correct
        }
        score = get_score(question, set(selected_choice_ids), correct_choice_ids)
        question_snapshot = {
            "id": question.id,
            "chapter": question.chapter_id,
            "question_text": question.question_text,
            "question_type": question.question_type,
            "choices": [
                {
                    "id": choice.id,
                    "text": choice.text,
                    "is_correct": choice.is_correct,
                }
                for choice in current_choices
            ],
            "created_at": question.created_at.isoformat(),
        }
        question_attempts.append(
            QuestionAttempt(
                chapter_attempt=chapter_attempt,
                question=question,
                question_snapshot=question_snapshot,
                selected_choices_snapshot=list(selected_choice_ids),
                score=score,
            )
        )
        selected_ids_by_question[question_id] = selected_choice_ids
        total_score += score

    QuestionAttempt.objects.bulk_create(question_attempts)
    created_attempts = {
        attempt.question_id: attempt
        for attempt in QuestionAttempt.objects.filter(
            chapter_attempt=chapter_attempt,
            question_id__in=question_ids,
        )
    }
    through_model = QuestionAttempt.selected_choices.through
    through_model.objects.bulk_create(
        [
            through_model(
                questionattempt_id=created_attempts[question_id].id,
                choice_id=choice_id,
            )
            for question_id in question_ids
            for choice_id in selected_ids_by_question[question_id]
        ]
    )

    chapter_attempt.score = total_score
    chapter_attempt.save(update_fields=["score"])
    return chapter_attempt
