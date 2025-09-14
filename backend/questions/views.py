"""
API views for the questions app.
Provides endpoints for retrieving and creating questions for chapters.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import QuestionSerializer
from .models import Question
from rest_framework.permissions import IsAuthenticated

# Retrieve all or limited random questions for a specific chapter
class ChapterQuestionsAPIView(APIView):
    """
    API endpoint for retrieving questions for a specific chapter.
    GET: Returns all or a limited number of random questions for the chapter.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        limit = request.query_params.get('limit')
        questions_qs = Question.objects.filter(chapter_id=id, chapter__user=request.user)
        if limit:
            try:
                limit = int(limit)
                if limit > 0:
                    questions_qs = questions_qs.order_by('?')[:limit]
            except ValueError:
                return Response({'detail': 'limit must be an integer.'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = QuestionSerializer(questions_qs, many=True)
        return Response(serializer.data)
