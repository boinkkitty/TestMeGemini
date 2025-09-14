"""
Serializers for the chapters app.
Includes serializers for listing, creating, and retrieving chapters, with nested questions.
"""

from rest_framework import serializers
from questions.serializers import QuestionSerializer
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

class ChapterSerializer(ChapterBaseSerializer):
    """
    Serializer for retrieving and creating chapters, including nested questions.
    Handles creation of chapter and associated questions.
    """
    questions = QuestionSerializer(many=True)

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
        # Extract questions data from validated_data
        questions_data = validated_data.pop('questions', [])
        chapter = Chapter.objects.create(**validated_data)
        for question_data in questions_data:
            question_serializer = QuestionSerializer(data=question_data)
            if question_serializer.is_valid():
                question_serializer.save(chapter=chapter)
        return chapter

