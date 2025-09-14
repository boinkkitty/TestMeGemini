"""
Service functions for processing chapter attempts and question attempts.
Encapsulates business logic for scoring and saving attempts.
"""

from typing import List, Dict, Any
from questions.models import Question
from .serializers import QuestionAttemptSerializer
from api.utils.score import get_score
from .models import ChapterAttempt

def process_question_attempts(*, chapter_attempt: ChapterAttempt, questions_data: List[Dict[str, Any]]) -> float:
    """
    Processes each question in the attempt, calculates scores, and creates QuestionAttempt objects.
    Args:
        chapter_attempt (ChapterAttempt): The chapter attempt instance.
        questions_data (list): List of question data dicts from the request.
    Returns:
        float: The total score for the chapter attempt.
    """
    total_score = 0.0
    question_ids = [q['question_id'] for q in questions_data]
    questions = Question.objects.filter(id__in=question_ids).prefetch_related('choices')
    question_map = {q.id: q for q in questions}
    for q_data in questions_data:
        qid = q_data['question_id']
        selected_choice_ids = q_data['selected_choices']
        question = question_map.get(qid)
        if not question:
            continue
        correct_choices = set(question.choices.filter(is_correct=True).values_list('id', flat=True))
        score = get_score(question, set(selected_choice_ids), correct_choices)
        qa_data = {
            'chapter_attempt': chapter_attempt.id,
            'question': qid,
            'selected_choices': selected_choice_ids,
            'score': score
        }
        qa_serializer = QuestionAttemptSerializer(data=qa_data)
        qa_serializer.is_valid(raise_exception=True)
        qa_serializer.save()
        total_score += score
    return total_score
