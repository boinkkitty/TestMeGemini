"""
Models for the users app.
Defines the CustomUser model, extending Django's AbstractUser for email-based authentication.
"""

from django.db import models
from django.contrib.auth.models import AbstractUser
from .managers import CustomUserManager

class CustomUser(AbstractUser):
    """
    Custom user model using email as the unique identifier for authentication.
    Inherits from Django's AbstractUser.
    """
    USERNAME_FIELD = 'email'
    email = models.EmailField(unique=True)
    REQUIRED_FIELDS = []

    objects = CustomUserManager()