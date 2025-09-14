"""
Admin configuration for the questions app.
Registers the Question and Choice models with the Django admin site.
"""

from django.contrib import admin
from .models import Question, Choice

admin.site.register(Question)
admin.site.register(Choice)
