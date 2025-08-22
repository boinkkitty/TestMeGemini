from attempts.models import ChapterAttempt, QuestionAttempt
from chapters.models import Chapter
from questions.models import Choice
from questions.serializers import ChoiceSerializer, QuestionSerializer
from questions.models import Question
from rest_framework import serializers

class QuestionAttemptSerializer(serializers.ModelSerializer):
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
        selected_choices_data = validated_data.pop('selected_choices')
        question_attempt = QuestionAttempt.objects.create(**validated_data)
        question_attempt.selected_choices.set(selected_choices_data)
        return question_attempt

class ChapterAttemptBaseSerializer(serializers.ModelSerializer):

    title = serializers.SerializerMethodField(read_only=True)
    category = serializers.SerializerMethodField(read_only=True)

    def get_title(self, obj):
        return obj.chapter.title if obj.chapter else None
    
    def get_category(self, obj):
        return obj.chapter.category if obj.chapter else None

    chapter_id = serializers.PrimaryKeyRelatedField(
        source='chapter',
        queryset=Chapter.objects.all()
    )
    order = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=True
    )
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = ChapterAttempt
        fields = ['id', 'chapter_id', 'title', 'category', 'user', 'score', 'completed_at', 'order']
        read_only_fields = ['id', 'completed_at', 'title', 'category']

class ChapterAttemptSerializer(ChapterAttemptBaseSerializer):
    pass

class ChapterAttemptDetailSerializer(ChapterAttemptBaseSerializer):
    question_attempts = QuestionAttemptSerializer(many=True, read_only=True)

    class Meta(ChapterAttemptBaseSerializer.Meta):
        fields = ChapterAttemptBaseSerializer.Meta.fields + ['question_attempts']