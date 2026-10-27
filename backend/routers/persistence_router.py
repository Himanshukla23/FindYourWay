from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from typing import Optional, List
from schemas.persistence import (
    ResumeStorageRecord,
    ResumeUploadResponse,
    ResumeListResponse,
    PersistedRoadmap,
    PersistedTask,
    RoadmapSaveRequest,
    RoadmapTaskUpdateRequest,
    SavedItemCreateRequest,
    SavedItemRecord,
    SavedItemListResponse,
    AnalysisHistoryRecord,
    AnalysisHistorySaveRequest,
    AnalysisHistoryListResponse,
    OnboardingResponseRequest,
    StudentProfileData
)
from services.persistence_service import PersistenceService

router = APIRouter(prefix="/api", tags=["Phase 5 Persistence & Progress"])

# ─── 1. Resume Storage Endpoints ─────────────────────────────────────

@router.post("/storage/resumes", response_model=ResumeUploadResponse)
async def upload_and_store_resume(
    file: UploadFile = File(...),
    user_id: Optional[str] = Form("student-default")
):
    """
    Stores resume with server-side magic bytes validation (PDF/DOCX/TXT) and 5 MB size limit.
    """
    content = await file.read()
    record = PersistenceService.store_resume(
        user_id=user_id,
        filename=file.filename or "resume.pdf",
        content=content
    )
    return ResumeUploadResponse(
        success=True,
        data=record,
        message=f"Resume '{file.filename}' securely stored."
    )

@router.get("/storage/resumes", response_model=ResumeListResponse)
async def list_resumes(user_id: Optional[str] = Query("student-default")):
    """
    List user resumes with active processing status.
    """
    resumes = PersistenceService.list_user_resumes(user_id=user_id)
    return ResumeListResponse(success=True, total=len(resumes), resumes=resumes)

@router.delete("/storage/resumes/{resume_id}")
async def delete_resume(
    resume_id: str,
    user_id: Optional[str] = Query("student-default")
):
    """
    Soft-deletes resume (sets is_active=False, records deleted_at).
    """
    PersistenceService.soft_delete_resume(resume_id=resume_id, user_id=user_id)
    return {"success": True, "message": "Resume soft-deleted successfully"}

# ─── 2. Roadmap Progress & Task Auto-Save ────────────────────────────

@router.post("/progress/roadmap", response_model=PersistedRoadmap)
async def save_new_roadmap(req: RoadmapSaveRequest):
    """
    Saves a generated roadmap to persistent state with tasks and milestones.
    """
    return PersistenceService.save_roadmap(req)

@router.get("/progress/roadmap/{roadmap_id}", response_model=PersistedRoadmap)
async def get_persisted_roadmap(roadmap_id: str):
    """
    Retrieves a persistent roadmap with authoritative server-calculated progress percentage.
    """
    roadmap = PersistenceService.get_roadmap(roadmap_id)
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found.")
    return roadmap

@router.get("/progress/roadmaps", response_model=List[PersistedRoadmap])
async def list_user_roadmaps(user_id: Optional[str] = Query("student-default")):
    """
    Lists historical roadmaps for the student.
    """
    return PersistenceService.list_user_roadmaps(user_id=user_id)

@router.patch("/progress/tasks/{task_id}", response_model=PersistedTask)
async def update_task_progress(task_id: str, req: RoadmapTaskUpdateRequest):
    """
    Immediate task status update (not_started, in_progress, completed),
    notes and project link auto-save. Recalculates roadmap percentage server-side.
    """
    return PersistenceService.update_task_progress(task_id=task_id, req=req)

# ─── 3. Saved Items (Jobs & Mentors) ─────────────────────────────────

@router.post("/saved-items", response_model=SavedItemRecord)
async def save_item(
    req: SavedItemCreateRequest,
    user_id: Optional[str] = Query("student-default"),
    title: Optional[str] = Query("")
):
    """
    Bookmark / save a job profile or mentor profile.
    """
    return PersistenceService.save_item(
        user_id=user_id,
        item_type=req.item_type,
        item_id=req.item_id,
        title=title
    )

@router.delete("/saved-items/{item_type}/{item_id}")
async def unsave_item(
    item_type: str,
    item_id: str,
    user_id: Optional[str] = Query("student-default")
):
    """
    Remove bookmark / unsave an item.
    """
    removed = PersistenceService.unsave_item(user_id=user_id, item_type=item_type, item_id=item_id)
    return {"success": removed, "message": "Item removed from saved items" if removed else "Item not found"}

@router.get("/saved-items", response_model=SavedItemListResponse)
async def list_saved_items(user_id: Optional[str] = Query("student-default")):
    """
    List student bookmarks (visible on Profile / Settings).
    """
    items = PersistenceService.list_saved_items(user_id=user_id)
    return SavedItemListResponse(success=True, total=len(items), saved_items=items)

# ─── 4. AI Analysis History ──────────────────────────────────────────

@router.post("/history/analyses", response_model=AnalysisHistoryRecord)
async def save_analysis_history(req: AnalysisHistorySaveRequest):
    """
    Persist an AI resume diagnosis into history.
    """
    return PersistenceService.save_analysis_history(req)

@router.get("/history/analyses", response_model=AnalysisHistoryListResponse)
async def list_analysis_history(user_id: Optional[str] = Query("student-default")):
    """
    Retrieve historical AI analyses for review.
    """
    analyses = PersistenceService.list_analyses(user_id=user_id)
    return AnalysisHistoryListResponse(success=True, total=len(analyses), analyses=analyses)

# ─── 5. Student Profile & Onboarding Responses ───────────────────────

@router.get("/students/profile", response_model=StudentProfileData)
async def get_student_profile(user_id: Optional[str] = Query("student-default")):
    """
    Get profile data and completed onboarding responses.
    """
    return PersistenceService.get_profile(user_id=user_id)

@router.post("/students/onboarding", response_model=StudentProfileData)
async def submit_onboarding_responses(
    req: OnboardingResponseRequest,
    user_id: Optional[str] = Query("student-default")
):
    """
    Persist student responses across all 4 onboarding questions.
    """
    return PersistenceService.save_onboarding(user_id=user_id, req=req)

@router.post("/onboarding/profile")
async def save_or_update_profile(payload: dict):
    """
    Save or update complete student onboarding profile.
    """
    user_id = payload.get("user_email") or payload.get("user_id") or "student-default"
    profile = PersistenceService.get_profile(user_id)
    profile.email = payload.get("email") or payload.get("user_email") or profile.email
    if "full_name" in payload and payload["full_name"]:
        profile.full_name = payload["full_name"]
    if "degree" in payload and payload["degree"]:
        profile.degree = payload["degree"]
    if "branch" in payload and payload["branch"]:
        profile.branch = payload["branch"]
    if "college" in payload and payload["college"]:
        profile.college_name = payload["college"]
    elif "college_name" in payload and payload["college_name"]:
        profile.college_name = payload["college_name"]
    if "graduation_year" in payload and payload["graduation_year"]:
        try:
            profile.graduation_year = int(payload["graduation_year"])
        except Exception:
            pass
    profile.onboarding_completed = True
    profile.onboarding_answers = payload
    data = profile.model_dump()
    data["user_email"] = profile.email
    data["target_role"] = payload.get("target_job_role") or payload.get("target_role", "")
    data["career_interests"] = payload.get("career_interests", [])
    data["current_status"] = payload.get("current_status", "")
    return {"success": True, "profile": data}

@router.get("/onboarding/profile")
async def get_onboarding_profile(
    user_email: Optional[str] = Query(None),
    user_id: Optional[str] = Query("student-default")
):
    """
    Get saved onboarding profile for a candidate.
    """
    target_id = user_email or user_id or "student-default"
    profile = PersistenceService.get_profile(target_id)
    data = profile.model_dump()
    data["user_email"] = profile.email
    if profile.onboarding_answers and isinstance(profile.onboarding_answers, dict):
        data["target_role"] = (
            profile.onboarding_answers.get("target_job_role")
            or profile.onboarding_answers.get("target_role", "")
        )
        data["career_interests"] = profile.onboarding_answers.get("career_interests", [])
        data["current_status"] = profile.onboarding_answers.get("current_status", "")
    return {"success": True, "profile": data}

