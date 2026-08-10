"""
Serializers for the attempts app.
"""

from chapters.models import Chapter
from questions.models import Choice, Question
from questions.serializers import QuestionReviewSerializer
from rest_framework import serializers
from django.conf import settings

from attempts.models import ChapterAttempt, QuestionAttempt


class AttemptQuestionInputSerializer(serializers.Serializer):
    question_id = serializers.IntegerField(min_value=1)
    selected_choices = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        allow_empty=True,
    )

    def validate_selected_choices(self, value):
        if len(value) != len(set(value)):
            raise serializers.ValidationError("Duplicate choice IDs are not allowed.")
        return value


class ChapterAttemptInputSerializer(serializers.Serializer):
    chapter_id = serializers.IntegerField(min_value=1)
    order = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        allow_empty=False,
        max_length=settings.CHAPTER_QUESTION_LIMIT_MAX,
    )
    questions = AttemptQuestionInputSerializer(
        many=True,
        allow_empty=False,
        max_length=settings.CHAPTER_QUESTION_LIMIT_MAX,
    )

    def validate_order(self, value):
        if len(value) != len(set(value)):
            raise serializers.ValidationError("Duplicate question IDs are not allowed.")
        return value

    def validate(self, attrs):
        request = self.context["request"]
        user = request.user

        try:
            chapter = Chapter.objects.get(
                id=attrs["chapter_id"],
                user=user,
                is_deleted=False,
            )
        except Chapter.DoesNotExist as exc:
            raise serializers.ValidationError({"chapter_id": "Chapter not found."}) from exc

        question_payloads = attrs["questions"]
        question_ids = [item["question_id"] for item in question_payloads]
        if len(question_ids) != len(set(question_ids)):
            raise serializers.ValidationError({"questions": "Duplicate question IDs are not allowed."})

        order_ids = attrs["order"]
        if set(order_ids) != set(question_ids):
            raise serializers.ValidationError(
                {"order": "Order must contain exactly the submitted question IDs."}
            )

        questions = (
            Question.objects
            .filter(id__in=question_ids, chapter=chapter)
            .prefetch_related("choices")
        )
        question_map = {question.id: question for question in questions}
        missing_question_ids = sorted(set(question_ids) - set(question_map))
        if missing_question_ids:
            raise serializers.ValidationError(
                {"questions": f"Unknown or out-of-chapter question IDs: {missing_question_ids}."}
            )

        choice_ids = {
            choice_id
            for item in question_payloads
            for choice_id in item["selected_choices"]
        }
        choice_map = {
            choice.id: choice
            for choice in Choice.objects.filter(id__in=choice_ids)
        }
        missing_choice_ids = sorted(choice_ids - set(choice_map))
        if missing_choice_ids:
            raise serializers.ValidationError(
                {"questions": f"Unknown choice IDs: {missing_choice_ids}."}
            )

        for item in question_payloads:
            question = question_map[item["question_id"]]
            question_choice_ids = {choice.id for choice in question.choices.all()}
            out_of_question_choices = sorted(set(item["selected_choices"]) - question_choice_ids)
            if out_of_question_choices:
                raise serializers.ValidationError(
                    {
                        "questions": (
                            f"Choices {out_of_question_choices} do not belong to "
                            f"question {question.id}."
                        )
                    }
                )

        attrs["chapter"] = chapter
        attrs["question_map"] = question_map
        return attrs


class ChapterAttemptFilterSerializer(serializers.Serializer):
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)
    limit = serializers.IntegerField(
        required=False,
        min_value=1,
        max_value=settings.ATTEMPT_LIST_LIMIT_MAX,
        default=settings.ATTEMPT_LIST_LIMIT_MAX,
    )

    def validate(self, attrs):
        start_date = attrs.get("start_date")
        end_date = attrs.get("end_date")
        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError("start_date must be on or before end_date.")
        return attrs


class QuestionAttemptSerializer(serializers.ModelSerializer):
    question_detail = serializers.SerializerMethodField(read_only=True)
    selected_choices = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = QuestionAttempt
        fields = [
            "id",
            "chapter_attempt",
            "question",
            "question_detail",
            "selected_choices",
            "score",
            "attempted_at",
        ]
        read_only_fields = fields

    def get_question_detail(self, obj):
        if obj.question_snapshot:
            return obj.question_snapshot
        return QuestionReviewSerializer(obj.question).data

    def get_selected_choices(self, obj):
        if obj.question_snapshot:
            return obj.selected_choices_snapshot
        return [choice.id for choice in obj.selected_choices.all()]


class ChapterAttemptSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source="chapter.title", read_only=True)
    category = serializers.CharField(source="chapter.category", read_only=True)
    chapter_id = serializers.IntegerField(source="chapter.id", read_only=True)
    max_score = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ChapterAttempt
        fields = [
            "id",
            "chapter_id",
            "title",
            "category",
            "score",
            "completed_at",
            "max_score",
        ]
        read_only_fields = fields

    def get_max_score(self, obj):
        annotated_count = getattr(obj, "question_attempt_count", None)
        if annotated_count is not None:
            return annotated_count

        prefetched = getattr(obj, "_prefetched_objects_cache", {})
        if "question_attempts" in prefetched:
            return len(prefetched["question_attempts"])

        return obj.question_attempts.count()


class ChapterAttemptDetailSerializer(ChapterAttemptSerializer):
    question_attempts = serializers.SerializerMethodField(read_only=True)

    def get_question_attempts(self, obj):
        attempts = obj.question_attempts.all()
        return QuestionAttemptSerializer(attempts, many=True).data

    class Meta(ChapterAttemptSerializer.Meta):
        fields = ChapterAttemptSerializer.Meta.fields + ["question_attempts"]
