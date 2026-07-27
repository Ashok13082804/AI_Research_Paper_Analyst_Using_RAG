import os
import re
import logging
from typing import Dict, Any, List
import pypdf
import pdfplumber

logger = logging.getLogger(__name__)

class PDFProcessor:
    """Extracts text, metadata, page numbers, and sections from PDF research papers."""

    @staticmethod
    def process_pdf(filepath: str) -> Dict[str, Any]:
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"PDF file not found: {filepath}")

        extracted_pages: List[Dict[str, Any]] = []
        full_text = ""
        metadata = {
            "title": os.path.splitext(os.path.basename(filepath))[0],
            "authors": [],
            "year": None,
            "page_count": 0,
            "sections": []
        }

        # 1. Try pdfplumber first for high quality text + layout
        try:
            with pdfplumber.open(filepath) as pdf:
                metadata["page_count"] = len(pdf.pages)
                for idx, page in enumerate(pdf.pages):
                    page_num = idx + 1
                    page_text = page.extract_text() or ""
                    
                    if page_text.strip():
                        extracted_pages.append({
                            "page_number": page_num,
                            "text": page_text
                        })
                        full_text += f"\n--- Page {page_num} ---\n" + page_text
        except Exception as e:
            logger.warning(f"pdfplumber extraction warning: {e}, falling back to pypdf")

        # 2. Fallback to pypdf if pdfplumber extracted nothing
        if not extracted_pages:
            try:
                reader = pypdf.PdfReader(filepath)
                metadata["page_count"] = len(reader.pages)
                for idx, page in enumerate(reader.pages):
                    page_num = idx + 1
                    page_text = page.extract_text() or ""
                    if page_text.strip():
                        extracted_pages.append({
                            "page_number": page_num,
                            "text": page_text
                        })
                        full_text += f"\n--- Page {page_num} ---\n" + page_text
            except Exception as e:
                logger.error(f"pypdf extraction error: {e}")

        # 3. Metadata Extraction Heuristics
        if full_text:
            # Detect Year
            year_match = re.search(r'\b(19\d\d|20\d\d)\b', full_text[:2000])
            if year_match:
                metadata["year"] = int(year_match.group(1))

            # Detect Title heuristic (First non-empty line of Page 1)
            lines = [line.strip() for line in full_text.split("\n") if line.strip() and not line.startswith("---")]
            if lines:
                candidate_title = lines[0]
                if len(candidate_title) < 150:
                    metadata["title"] = candidate_title

            # Detect Sections (1. Introduction, 2. Related Work, etc.)
            section_matches = re.findall(r'(\d+\.?\s+[A-Z][A-Za-z\s]{3,40})', full_text)
            metadata["sections"] = list(set(section_matches))[:10]

        return {
            "metadata": metadata,
            "full_text": full_text,
            "pages": extracted_pages
        }
