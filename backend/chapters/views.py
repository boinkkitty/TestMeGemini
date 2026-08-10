"""
API views for the chapters app.
Provides endpoints for listing, creating, retrieving, updating, and deleting chapters.
"""

from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from rest_framework.views import APIView
from django.conf import settings
from .models import Chapter
from .serializers import (
    ChapterCreateSerializer,
    ChapterDetailSerializer,
    ChapterListSerializer,
    ChapterUpdateSerializer,
)
from .services import generate_chapter_from_files

class ChapterListCreateAPIView(ListCreateAPIView):
    """
    API endpoint for listing and creating chapters for the authenticated user.
    GET: Returns a list of chapters (optionally limited).
    POST: Creates a new chapter with uploaded files and category, using AI to generate questions.
    """
    permission_classes = [IsAuthenticated]
    max_limit = settings.CHAPTER_LIST_LIMIT_MAX

    def get_throttles(self):
        # Preserve the legacy upload route without letting it bypass the
        # stricter generation quota used by the dedicated endpoint.
        self.throttle_scope = (
            "chapter_generation"
            if self.request.method == "POST" and self.request.FILES.getlist("files")
            else None
        )
        return super().get_throttles()

    def get_queryset(self):
        """Return chapters belonging to current user with optional limit."""
        qs = (Chapter.objects
              .active_for_user(self.request.user)
              .ordered_by_created())
        limit = self.request.query_params.get('limit')
        limit_val = self._bounded_limit(limit)
        if limit_val:
            return qs[:limit_val]
        return qs

    def get_serializer_class(self):
        """
        Returns the serializer class based on request method.
        """
        if self.request.method == "GET":
            return ChapterListSerializer
        return ChapterCreateSerializer

    def _bounded_limit(self, value):
        if value is None:
            return self.max_limit
        try:
            parsed = int(value)
        except (TypeError, ValueError):
            raise ValidationError({"limit": "Must be a positive integer."})
        if parsed <= 0:
            raise ValidationError({"limit": "Must be a positive integer."})
        return min(parsed, self.max_limit)

    def create(self, request, *args, **kwargs):
        """
        Create a chapter from nested JSON, or route legacy file uploads through generation.
        """
        files = request.FILES.getlist("files")
        if files:
            result, status_code = generate_chapter_from_files(
                user=request.user,
                files=files,
                title=request.data.get("title"),
                category=request.data.get("category"),
                request=request,
            )
            return Response(result, status=status_code)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        chapter = serializer.save(user=request.user)
        return Response(ChapterDetailSerializer(chapter).data, status=201)


class ChapterGenerationAPIView(APIView):
    """Explicit endpoint for generating a chapter and questions from uploaded PDFs."""

    permission_classes = [IsAuthenticated]
    throttle_scope = "chapter_generation"

    def post(self, request, *args, **kwargs):
        result, status_code = generate_chapter_from_files(
            user=request.user,
            files=request.FILES.getlist("files"),
            title=request.data.get("title"),
            category=request.data.get("category"),
            request=request,
        )
        return Response(result, status=status_code)
    
class ChapterRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    """
    API endpoint for retrieving, updating, and deleting a chapter.
    """
    permission_classes = [IsAuthenticated]
    queryset = Chapter.objects.all()
    lookup_field = "id"

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return ChapterUpdateSerializer
        return ChapterDetailSerializer

    def get_queryset(self):
        """
        Returns queryset of chapters for the current user.
        """
        return Chapter.objects.active_for_user(self.request.user).prefetch_related("questions__choices")

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save(update_fields=["is_deleted"])
