from backend import questions
from rest_framework import serializers
from questions.serializers import QuestionSerializer
from .models import Chapter
from questions.models import Choice, Question

class ChapterSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True)

    class Meta:
        model = Chapter
        fields = ['id', 'user', 'title', 'content', 'created_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        """Create a Chapter instance with associated questions."""
        # Extract questions data from validated_data
        questions_data = validated_data.pop('questions', [])
        chapter = Chapter.objects.create(**validated_data)  # Create the chapter instance

        # Validate and create questions
        for question_data in questions_data:
            question_serializer = QuestionSerializer(data=question_data)
            if not question_serializer.is_valid():
                continue  # Skip invalid questions

            valid_data = question_serializer.validated_data
            choices_data = valid_data.pop('choices')
            question = Question.objects.create(chapter=chapter, **valid_data)

            # Create choices for the question
            choice_instances = [Choice(question=question, **c) for c in choices_data]
            Choice.objects.bulk_create(choice_instances)  

        return chapter

