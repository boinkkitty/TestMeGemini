"""
API views for the chapters app.
Provides endpoints for listing, creating, retrieving, updating, and deleting chapters.
"""

from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework import parsers, serializers
from drf_spectacular.utils import OpenApiResponse, extend_schema, inline_serializer
from django.conf import settings
from django.db.models import Count
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
    POST: Creates a chapter and nested questions from JSON.
    """
    permission_classes = [IsAuthenticated]
    max_limit = settings.CHAPTER_LIST_LIMIT_MAX

    def get_queryset(self):
        """Return chapters belonging to current user with optional limit."""
        qs = (Chapter.objects
              .active_for_user(self.request.user)
              .annotate(question_count=Count("questions"))
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
        Create a chapter from nested JSON.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        chapter = serializer.save(user=request.user)
        return Response(ChapterDetailSerializer(chapter).data, status=201)


class ChapterGenerationAPIView(APIView):
    """Explicit endpoint for generating a chapter and questions from uploaded PDFs."""

    permission_classes = [IsAuthenticated]
    throttle_scope = "chapter_generation"
    parser_classes = [parsers.MultiPartParser]

    @extend_schema(
        tags=["Chapter generation"],
        summary="Generate a chapter quiz from PDF uploads",
        description=(
            "Synchronous operation: validates PDFs, extracts text, calls Gemini, "
            "and persists the chapter before returning 201. A future async design "
            "may turn this collection into a generation-job resource."
        ),
        request=inline_serializer(
            name="ChapterGenerationRequest",
            fields={
                "files": serializers.ListField(child=serializers.FileField(), min_length=1),
                "title": serializers.CharField(),
                "category": serializers.CharField(),
                "description": serializers.CharField(required=False, allow_blank=True),
                "question_count": serializers.ChoiceField(
                    choices=[10, 20, 30, 50], required=False
                ),
            },
        ),
        responses={
            201: inline_serializer(
                name="ChapterGenerationResponse",
                fields={
                    "chapter_id": serializers.IntegerField(),
                    "question_ids": serializers.ListField(child=serializers.IntegerField()),
                },
            ),
            400: OpenApiResponse(description="Invalid upload, metadata, PDF, or generation request."),
            401: OpenApiResponse(description="Authentication is required."),
            403: OpenApiResponse(description="A valid CSRF token is required."),
            429: OpenApiResponse(description="Generation rate limit exceeded."),
        },
    )
    def post(self, request, *args, **kwargs):
        result, status_code = generate_chapter_from_files(
            user=request.user,
            files=request.FILES.getlist("files"),
            title=request.data.get("title"),
            description=request.data.get("description"),
            category=request.data.get("category"),
            question_count=request.data.get("question_count"),
            request=request,
        )
        return Response(result, status=status_code)


class LegacyChapterListCreateAPIView(ChapterListCreateAPIView):
    """Compatibility-only endpoint retaining the former multipart upload behavior."""

    def get_throttles(self):
        self.throttle_scope = (
            "chapter_generation"
            if self.request.method == "POST" and self.request.FILES.getlist("files")
            else None
        )
        return super().get_throttles()

    def create(self, request, *args, **kwargs):
        files = request.FILES.getlist("files")
        if files:
            result, status_code = generate_chapter_from_files(
                user=request.user,
                files=files,
                title=request.data.get("title"),
                description=request.data.get("description"),
                category=request.data.get("category"),
                question_count=request.data.get("question_count"),
                request=request,
            )
            return Response(result, status=status_code)
        return super().create(request, *args, **kwargs)


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
