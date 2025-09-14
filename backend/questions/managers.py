"""
Custom queryset for the questions app.
Provides query methods for Question.
"""

from django.db import models

class QuestionQuerySet(models.QuerySet):
    def for_chapter(self, chapter_id):
        """Filter questions by chapter."""
        return self.filter(chapter_id=chapter_id)

    def for_user(self, user):
        """Filter questions by chapter owner (user)."""
        return self.filter(chapter__user=user)

    def random_ordered(self):
        """Order questions randomly."""
        return self.order_by('?')

    def limit_by(self, limit):
        """Limit the queryset to a given number of results."""
        if limit and str(limit).isdigit() and int(limit) > 0:
            return self[:int(limit)]
        return self
