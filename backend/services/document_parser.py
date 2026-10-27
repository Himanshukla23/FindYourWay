import io
import re
from typing import List, Dict

class DocumentParser:
    @staticmethod
    def extract_text_from_pdf(pdf_bytes: bytes) -> str:
        try:
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(pdf_bytes))
            text_parts = []
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
            return "\n".join(text_parts).strip()
        except Exception as e:
            print(f"[DocumentParser] PDF parsing error: {e}")
            return ""

    @staticmethod
    def extract_text_from_docx(docx_bytes: bytes) -> str:
        try:
            import docx
            doc = docx.Document(io.BytesIO(docx_bytes))
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            return "\n".join(paragraphs).strip()
        except Exception as e:
            print(f"[DocumentParser] DOCX parsing error: {e}")
            return ""

    @staticmethod
    def chunk_resume_text(text: str) -> List[Dict[str, str]]:
        """
        Intelligent Semantic Chunker:
        Breaks down resume into distinct semantic entities:
        - Professional Summary / About
        - Experience / Work History
        - Projects / Portfolio
        - Expertise & Skills / Tools
        - Education & Accreditations
        """
        lines = [l.strip() for l in text.split("\n") if l.strip()]
        chunks = []
        current_section = "General Profile"
        current_lines = []

        section_keywords = {
            "Professional Summary": ["PROFESSIONAL SUMMARY", "SUMMARY", "ABOUT ME", "OBJECTIVE", "PROFILE"],
            "Experience": ["EXPERIENCE", "WORK EXPERIENCE", "EMPLOYMENT", "INTERNSHIPS", "WORK HISTORY"],
            "Projects": ["PROJECTS", "ACADEMIC PROJECTS", "KEY PROJECTS", "PERSONAL PROJECTS"],
            "Expertise & Tools": ["EXPERTISE", "SKILLS", "TECHNICAL SKILLS", "TOOLS", "PLATFORMS", "COMPETENCIES"],
            "Education & Honors": ["EDUCATION", "ACADEMIC BACKGROUND", "CERTIFICATIONS", "FELLOWSHIPS", "ACADEMICS"]
        }

        for line in lines:
            line_upper = line.upper()
            matched_section = None
            for section_name, keywords in section_keywords.items():
                if any(line_upper == kw or line_upper.startswith(kw + ":") or line_upper.startswith(kw + " -") for kw in keywords):
                    matched_section = section_name
                    break

            if matched_section:
                if current_lines:
                    chunks.append({"section": current_section, "content": "\n".join(current_lines)})
                    current_lines = []
                current_section = matched_section
            else:
                current_lines.append(line)

        if current_lines:
            chunks.append({"section": current_section, "content": "\n".join(current_lines)})

        return chunks if chunks else [{"section": "Full Resume", "content": text}]
