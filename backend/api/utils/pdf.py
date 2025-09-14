"""
PDF utility functions for text extraction.
Includes functions to extract text from PDF files for further processing.
"""

import pdfplumber
from typing import List

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
    texts = []
    for file in files:
        with pdfplumber.open(file) as pdf:
            parts = []
            for page in pdf.pages:
                txt = page.extract_text() or ""
                if txt.strip():
                    parts.append(txt)
            texts.append("\n\n".join(parts))

    return "\n\n".join(texts)