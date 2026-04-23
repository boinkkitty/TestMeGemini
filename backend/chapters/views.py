"""
API views for the chapters app.
Provides endpoints for listing, creating, retrieving, updating, and deleting chapters.
"""

import logging
from django.conf import settings as django_settings
from rest_framework import status
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Chapter
from .serializers import ChapterSerializer, ChapterListSerializer
from api.utils.ai import call_gemini_model
from api.utils.pdf import extract_text
from api.throttles import ChapterCreateThrottle
from .services import create_chapter_and_questions_atomic

logger = logging.getLogger(__name__)


class ChapterListCreateAPIView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_throttles(self):
        if self.request.method == 'POST':
            return [ChapterCreateThrottle()]
        return super().get_throttles()

    def get_queryset(self):
        """Return chapters belonging to current user with optional limit."""
        qs = (Chapter.objects
              .for_user(self.request.user)
              .not_deleted()
              .ordered_by_created())
        limit = self.request.query_params.get('limit')
        if limit:
            try:
                limit_val = int(limit)
                if limit_val > 0:
                    return qs[:limit_val]
            except (ValueError, TypeError):
                pass
        return qs

    def get_serializer_class(self):
        """
        Returns the serializer class based on request method.
        """
        if self.request.method == "GET":
            return ChapterListSerializer
        return ChapterSerializer

    def create(self, request, *args, **kwargs):
        files = request.FILES.getlist("files")
        title = request.data.get("title")
        category = request.data.get("category")
        if not files or not title or not category:
            return Response(
                {"error": "Missing required fields: files, title, category."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        max_size = django_settings.MAX_PDF_FILE_SIZE_MB * 1024 * 1024
        for f in files:
            if f.size > max_size:
                return Response(
                    {"error": f"File '{f.name}' exceeds {django_settings.MAX_PDF_FILE_SIZE_MB}MB limit."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        chapter_content = extract_text(files, max_pages=django_settings.MAX_PDF_PAGES)
        data = call_gemini_model(title, chapter_content)
        payload = {
            "title": title,
            "description": data["chapter"]["description"] or "",
            "category": category,
            "questions": data["questions"],
        }
        result, status_code = create_chapter_and_questions_atomic(
            user=request.user,
            payload=payload,
            request=request,
        )
        return Response(result, status=status_code)
    
class ChapterRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    """
    API endpoint for retrieving, updating, and deleting a chapter.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ChapterSerializer
    queryset = Chapter.objects.all()
    lookup_field = "id"

    def get_queryset(self):
        """
        Returns queryset of chapters for the current user.
        """
        return Chapter.objects.filter(user=self.request.user, is_deleted=False)
    
    def update(self, request, *args, **kwargs):
        """
        Handles updating a chapter. Only soft update of is_deleted is allowed.
        """
        # Only allow soft update of is_deleted
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        is_deleted = request.data.get('is_deleted', None)
        if is_deleted is not None:
            instance.is_deleted = is_deleted
            instance.save()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        # Otherwise, do normal update
        return super().update(request, *args, **kwargs)