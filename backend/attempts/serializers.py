from backend.attempts.models import ChapterAttempt, QuestionAttempt
from backend.chapters.models import Chapter
from backend.questions.models import Choice
from backend.questions.serializers import ChoiceSerializer
from rest_framework import serializers

class ChapterAttemptSerializer(serializers.ModelSerializer):
    """
    Serializer for the ChapterAttempt model.
    """
    chapter_id = serializers.PrimaryKeyRelatedField(
        source='chapter',   # Map to the chapter field
        queryset=Chapter.objects.all()
    )

    class Meta:
        model = ChapterAttempt
        fields = ['id', 'chapter_id', 'user', 'score', 'attempted_at', 'order']
        read_only_fields = ['id', 'attempted_at']

class QuestionAttemptSerializer(serializers.ModelSerializer):
    """
    Serializer for the QuestionAttempt model.
    """
    selected_choices = serializers.PrimaryKeyRelatedField(
        queryset=Choice.objects.all(),
        many=True
    )

    class Meta:
        model = QuestionAttempt
        fields = ['id', 'chapter_attempt', 'question', 'selected_choices', 'score', 'attempted_at']
        read_only_fields = ['id', 'attempted_at']

    def create(self, validated_data):
        selected_choices_data = validated_data.pop('selected_choices')
        question_attempt = QuestionAttempt.objects.create(**validated_data)
        question_attempt.selected_choices.set(selected_choices_data)
        return question_attempt
    

