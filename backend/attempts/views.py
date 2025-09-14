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
from .services import process_question_attempts

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
        qs = ChapterAttempt.objects.for_user(user)
        if start_date:
            qs = qs.completed_on_or_after(start_date)
        if end_date:
            qs = qs.completed_on_or_before(end_date)
        qs = qs.ordered_by_latest_completed()
        if limit and str(limit).isdigit() and int(limit) > 0:
            qs = qs[:int(limit)]
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
        questions_data = request.data.get('questions', [])
        total_score = process_question_attempts(chapter_attempt=chapter_attempt, questions_data=questions_data)
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