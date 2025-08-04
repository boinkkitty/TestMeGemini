from django.db import models
from users.models import User
from chapters.models import Chapter

class Question(models.Model):
    QUESTION_TYPE_CHOICES = [
        ('MCQ', 'Multiple Choice Question'),
        ('MRQ', 'Multi Response Question'),
        ('TF', 'True/False')
    ]
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE)
    question_text = models.TextField()
    question_type = models.CharField(max_length=3, choices=QUESTION_TYPE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)