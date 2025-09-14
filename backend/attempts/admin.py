"""
Admin configuration for the attempts app.
Registers the ChapterAttempt and QuestionAttempt models with the Django admin site.
"""

from django.contrib import admin
from .models import ChapterAttempt, QuestionAttempt

admin.site.register(ChapterAttempt)
admin.site.register(QuestionAttempt)
