
import logging
from rest_framework import status
from rest_framework.generics import ListCreateAPIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from .models import Chapter
from .serializers import ChapterSerializer, ChapterListSerializer
from api.utils.ai import call_gemini_model
from api.utils.pdf import extract_text

logger = logging.getLogger(__name__)

class ChapterListCreateAPIView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Chapter.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.request.method == "GET":
            return ChapterListSerializer
        return ChapterSerializer

    def create(self, request, *args, **kwargs):
        logger.info("[ChapterCreate] Incoming request from user: %s", request.user)
        files = request.FILES.getlist("files")
        title = request.data.get("title")
        category = request.data.get("category")
        logger.info("[ChapterCreate] Received files: %s", [f.name for f in files])
        logger.info("[ChapterCreate] Title: %s, Category: %s", title, category)
        if not files:
            logger.warning("[ChapterCreate] No files provided.")
            return Response({"error": "file required"}, status=status.HTTP_400_BAD_REQUEST)
        if not title:
            logger.warning("[ChapterCreate] No title provided.")
            return Response({"error": "title required"}, status=status.HTTP_400_BAD_REQUEST)
        if not category:
            logger.warning("[ChapterCreate] No category provided.")
            return Response({"error": "category required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            logger.info("[ChapterCreate] Extracting text from files...")
            chapter_content = extract_text(files)
            logger.info("[ChapterCreate] Extracted text length: %d", len(chapter_content) if chapter_content else 0)
            logger.info("[ChapterCreate] Calling Gemini model...")
            data = call_gemini_model(title, chapter_content)
            logger.info("[ChapterCreate] Gemini model response length: %s", len(str(data)))
            logger.info("[ChapterCreate] Gemini model response: %s", str(data)[:500])
            payload = {
                # user will be set by serializer.save(user=request.user)
                "title": title,
                "description": data["chapter"]["description"] or "",
                "category": category,
                "questions": data["questions"]
            }
            logger.info("[ChapterCreate] Payload for serializer: %s", payload)
            serializer = self.get_serializer(data=payload)
            serializer.is_valid(raise_exception=True)
            chapter = serializer.save(user=request.user)
            question_ids = list(chapter.questions.values_list("id", flat=True))
            result = {"chapter_id": chapter.id, "question_ids": question_ids}
            logger.info("[ChapterCreate] Chapter created with ID: %s, Questions: %s", chapter.id, question_ids)
        except Exception as e:
            logger.error("[ChapterCreate] Exception: %s", str(e), exc_info=True)
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(result, status=status.HTTP_201_CREATED)