from rest_framework import serializers
from questions.serializers import QuestionSerializer
from .models import Chapter

class ChapterSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True)

    class Meta:
        model = Chapter
        fields = ['id', 'user', 'title', 'content', 'created_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        from django.db import transaction
        questions_data = validated_data.pop('questions')
        user = self.context['request'].user
        with transaction.atomic():
            chapter = Chapter.objects.create(user=user, **validated_data) # Create the chapter
            for question_data in questions_data: # Create each question
                # Extract choices data and create the question
                choices_data = question_data.pop('choices')
                question = Question.objects.create(chapter=chapter, **question_data)

                for choice_data in choices_data:
                    Choice.objects.create(question=question, **choice_data)
        return chapter
    
    
    # Alternatively, you can use the `create` method in the QuestionSerializer
    # def create(self, validated_data):
    # from django.db import transaction
    # from questions.models import Question, Choice

    # questions_data = validated_data.pop('questions')
    # user = self.context['request'].user
    # with transaction.atomic():
    #     chapter = Chapter.objects.create(user=user, **validated_data)

    #     # Prepare Question instances
    #     question_objs = []
    #     choices_map = []
    #     for question_data in questions_data:
    #         choices_data = question_data.pop('choices')
    #         question_obj = Question(chapter=chapter, **question_data)
    #         question_objs.append(question_obj)
    #         choices_map.append(choices_data)

    #     # Bulk create questions
    #     questions = Question.objects.bulk_create(question_objs)

    #     # Prepare Choice instances
    #     choice_objs = []
    #     for question, choices_data in zip(questions, choices_map):
    #         for choice_data in choices_data:
    #             choice_objs.append(Choice(question=question, **choice_data))

    #     # Bulk create choices
    #     Choice.objects.bulk_create(choice_objs)

    # return chapter
