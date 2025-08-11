from django.core.exceptions import ValidationError
from functools import lru_cache
from questions.models import Question

@lru_cache(maxsize=1)
def get_allowed_types() -> set[str]:
    """Fetch allowed question type codes from the Question model choices.
    Cached to avoid repeated lookups.
    """
    return {code for code, _ in Question.QUESTION_TYPE_CHOICES}


def validate_structure(data: dict):
    if "chapter" not in data or "questions" not in data:
        raise ValidationError("Missing chapter/questions")
    ch = data["chapter"]
    if "title" not in ch or "content" not in ch:
        raise ValidationError("Bad chapter block")
    for q in data["questions"]:
        qt = q.get("question_type")
        if qt not in get_allowed_types():
            raise ValidationError(f"Invalid question_type {qt}")
        choices = q.get("choices", [])
        if not choices:
            raise ValidationError("Choices required")
        correct_count = sum(1 for c in choices if c.get("is_correct") is True)
        if qt == "MCQ" and correct_count != 1:
            raise ValidationError("MCQ must have exactly 1 correct")
        if qt == "MRQ" and correct_count < 1:
            raise ValidationError("MRQ must have >=1 correct")
        if qt == "TF":
            labels = {c["text"].strip().lower() for c in choices}
            if labels != {"true","false"}:
                raise ValidationError("TF must have True / False choices")
            if correct_count != 1:
                raise ValidationError("TF must have exactly 1 correct")