"""
Models for the questions app.
Defines models for questions and choices associated with chapters.
"""

from django.db import models
from chapters.models import Chapter
from .managers import QuestionQuerySet

class Question(models.Model):
    """
    Represents a question associated with a chapter.

    Fields:
        chapter (ForeignKey): The chapter this question belongs to.
        question_text (str): The text of the question.
        question_type (str): The type of question (MCQ, MRQ, TF).
        created_at (datetime): When the question was created.
    """
    class QuestionType(models.TextChoices):
        """Enumeration for question types."""
        MCQ = "MCQ", "Multiple Choice"
        MRQ = "MRQ", "Multiple Response"
        TF  = "TF",  "True/False"
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, related_name="questions")
    question_text = models.TextField()
    question_type = models.CharField(max_length=3, choices=QuestionType.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = QuestionQuerySet.as_manager()

class Choice(models.Model):
    """
    Represents a choice for a question.

    Fields:
        question (ForeignKey): The question this choice belongs to.
        text (str): The text of the choice.
        is_correct (bool): Whether this choice is correct.
    """
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)