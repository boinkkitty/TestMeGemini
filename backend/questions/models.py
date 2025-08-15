from django.db import models
from users.models import CustomUser
from chapters.models import Chapter

class Question(models.Model):
    """Model representing a question associated with a chapter."""
    class QuestionType(models.TextChoices):
        """Enumeration for question types."""
        MCQ = "MCQ", "Multiple Choice"
        MRQ = "MRQ", "Multiple Response"
        TF  = "TF",  "True/False"
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, related_name="questions")
    question_text = models.TextField()
    question_type = models.CharField(max_length=3, choices=QuestionType.choices)
    created_at = models.DateTimeField(auto_now_add=True)

class Choice(models.Model):
    """Model representing a choice for a question."""
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)