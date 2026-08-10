"""
Serializers for the questions app.
Includes serializers for questions and choices, with validation for question types and choices.
"""

from django.conf import settings
from rest_framework import serializers
from .models import Question, Choice

class ChoiceReadSerializer(serializers.ModelSerializer):
    """Safe choice serializer for quiz reads before submission."""

    class Meta:
        model = Choice
        fields = ['id', 'text']
        read_only_fields = ['id', 'text']


class ChoiceReviewSerializer(serializers.ModelSerializer):
    """
    Internal/review serializer for the Choice model, including correctness.
    """

    class Meta:
        model = Choice
        fields = ['id', 'text', 'is_correct']
        read_only_fields = ['id']


class QuestionReadSerializer(serializers.ModelSerializer):
    """Safe question serializer for quiz reads before submission."""

    choices = ChoiceReadSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'chapter', 'question_text', 'question_type', 'choices', 'created_at']
        read_only_fields = fields


class QuestionWriteSerializer(serializers.ModelSerializer):
    """
    Write/internal serializer for questions, including nested correctness data.
    """
    choices = ChoiceReviewSerializer(
        many=True,
        max_length=settings.QUESTION_CHOICE_LIMIT_MAX,
    )

    class Meta:
        model = Question
        fields = ['id', 'chapter', 'question_text', 'question_type', 'choices', 'created_at']
        read_only_fields = ['id', 'created_at', 'chapter']

    def validate(self, data):
        """
        Validate the question type and choices.
        MCQ and True/False must have exactly one correct choice.
        MCQ must have at least two choices.
        True/False must have exactly two choices.
        MRQ must have at least one correct choice and at least three choices.
        """
        
        q_type = data["question_type"]
        choices = data.get("choices", [])
        correct_count = sum(1 for c in choices if c.get("is_correct"))

        if q_type == Question.QuestionType.MRQ:
            if len(choices) < 3:
                raise serializers.ValidationError("MRQ must have at least 3 choices.")
            if correct_count < 1:
                raise serializers.ValidationError("MRQ must have at least one correct choice.")

        elif q_type == Question.QuestionType.MCQ:
            if len(choices) < 2:
                raise serializers.ValidationError("MCQ must have at least 2 choices.")
            if correct_count != 1:
                raise serializers.ValidationError("MCQ must have exactly one correct choice.")

        elif q_type == Question.QuestionType.TF:
            if len(choices) != 2:
                raise serializers.ValidationError("True/False must have exactly 2 choices.")
            if correct_count != 1:
                raise serializers.ValidationError("True/False must have exactly one correct choice.")

        else:
            raise serializers.ValidationError("Invalid question type.")

        return data

    def create(self, validated_data):
        """
        Create a Question instance with associated choices.
        This method expects 'choices' to be part of validated_data.
        It creates the Question instance and then creates Choice instances for each choice.
        """

        choices_data = validated_data.pop('choices')
        question = Question.objects.create(**validated_data)
        choice_instances = [Choice(question=question, **choice_data) for choice_data in choices_data]
        Choice.objects.bulk_create(choice_instances)
        return question


class QuestionReviewSerializer(QuestionWriteSerializer):
    """Explicit correctness-bearing serializer for trusted review contexts."""
    pass


# Public default stays safe for consumers that render question details.
QuestionSerializer = QuestionReadSerializer
