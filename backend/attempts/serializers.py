from attempts.models import ChapterAttempt, QuestionAttempt
from chapters.models import Chapter
from questions.models import Choice
from questions.serializers import ChoiceSerializer, QuestionSerializer
from rest_framework import serializers

class QuestionAttemptSerializer(serializers.ModelSerializer):
    question = QuestionSerializer(read_only=True)
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

class ChapterAttemptBaseSerializer(serializers.ModelSerializer):

    title = serializers.SerializerMethodField(read_only=True)

    def get_title(self, obj):
        return obj.chapter.title if obj.chapter else None

    chapter_id = serializers.PrimaryKeyRelatedField(
        source='chapter',
        queryset=Chapter.objects.all()
    )
    order = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=True
    )

    class Meta:
        model = ChapterAttempt
        fields = ['id', 'chapter_id', 'title', 'user', 'score', 'attempted_at', 'order']
        read_only_fields = ['id', 'attempted_at', 'title']

class ChapterAttemptSerializer(ChapterAttemptBaseSerializer):
    pass

class ChapterAttemptDetailSerializer(ChapterAttemptBaseSerializer):
    question_attempts = QuestionAttemptSerializer(many=True, read_only=True)

    class Meta(ChapterAttemptBaseSerializer.Meta):
        fields = ChapterAttemptBaseSerializer.Meta.fields + ['question_attempts']