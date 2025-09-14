"""
Models for the attempts app.
Defines models for chapter attempts and question attempts.
"""

from django.db import models

from chapters.models import Chapter
from questions.models import Choice, Question
from users.models import CustomUser
from .managers import ChapterAttemptQuerySet

class ChapterAttempt(models.Model):
    """
    Represents an attempt to answer questions in a chapter by a user.

    Fields:
        chapter (ForeignKey): The chapter being attempted.
        user (ForeignKey): The user making the attempt.
        score (float): The total score for the attempt.
        completed_at (datetime): When the attempt was completed.
    """
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, related_name='attempts')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    score = models.FloatField(default=0.0)
    completed_at = models.DateTimeField(auto_now_add=True)

    objects = ChapterAttemptQuerySet.as_manager()

class QuestionAttempt(models.Model):
    """
    Represents an attempt to answer a single question within a chapter attempt.

    Fields:
        chapter_attempt (ForeignKey): The related chapter attempt.
        question (ForeignKey): The question being answered.
        selected_choices (ManyToMany): The choices selected by the user.
        score (float): The score for this question.
        attempted_at (datetime): When the question was attempted.
    """
    chapter_attempt = models.ForeignKey(ChapterAttempt, on_delete=models.CASCADE, related_name='question_attempts')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='question_attempts')
    selected_choices = models.ManyToManyField(Choice, related_name='question_attempts')
    score = models.FloatField(default=0.0)
    attempted_at = models.DateTimeField(auto_now_add=True)