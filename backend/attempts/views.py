"""
API views for the attempts app.
"""

from datetime import datetime, time, timedelta

from django.db.models import Count, Prefetch
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.generics import ListCreateAPIView, RetrieveAPIView
from rest_framework.response import Response

from .models import ChapterAttempt, QuestionAttempt
from .serializers import (
    ChapterAttemptDetailSerializer,
    ChapterAttemptFilterSerializer,
    ChapterAttemptInputSerializer,
    ChapterAttemptSerializer,
)
from .services import create_chapter_attempt


def _date_start(value):
    return timezone.make_aware(datetime.combine(value, time.min))


def _date_after(value):
    return timezone.make_aware(datetime.combine(value + timedelta(days=1), time.min))


class ChapterAttemptCreateListAPIView(ListCreateAPIView):
    """
    List and create chapter attempts for the authenticated user.
    """
    serializer_class = ChapterAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        filter_serializer = ChapterAttemptFilterSerializer(data=self.request.query_params)
        filter_serializer.is_valid(raise_exception=True)
        filters = filter_serializer.validated_data

        qs = (
            ChapterAttempt.objects
            .for_user(self.request.user)
            .select_related("chapter", "user")
            .annotate(question_attempt_count=Count("question_attempts"))
        )

        if "start_date" in filters:
            qs = qs.completed_on_or_after(_date_start(filters["start_date"]))
        if "end_date" in filters:
            qs = qs.completed_on_or_before(_date_after(filters["end_date"]))

        qs = qs.ordered_by_latest_completed()
        if "limit" in filters:
            qs = qs[:filters["limit"]]
        return qs

    def create(self, request, *args, **kwargs):
        input_serializer = ChapterAttemptInputSerializer(
            data=request.data,
            context=self.get_serializer_context(),
        )
        input_serializer.is_valid(raise_exception=True)
        chapter_attempt = create_chapter_attempt(
            user=request.user,
            validated_data=input_serializer.validated_data,
        )
        output_serializer = self.get_serializer(chapter_attempt)
        headers = self.get_success_headers(output_serializer.data)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class ChapterAttemptRetrieveAPIView(RetrieveAPIView):
    """
    Retrieve one chapter attempt for the authenticated user.
    """
    serializer_class = ChapterAttemptDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        question_attempts = (
            QuestionAttempt.objects
            .select_related("question")
            .prefetch_related(
                "selected_choices",
                Prefetch("question__choices"),
            )
            .order_by("attempted_at", "id")
        )
        return (
            ChapterAttempt.objects
            .filter(user=self.request.user)
            .select_related("chapter", "user")
            .prefetch_related(Prefetch("question_attempts", queryset=question_attempts))
            .annotate(question_attempt_count=Count("question_attempts"))
        )
