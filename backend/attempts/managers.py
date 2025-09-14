"""
Custom queryset for the attempts app.
Provides query methods for ChapterAttempt and QuestionAttempt.
"""

from django.db import models
from django.db.models import Q

class ChapterAttemptQuerySet(models.QuerySet):
    def for_user(self, user):
        """Filter attempts for a specific user."""
        return self.filter(user=user)

    def completed_on_or_after(self, date):
        """Filter attempts completed on or after a given date (inclusive)."""
        if date:
            return self.filter(completed_at__date__gte=date)
        return self

    def completed_on_or_before(self, date):
        """Filter attempts completed on or before a given date (inclusive)."""
        if date:
            return self.filter(completed_at__date__lte=date)
        return self

    def ordered_by_latest_completed(self):
        return self.order_by('-completed_at')
