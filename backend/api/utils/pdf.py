import pdfplumber

def extract_text(file_obj) -> str:
    with pdfplumber.open(file_obj) as pdf:
        parts = []
        for page in pdf.pages:
            txt = page.extract_text() or ""
            if txt.strip():
                parts.append(txt)
        return "\n\n".join(parts)