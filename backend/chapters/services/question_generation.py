from chapters.serializers import ChapterSerializer
from api.utils.ai import call_model
from api.utils.parsing import validate_structure
from api.utils.pdf import extract_text

def generate_and_persist(chapter_title: str, pdf_files) -> dict:
    """
    Extract text from PDF files, generate chapter content and questions using AI
    """
    chapter_content = extract_text(pdf_files)
    data = call_model(chapter_title, chapter_content)
    validate_structure(data)
    payload = {
        "title": data["chapter"]["title"] or chapter_title,
        "content": data["chapter"]["content"],
        "questions": data["questions"]
    }
    # You may need to pass user context if required by your serializer
    serializer = ChapterSerializer(data=payload)
    serializer.is_valid(raise_exception=True)
    chapter = serializer.save()
    question_ids = [q.id for q in chapter.questions.all()]
    return {"chapter_id": chapter.id, "question_ids": question_ids}
