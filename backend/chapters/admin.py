"""
Admin configuration for the chapters app.
Registers the Chapter model with the Django admin site.
"""

from django.contrib import admin
from .models import Chapter

admin.site.register(Chapter)
