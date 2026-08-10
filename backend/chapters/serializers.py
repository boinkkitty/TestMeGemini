"""
Serializers for the chapters app.
Includes serializers for listing, creating, and retrieving chapters, with nested questions.
"""

from django.conf import settings
from django.db import transaction
from rest_framework import serializers
from questions.serializers import QuestionReadSerializer, QuestionWriteSerializer
from .models import Chapter

class ChapterBaseSerializer(serializers.ModelSerializer):
    """
    Base serializer for the Chapter model, including user and basic fields.
    """

    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Chapter
        fields = ['id', 'user', 'title', 'description', 'category', 'created_at']
        read_only_fields = ['id', 'created_at']

class ChapterListSerializer(ChapterBaseSerializer):
    """
    Serializer for listing chapters (no nested questions).
    """
    pass


class ChapterDetailSerializer(ChapterBaseSerializer):
    """Safe chapter detail serializer with answer-secrecy preserving questions."""

    questions = QuestionReadSerializer(many=True, read_only=True)

    class Meta(ChapterBaseSerializer.Meta):
        fields = ChapterBaseSerializer.Meta.fields + ['questions']


class ChapterCreateSerializer(ChapterBaseSerializer):
    """
    Serializer for creating chapters with nested questions.
    """
    questions = QuestionWriteSerializer(
        many=True,
        min_length=1,
        max_length=settings.CHAPTER_QUESTION_LIMIT_MAX,
    )

    class Meta(ChapterBaseSerializer.Meta):
        fields = ChapterBaseSerializer.Meta.fields + ['questions']

    def create(self, validated_data):
        """
        Create a Chapter instance with associated questions.

        Args:
            validated_data (dict): Validated data including questions.
        Returns:
            Chapter: The created Chapter instance.
        """
        questions_data = validated_data.pop('questions')
        with transaction.atomic():
            chapter = Chapter.objects.create(**validated_data)
            for question_data in questions_data:
                QuestionWriteSerializer().create({**question_data, "chapter": chapter})
        return chapter


class ChapterUpdateSerializer(ChapterBaseSerializer):
    """Serializer for normal chapter PUT/PATCH without writable nested questions."""

    class Meta(ChapterBaseSerializer.Meta):
        fields = ChapterBaseSerializer.Meta.fields


class ChapterSerializer(ChapterDetailSerializer):
    """Backward-compatible safe read serializer name."""
    pass
