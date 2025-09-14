"""
Models for the chapters app.
Defines the Chapter model, representing a chapter containing questions and owned by a user.
"""

from django.db import models
from users.models import CustomUser
from .managers import ChapterQuerySet

class Chapter(models.Model):
    """
    Represents a chapter containing questions, owned by a user.

    Fields:
        user (ForeignKey): The user who owns the chapter.
        title (str): The title of the chapter.
        description (str): The description of the chapter.
        category (str): The category this chapter belongs to.
        created_at (datetime): The date and time the chapter was created.
        is_deleted (bool): Whether the chapter is soft-deleted.
    """

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    is_deleted = models.BooleanField(default=False)

    objects = ChapterQuerySet.as_manager()
