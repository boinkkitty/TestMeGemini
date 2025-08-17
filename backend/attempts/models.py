from django.db import models

from chapters.models import Chapter
from questions.models import Choice, Question
from users.models import CustomUser

# Create your models here.

class ChapterAttempt(models.Model):
    """
    Model representing an attempt to answer questions in a chapter.
    """
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, related_name='attempts')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    score = models.FloatField(default=0.0)
    completed_at = models.DateTimeField(auto_now_add=True)
    order = models.JSONField(default=list)

class QuestionAttempt(models.Model):
    """Model representing an attempt to answer a question."""
    chapter_attempt = models.ForeignKey(ChapterAttempt, on_delete=models.CASCADE, related_name='question_attempts')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='question_attempts')
    selected_choices = models.ManyToManyField(Choice, related_name='question_attempts')
    score = models.FloatField(default=0.0)
    attempted_at = models.DateTimeField(auto_now_add=True)