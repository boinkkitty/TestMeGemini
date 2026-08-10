"""
API views for the questions app.
Provides endpoints for retrieving and creating questions for chapters.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import QuestionSerializer
from .models import Question
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from django.conf import settings
from django.shortcuts import get_object_or_404
from chapters.models import Chapter

# Retrieve all or limited random questions for a specific chapter
class ChapterQuestionsAPIView(APIView):
    """
    API endpoint for retrieving questions for a specific chapter.
    GET: Returns all or a limited number of random questions for the chapter.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        limit = request.query_params.get('limit')
        get_object_or_404(Chapter.objects.active_for_user(request.user), id=id)
        questions_qs = Question.objects.for_active_chapter(id, request.user).prefetch_related("choices")
        bounded_limit = self._bounded_limit(limit)
        if bounded_limit:
            questions_qs = questions_qs.random_sample(bounded_limit).prefetch_related("choices")
        serializer = QuestionSerializer(questions_qs, many=True)
        return Response(serializer.data)

    def _bounded_limit(self, value):
        maximum = getattr(settings, "CHAPTER_QUESTION_LIMIT_MAX", 50)
        if value is None:
            return maximum
        try:
            parsed = int(value)
        except (TypeError, ValueError):
            raise ValidationError({"limit": "Must be a positive integer."})
        if parsed <= 0:
            raise ValidationError({"limit": "Must be a positive integer."})
        return min(parsed, maximum)
