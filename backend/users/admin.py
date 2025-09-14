"""
Admin configuration for the users app.
Registers the CustomUser model with the Django admin site.
"""

from django.contrib import admin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    """
    Admin configuration for the CustomUser model.
    """
    pass
