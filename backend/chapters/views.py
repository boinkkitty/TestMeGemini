from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from .models import Chapter
from .serializers import ChapterSerializer
from .services.question_generation import generate_and_persist

# Ingest PDF and create chapter with questions using OpenAI
class CreateChapterWithQuestionsView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        pdf = request.FILES.get("file")
        title = request.data.get("title") or "Untitled Chapter"
        if not pdf:
            return Response({"error": "file required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            # Generate chapter and questions from PDF
            result = generate_and_persist(title, pdf)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(result, status=status.HTTP_201_CREATED)
    
# Retrieve chapters for the authenticated user
class UserChaptersAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        chapters = Chapter.objects.filter(user=request.user)
        serializer = ChapterSerializer(chapters, many=True)
        return Response(serializer.data)
    