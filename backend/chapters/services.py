"""
Service functions for the chapters app.
Handles business logic for chapter creation, including PDF extraction and AI question generation.
"""

from django.db import transaction
from rest_framework import status
from .serializers import ChapterSerializer
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
    try:
        with transaction.atomic():
            serializer = ChapterSerializer(data=payload, context={'request': request})
            serializer.is_valid(raise_exception=True)
            # The following line creates the chapter AND all related questions/choices via the serializer:
            chapter = serializer.save(user=user)
            # (Questions are created by the nested serializer logic in ChapterSerializer)
            question_ids = list(chapter.questions.values_list("id", flat=True))
            result = {"chapter_id": chapter.id, "question_ids": question_ids}
            logger.info("[ChapterCreate] Chapter created with ID: %s, Questions: %s", chapter.id, question_ids)
            return result, status.HTTP_201_CREATED
    except Exception as e:
        logger.error("[ChapterCreate] Exception: %s", str(e), exc_info=True)
        return {"error": str(e)}, status.HTTP_400_BAD_REQUEST
