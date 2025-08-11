from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import QuestionSerializer
from .models import Question
from rest_framework.permissions import IsAuthenticated


# Create a new question or multiple questions
# class QuestionCreateAPIView(APIView):
#     def post(self, request):
#         serializer = QuestionSerializer(data=request.data, many=True)  # allow list
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Retrieve questions for a specific chapter
class UserChapterQuestionsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        chapter_id = request.query_params.get('chapter_id')
        if not chapter_id:
            return Response({'detail': 'chapter_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
        questions = Question.objects.filter(chapter_id=chapter_id, chapter__user=request.user)
        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data)
    
# Retrieve random amount of limited questions for a specific chapter with
class UserChapterLimitedQuestionsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        chapter_id = request.query_params.get('chapter_id')
        limit = request.query_params.get('limit')

        if not chapter_id:
            return Response({'detail': 'chapter_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        questions_qs = Question.objects.filter(chapter_id=chapter_id, chapter__user=request.user)

        if limit:
            try:
                limit = int(limit)
                if limit > 0:
                    questions_qs = questions_qs.order_by('?')[:limit]
            except ValueError:
                return Response({'detail': 'limit must be an integer.'}, status=status.HTTP_400_BAD_REQUEST)

        questions = list(questions_qs)
        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data)
    