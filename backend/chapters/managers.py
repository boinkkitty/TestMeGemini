"""
Custom queryset and manager helpers for Chapter model.
Provides chainable filters for cleaner view logic.
"""
from django.db import models

class ChapterQuerySet(models.QuerySet):
    def for_user(self, user):
        return self.filter(user=user)

    def not_deleted(self):
        return self.filter(is_deleted=False)

    def active_for_user(self, user):
        return self.for_user(user).not_deleted()

    def ordered_by_created(self):
        return self.order_by('-created_at')
