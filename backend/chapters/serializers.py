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

            choice_instances = [Choice(question=question, **c) for c in choices_data]
            Choice.objects.bulk_create(choice_instances)  

        return chapter
    
        # questions_data = validated_data.pop('questions', [])
        # chapter = Chapter.objects.create(**validated_data)

        # for question_data in questions_data:
        #     choices_data = question_data.pop('choices', [])
        #     question = QuestionSerializer.create(QuestionSerializer(), validated_data=question_data)
        #     question.chapter = chapter
        #     question.save()

        #     for choice_data in choices_data:
        #         choice = ChoiceSerializer.create(ChoiceSerializer(), validated_data=choice_data)
        #         choice.question = question
        #         choice.save()

        # return chapter

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
