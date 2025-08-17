from rest_framework import status
from rest_framework.generics import ListCreateAPIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from .models import Chapter
from .serializers import ChapterSerializer, ChapterListSerializer
from api.utils.ai import call_gemini_model
from api.utils.pdf import extract_text

class ChapterListCreateAPIView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Chapter.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.request.method == "GET":
            return ChapterListSerializer
        return ChapterSerializer

    def create(self, request, *args, **kwargs):
        files = request.FILES.getlist("files")
        title = request.data.get("title")
        category = request.data.get("category")
        if not files:
            return Response({"error": "file required"}, status=status.HTTP_400_BAD_REQUEST)
        if not title:
            return Response({"error": "title required"}, status=status.HTTP_400_BAD_REQUEST)
        if not category:
            return Response({"error": "category required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            chapter_content = extract_text(files)
            data = call_gemini_model(title, chapter_content)
            payload = {
                # user will be set by serializer.save(user=request.user)
                "title": data["chapter"]["title"] or title,
                "description": data["chapter"]["description"] or "",
                "category": category,
                "questions": data["questions"]
            }
            serializer = self.get_serializer(data=payload)
            serializer.is_valid(raise_exception=True)
            chapter = serializer.save(user=request.user)
            question_ids = list(chapter.questions.values_list("id", flat=True))
            result = {"chapter_id": chapter.id, "question_ids": question_ids}
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(result, status=status.HTTP_201_CREATED)