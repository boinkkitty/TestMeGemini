"""
Service functions for the chapters app.
Handles business logic for chapter creation, including PDF extraction and AI question generation.
"""

from django.core.exceptions import PermissionDenied
from django.db import transaction
from rest_framework import status
from rest_framework.exceptions import ValidationError
from api.utils.ai import AIServiceError, call_gemini_model
from api.utils.pdf import PdfUploadError, extract_text
from .serializers import ChapterCreateSerializer
import logging

logger = logging.getLogger(__name__)


def create_chapter_and_questions_atomic(*, user, payload, request):
    """
    Create a chapter and all related questions/choices in the database atomically.
    Expects a fully prepared payload (title, description, category, questions).

    Args:
        user: The user creating the chapter.
        payload: Dict with chapter and questions data (already extracted/generated).
        request: DRF request (used for serializer context when fields rely on request).
    Returns:
        (result, status_code): Tuple of result dict and HTTP status code.
    Raises:
        Exception: Any error in DB will abort the transaction.
    """
    with transaction.atomic():
        serializer = ChapterCreateSerializer(data=payload, context={'request': request})
        serializer.is_valid(raise_exception=True)
        chapter = serializer.save(user=user)
        question_ids = list(chapter.questions.values_list("id", flat=True))
        result = {"chapter_id": chapter.id, "question_ids": question_ids}
        logger.info("[ChapterCreate] Chapter created with ID: %s, Questions: %s", chapter.id, question_ids)
        return result, status.HTTP_201_CREATED


def generate_chapter_from_files(*, user, files, title, category, request):
    if not title or not category:
        raise ValidationError({"error": "Missing required fields: title and category."})

    try:
        chapter_content = extract_text(files)
        data = call_gemini_model(title, chapter_content)
        payload = {
            "title": title,
            "description": data.get("chapter", {}).get("description") or "",
            "category": category,
            "questions": data.get("questions", []),
        }
        return create_chapter_and_questions_atomic(user=user, payload=payload, request=request)
    except PdfUploadError as exc:
        raise ValidationError({"error": str(exc)}) from exc
    except AIServiceError as exc:
        logger.warning("[ChapterGenerate] AI generation failed: %s", exc)
        raise ValidationError({"error": str(exc)}) from exc
    except PermissionDenied:
        raise
    except ValidationError:
        raise
    except Exception as exc:
        logger.error("[ChapterGenerate] Unexpected failure", exc_info=True)
        raise ValidationError({"error": "Could not generate chapter questions."}) from exc
