"""
API views for the attempts app.
Provides endpoints for creating/listing chapter attempts and retrieving attempt details.
"""

from django.db.models import Q
from api.utils.score import get_score
from questions.models import Question
from rest_framework import permissions, status
from rest_framework.generics import ListCreateAPIView, RetrieveAPIView
from rest_framework.response import Response
from .models import ChapterAttempt
from .serializers import ChapterAttemptSerializer, QuestionAttemptSerializer, ChapterAttemptDetailSerializer

class ChapterAttemptCreateListAPIView(ListCreateAPIView):
    """
    API endpoint for listing and creating chapter attempts for the authenticated user.
    GET: Returns a list of chapter attempts, optionally filtered by date and limit.
    POST: Creates a new chapter attempt, calculates score, and creates related question attempts.
    """
    serializer_class = ChapterAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Returns queryset of chapter attempts for the current user, filtered by query params.
        """
        user = self.request.user
        params = self.request.query_params
        limit = params.get('limit')
        start_date = params.get('start_date')
        end_date = params.get('end_date')

        query = Q(user=user)
        if start_date:
            query &= Q(completed_at__date__gte=start_date)
        if end_date:
            query &= Q(completed_at__date__lte=end_date)

        qs = ChapterAttempt.objects.filter(query).order_by('-completed_at')
        if limit:
            return qs[:int(limit)] if limit.isdigit() and int(limit) > 0 else qs
        return qs

    def create(self, request, *args, **kwargs):
        """
        Handles creation of a chapter attempt, calculates total score, and creates question attempts.
        Args:
            request (Request): The HTTP request containing attempt and questions data.
        Returns:
            Response: HTTP 201 with created attempt data.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        chapter_attempt = serializer.save(user=request.user)
        total_score = 0
        questions_data = request.data.get('questions', [])
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
        chapter_attempt.score = total_score
        chapter_attempt.save()
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class ChapterAttemptRetrieveAPIView(RetrieveAPIView):
    """
    API endpoint for retrieving details of a single chapter attempt for the authenticated user.
    """
    serializer_class = ChapterAttemptDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = ChapterAttempt.objects.all()

    def get_queryset(self):
        """
        Returns queryset of chapter attempts for the current user.
        """
        return ChapterAttempt.objects.filter(user=self.request.user)