import os
from typing import Optional
import pdfplumber
import docx
import pytesseract
from PIL import Image

def extract_text_from_file(filepath: str, file_type: str) -> Optional[str]:
    """
    Routes the file to the appropriate text extraction method based on mime type or extension.
    """
    if not os.path.exists(filepath):
        return None

    file_ext = os.path.splitext(filepath)[1].lower()
    
    try:
        if file_type == 'application/pdf' or file_ext == '.pdf':
            return _extract_from_pdf(filepath)
        elif file_type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' or file_ext == '.docx':
            return _extract_from_docx(filepath)
        elif file_type.startswith('image/') or file_ext in ['.png', '.jpg', '.jpeg', '.tiff', '.bmp']:
            return _extract_from_image(filepath)
        elif file_type.startswith('text/') or file_ext in ['.txt', '.csv']:
            return _extract_from_text(filepath)
        else:
            return None
    except Exception as e:
        print(f"Error extracting text from {filepath}: {e}")
        return None

def _extract_from_pdf(filepath: str) -> str:
    extracted_text = []
    with pdfplumber.open(filepath) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                extracted_text.append(text)
    return "\n".join(extracted_text)

def _extract_from_docx(filepath: str) -> str:
    doc = docx.Document(filepath)
    return "\n".join([para.text for para in doc.paragraphs])

def _extract_from_image(filepath: str) -> str:
    # Requires tesseract-ocr installed on the system
    image = Image.open(filepath)
    text = pytesseract.image_to_string(image)
    return text

def _extract_from_text(filepath: str) -> str:
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        return f.read()
