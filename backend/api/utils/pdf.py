import pdfplumber
from typing import List

def extract_text(files: List) -> str:
    """
    Extract text from a list of PDF files.
    Returns the combined text from all pages of all files.
    :param files: List of PDF file objects.
    :return: Combined text from all PDFs.
    :raises: ValueError if no files are provided.
    :raises: Exception if there is an error reading the PDF files.  
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