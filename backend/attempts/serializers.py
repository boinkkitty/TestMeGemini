"""
Serializers for the attempts app.
Includes serializers for chapter attempts and question attempts.
"""

from attempts.models import ChapterAttempt, QuestionAttempt
from chapters.models import Chapter
from questions.models import Choice
from questions.serializers import QuestionSerializer
from questions.models import Question
from rest_framework import serializers

class QuestionAttemptSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and displaying question attempts.
    Handles setting selected choices and nested question details.
    """
    question = serializers.PrimaryKeyRelatedField(queryset=Question.objects.all())
    question_detail = QuestionSerializer(source='question', read_only=True)
    selected_choices = serializers.PrimaryKeyRelatedField(
        queryset=Choice.objects.all(),
        many=True
    )
    # user is not needed here, it's on ChapterAttempt

    class Meta:
        model = QuestionAttempt
        fields = ['id', 'chapter_attempt', 'question', 'question_detail', 'selected_choices', 'score', 'attempted_at']
        read_only_fields = ['id', 'attempted_at', 'question_detail']

    def create(self, validated_data):
        """
        Create a QuestionAttempt instance and set selected choices.
        Args:
            validated_data (dict): Validated data for the question attempt.
        Returns:
            QuestionAttempt: The created question attempt instance.
        """
        selected_choices_data = validated_data.pop('selected_choices')
        question_attempt = QuestionAttempt.objects.create(**validated_data)
        question_attempt.selected_choices.set(selected_choices_data)
        return question_attempt

class ChapterAttemptBaseSerializer(serializers.ModelSerializer):
    """
    Base serializer for chapter attempts, including chapter info and user.
    """

    title = serializers.SerializerMethodField(read_only=True)
    category = serializers.SerializerMethodField(read_only=True)

    def get_title(self, obj):
        """
        Get the title of the related chapter.
        """
        return obj.chapter.title if obj.chapter else None

    def get_category(self, obj):
        """
        Get the category of the related chapter.
        """
        return obj.chapter.category if obj.chapter else None

    chapter_id = serializers.PrimaryKeyRelatedField(
        source='chapter',
        queryset=Chapter.objects.all(),
    )
    order = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=True
    )
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    max_score = serializers.SerializerMethodField(read_only=True)

    def get_max_score(self, obj):
        """
        Get the maximum possible score for the attempt.
        """
        return obj.question_attempts.count() if hasattr(obj, 'question_attempts') else 0

    class Meta:
        model = ChapterAttempt
        fields = ['id', 'chapter_id', 'title', 'category', 'user', 'score', 'completed_at', 'max_score']
        read_only_fields = ['id', 'completed_at', 'title', 'category', 'max_score']

class ChapterAttemptSerializer(ChapterAttemptBaseSerializer):
    """
    Serializer for creating and displaying chapter attempts.
    """
    pass

class ChapterAttemptDetailSerializer(ChapterAttemptBaseSerializer):
    question_attempts = serializers.SerializerMethodField(read_only=True)

    def get_question_attempts(self, obj):
        attempts = obj.question_attempts.order_by('attempted_at')
        return QuestionAttemptSerializer(attempts, many=True).data

    class Meta(ChapterAttemptBaseSerializer.Meta):
        fields = ChapterAttemptBaseSerializer.Meta.fields + ['question_attempts']