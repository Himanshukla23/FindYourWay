from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request
from typing import Optional
from services.document_parser import DocumentParser
from services.resume_service import ResumeService
from schemas.resume import ResumeParseApiResponse

router = APIRouter(prefix="/api/ai", tags=["Resume Diagnostics"])

@router.post("/parse-resume", response_model=ResumeParseApiResponse)
async def parse_resume(
    request: Request,
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None)
):
    extracted_text = ""

    # 1. If file uploaded
    if file and file.filename:
        filename_lower = file.filename.lower()
        file_bytes = await file.read()
        if filename_lower.endswith(".pdf") or file.content_type == "application/pdf":
            extracted_text = DocumentParser.extract_text_from_pdf(file_bytes)
        elif filename_lower.endswith(".docx") or "word" in (file.content_type or ""):
            extracted_text = DocumentParser.extract_text_from_docx(file_bytes)
        else:
            try:
                extracted_text = file_bytes.decode("utf-8", errors="ignore")
            except Exception:
                extracted_text = ""

    # 2. If form text provided
    if not extracted_text and text:
        extracted_text = text.strip()

    # 3. If JSON payload sent
    if not extracted_text:
        try:
            body = await request.json()
            extracted_text = body.get("text", "").strip()
        except Exception:
            pass

    if not extracted_text:
        raise HTTPException(
            status_code=400,
            detail="No valid resume text or file provided. Please upload a PDF or DOCX file."
        )

    try:
        result = await ResumeService.parse_and_diagnose(extracted_text)
        return ResumeParseApiResponse(
            success=True,
            data=result["data"],
            providerUsed=result["provider_used"],
            model=result["model"],
            chunksAnalyzed=result["chunks_analyzed"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
