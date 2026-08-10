import random
from django.db import models

class QuestionQuerySet(models.QuerySet):
    def for_chapter(self, chapter_id):
        """Filter questions by chapter."""
        return self.filter(chapter_id=chapter_id)

    def for_user(self, user):
        """Filter questions by chapter owner (user)."""
        return self.filter(chapter__user=user)

    def active_for_user(self, user):
        """Filter questions to active chapters owned by user."""
        return self.filter(chapter__user=user, chapter__is_deleted=False)

    def for_active_chapter(self, chapter_id, user):
        return self.active_for_user(user).filter(chapter_id=chapter_id)

    def random_sample(self, limit):
        """
        Return a bounded random sample without database random ordering.

        This loads only the candidate primary keys, samples them in Python, and
        then fetches the selected rows. It avoids both database-wide random
        sorting and one OFFSET query per selected question.
        """
        limit = self._positive_int(limit)
        if limit is None:
            return self

        ordered = self.order_by("id")
        candidate_ids = list(ordered.values_list("id", flat=True))
        if len(candidate_ids) <= limit:
            return ordered

        sampled_ids = random.sample(candidate_ids, limit)
        return self.filter(id__in=sampled_ids).order_by("id")

    def limit_by(self, limit):
        """Limit the queryset to a given number of results."""
        limit = self._positive_int(limit)
        if limit is not None:
            return self[:limit]
        return self

    @staticmethod
    def _positive_int(value):
        try:
            parsed = int(value)
        except (TypeError, ValueError):
            return None
        return parsed if parsed > 0 else None
