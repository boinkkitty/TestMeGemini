from django.db import models
from users.models import CustomUser

class Chapter(models.Model):
    """
    Model representing a chapter containing questions.
    """
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
