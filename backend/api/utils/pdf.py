import pdfplumber
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)


def extract_text(files: List, *, max_pages: Optional[int] = None) -> str:
    texts = []
    total_pages = 0
    for file in files:
        with pdfplumber.open(file) as pdf:
            parts = []
            for page in pdf.pages:
                if max_pages and total_pages >= max_pages:
                    logger.warning("Page limit (%d) reached, truncating extraction", max_pages)
                    break
                txt = page.extract_text() or ""
                if txt.strip():
                    parts.append(txt)
                total_pages += 1
            texts.append("\n\n".join(parts))

    return "\n\n".join(texts)