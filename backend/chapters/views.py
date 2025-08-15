from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from .models import Chapter
from .serializers import ChapterSerializer
from api.utils.ai import call_gpt_model
from api.utils.pdf import extract_text


class CreateChapterWithQuestionsView(APIView):
    """
    Parse PDF files, extract text, and create a chapter with associated questions using AI.
    """
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        files = request.FILES.getlist("files")
        if not files:
            return Response({"error": "file required"}, status=status.HTTP_400_BAD_REQUEST)
        title = request.data.get("title")
        if not title:
            return Response({"error": "title required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            chapter_content = extract_text(files)
            data = call_gpt_model(title, chapter_content)
            # The AI should return a dict with chapter and questions keys
            payload = {
                "user": request.user.id,
                "title": data["chapter"]["title"] or title,
                "content": data["chapter"]["content"],
                "questions": data["questions"]
            }
            serializer = ChapterSerializer(data=payload)
            serializer.is_valid(raise_exception=True)
            chapter = serializer.save()
            
            # Get all question IDs for the created chapter
            question_ids = list(chapter.questions.values_list("id", flat=True))
            result = {"chapter_id": chapter.id, "question_ids": question_ids}
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(result, status=status.HTTP_201_CREATED)
    
class UserChaptersAPIView(APIView):
    """
    Retrieve chapters for the authenticated user
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        chapters = Chapter.objects.filter(user=request.user)
        serializer = ChapterSerializer(chapters, many=True)
        return Response(serializer.data)
    
