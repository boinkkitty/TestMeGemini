"""
PDF utility functions for text extraction.
Includes functions to extract text from PDF files for further processing.
"""

from pathlib import Path
from typing import List

import pdfplumber
from django.conf import settings


class PdfUploadError(ValueError):
    """Client-safe upload/extraction validation error."""


def _setting(name, default):
    return getattr(settings, name, default)


def validate_pdf_uploads(files: List) -> None:
    max_files = _setting("CHAPTER_UPLOAD_MAX_FILES", 5)
    max_file_bytes = _setting("CHAPTER_UPLOAD_MAX_FILE_BYTES", 10 * 1024 * 1024)
    max_total_bytes = _setting("CHAPTER_UPLOAD_MAX_TOTAL_BYTES", 25 * 1024 * 1024)

    if not files:
        raise PdfUploadError("At least one PDF file is required.")
    if len(files) > max_files:
        raise PdfUploadError(f"Upload at most {max_files} PDF files.")

    total_size = 0
    for file in files:
        name = getattr(file, "name", "")
        content_type = getattr(file, "content_type", "")
        size = getattr(file, "size", 0) or 0
        if Path(name).suffix.lower() != ".pdf" or content_type not in {
            "application/pdf",
            "application/x-pdf",
        }:
            raise PdfUploadError("Only PDF files are supported.")
        if size <= 0:
            raise PdfUploadError("Uploaded PDF files cannot be empty.")
        if size > max_file_bytes:
            raise PdfUploadError(f"Each PDF must be {max_file_bytes} bytes or smaller.")
        try:
            file.seek(0)
            signature = file.read(5)
            file.seek(0)
        except (AttributeError, OSError) as exc:
            raise PdfUploadError("Could not inspect an uploaded PDF file.") from exc
        if signature != b"%PDF-":
            raise PdfUploadError("Uploaded files must contain valid PDF data.")
        total_size += size

    if total_size > max_total_bytes:
        raise PdfUploadError(f"Total upload size must be {max_total_bytes} bytes or smaller.")

def extract_text(files: List) -> str:
    """
    Extract text from a list of PDF files.
    Returns the combined text from all pages of all files.
    Args:
        files (List): List of PDF file objects.
    Returns:
        str: Combined text from all PDFs.
    Raises:
        ValueError: If no files are provided.
        Exception: If there is an error reading the PDF files.
    """
    validate_pdf_uploads(files)

    max_pages = _setting("CHAPTER_UPLOAD_MAX_PDF_PAGES", 80)
    max_text_chars = _setting("CHAPTER_UPLOAD_MAX_TEXT_CHARS", 120_000)

    texts = []
    pages_seen = 0
    chars_seen = 0
    try:
        for file in files:
            if hasattr(file, "seek"):
                file.seek(0)
            with pdfplumber.open(file) as pdf:
                parts = []
                for page in pdf.pages:
                    pages_seen += 1
                    if pages_seen > max_pages:
                        raise PdfUploadError(f"Uploaded PDFs may contain at most {max_pages} pages.")
                    txt = page.extract_text() or ""
                    if txt.strip():
                        remaining = max_text_chars - chars_seen
                        if remaining <= 0:
                            raise PdfUploadError(f"Extracted text must be {max_text_chars} characters or fewer.")
                        if len(txt) > remaining:
                            raise PdfUploadError(f"Extracted text must be {max_text_chars} characters or fewer.")
                        chars_seen += len(txt)
                        parts.append(txt)
                texts.append("\n\n".join(parts))
    except PdfUploadError:
        raise
    except Exception as exc:
        raise PdfUploadError("Could not read one or more PDF files.") from exc

    extracted = "\n\n".join(texts).strip()
    if not extracted:
        raise PdfUploadError("Uploaded PDFs did not contain extractable text.")
    return extracted
