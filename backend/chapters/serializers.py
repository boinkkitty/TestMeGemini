from backend import questions
from rest_framework import serializers
from questions.serializers import QuestionSerializer
from .models import Chapter
from questions.models import Choice, Question

class ChapterSerializer(serializers.ModelSerializer):
    """
    Serializer for the Chapter model, including nested questions.
    """
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
            if question_serializer.is_valid():
                question_serializer.save(chapter=chapter)
        return chapter

