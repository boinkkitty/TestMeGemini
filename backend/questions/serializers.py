from rest_framework import serializers
from .models import Question, Choice
from chapters.models import Chapter

class ChoiceSerializer(serializers.ModelSerializer):
    """Serializer for the Choice model."""
    class Meta:
        model = Choice
        fields = ['text', 'is_correct']

class QuestionSerializer(serializers.ModelSerializer):
    """Serializer for the Question model."""
    choices = ChoiceSerializer(many=True)

    class Meta:
        model = Question
        fields = ['id', 'chapter', 'question_text', 'question_type', 'choices', 'created_at']
        read_only_fields = ['id', 'created_at']

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
        choices_data = validated_data.pop('choices')
        question = Question.objects.create(**validated_data)
        for choice_data in choices_data:
            Choice.objects.create(question=question, **choice_data)
        return question

