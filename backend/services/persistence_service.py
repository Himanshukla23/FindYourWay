import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from fastapi import HTTPException
from schemas.persistence import (
    ResumeStorageRecord,
    PersistedRoadmap,
    PersistedTask,
    RoadmapSaveRequest,
    RoadmapTaskUpdateRequest,
    SavedItemRecord,
    AnalysisHistoryRecord,
    AnalysisHistorySaveRequest,
    StudentProfileData,
    OnboardingResponseRequest
)

class PersistenceService:
    # ── State Stores ─────────────────────────────────────────────────
    _resumes: Dict[str, ResumeStorageRecord] = {}
    _roadmaps: Dict[str, PersistedRoadmap] = {}
    _saved_items: Dict[str, SavedItemRecord] = {} # key: f"{user_id}_{item_type}_{item_id}"
    _analyses: Dict[str, AnalysisHistoryRecord] = {}
    _profiles: Dict[str, StudentProfileData] = {
        "student-default": StudentProfileData(
            user_id="student-default",
            full_name="Aarav Kumar",
            email="student@pathpilot.ai",
            degree="B.Tech",
            branch="Computer Science & Engineering",
            college_name="Engineering Institute of Technology",
            graduation_year=2026,
            year_of_study=3,
            bio="Aspiring Software & AI Engineer passionate about scalable systems.",
            linkedin_url="https://linkedin.com/in/student",
            github_url="https://github.com/student",
            onboarding_completed=False
        )
    }

    # ── 1. Resume Storage & Validation (5.1) ──────────────────────────

    @classmethod
    def validate_file_magic_bytes(cls, content: bytes, filename: str) -> str:
        """
        Server-side magic bytes validation (not just file extension).
        Max 5 MB enforcement.
        """
        max_bytes = 5 * 1024 * 1024  # 5 MB
        if len(content) > max_bytes:
            raise HTTPException(status_code=400, detail="File size exceeds the maximum allowed limit of 5 MB.")

        fn_lower = filename.lower()

        # Strict PDF magic bytes validation
        if fn_lower.endswith(".pdf"):
            if content.startswith(b"%PDF-"):
                return "pdf"
            raise HTTPException(status_code=400, detail="Invalid PDF file: magic bytes '%PDF-' not detected.")

        # Strict DOCX magic bytes validation (ZIP container PK\x03\x04)
        if fn_lower.endswith(".docx"):
            if content.startswith(b"PK\x03\x04"):
                return "docx"
            raise HTTPException(status_code=400, detail="Invalid DOCX file: zip container magic bytes not detected.")

        # Text files
        if fn_lower.endswith(".txt"):
            try:
                content[:1024].decode("utf-8")
                return "txt"
            except UnicodeDecodeError:
                raise HTTPException(status_code=400, detail="Invalid TXT file: content is not valid UTF-8.")

        raise HTTPException(
            status_code=400,
            detail="Unsupported file extension. Only .pdf, .docx, and .txt files are allowed."
        )

    @classmethod
    def store_resume(cls, user_id: str, filename: str, content: bytes) -> ResumeStorageRecord:
        file_type = cls.validate_file_magic_bytes(content, filename)
        resume_id = f"res-{uuid.uuid4().hex[:8]}"

        record = ResumeStorageRecord(
            id=resume_id,
            user_id=user_id,
            file_name=filename,
            file_url=f"/api/storage/resumes/{resume_id}/file",
            file_type=file_type,
            file_size_bytes=len(content),
            uploaded_at=datetime.now(timezone.utc).isoformat(),
            processing_status="completed",
            is_active=True
        )
        cls._resumes[resume_id] = record
        return record

    @classmethod
    def list_user_resumes(cls, user_id: str) -> List[ResumeStorageRecord]:
        return [r for r in cls._resumes.values() if r.user_id == user_id and r.is_active]

    @classmethod
    def soft_delete_resume(cls, resume_id: str, user_id: str) -> bool:
        record = cls._resumes.get(resume_id)
        if not record or record.user_id != user_id:
            raise HTTPException(status_code=404, detail="Resume record not found.")

        record.is_active = False
        record.deleted_at = datetime.now(timezone.utc).isoformat()
        return True

    # ── 2. Roadmap Progress Persistence (5.2) ─────────────────────────

    @classmethod
    def save_roadmap(cls, req: RoadmapSaveRequest) -> PersistedRoadmap:
        roadmap_id = f"rm-{uuid.uuid4().hex[:8]}"
        now_iso = datetime.now(timezone.utc).isoformat()

        persisted_tasks: List[PersistedTask] = []
        for idx, t in enumerate(req.tasks):
            task_id = t.get("id") or f"task-{roadmap_id}-{idx + 1}"
            persisted_tasks.append(
                PersistedTask(
                    id=task_id,
                    roadmap_id=roadmap_id,
                    phase_title=t.get("phase", "Foundations"),
                    title=t.get("title", f"Milestone #{idx + 1}"),
                    description=t.get("desc", ""),
                    deliverable=t.get("deliverable", ""),
                    estimated_hours=t.get("hours", 12),
                    skills=t.get("skills", []),
                    resources=t.get("resources", []),
                    status=t.get("status", "completed" if idx == 0 else "not_started"),
                    notes=t.get("notes", ""),
                    project_link=t.get("repoUrl", "") or t.get("project_link", ""),
                    completed_at=now_iso if idx == 0 else None
                )
            )

        total = len(persisted_tasks)
        completed = sum(1 for t in persisted_tasks if t.status == "completed")
        pct = round((completed / total) * 100.0, 1) if total > 0 else 0.0

        roadmap = PersistedRoadmap(
            id=roadmap_id,
            user_id=req.user_id or "student-default",
            role_title=req.role_title,
            difficulty=req.difficulty,
            estimated_weeks=req.estimated_weeks,
            progress_percentage=pct,
            total_tasks=total,
            completed_tasks=completed,
            tasks=persisted_tasks,
            capstone=req.capstone,
            created_at=now_iso,
            updated_at=now_iso
        )
        cls._roadmaps[roadmap_id] = roadmap
        return roadmap

    @classmethod
    def get_roadmap(cls, roadmap_id: str) -> Optional[PersistedRoadmap]:
        return cls._roadmaps.get(roadmap_id)

    @classmethod
    def list_user_roadmaps(cls, user_id: str) -> List[PersistedRoadmap]:
        return [r for r in cls._roadmaps.values() if r.user_id == user_id]

    @classmethod
    def update_task_progress(cls, task_id: str, req: RoadmapTaskUpdateRequest) -> PersistedTask:
        target_roadmap: Optional[PersistedRoadmap] = None
        target_task: Optional[PersistedTask] = None

        for rm in cls._roadmaps.values():
            for t in rm.tasks:
                if t.id == task_id:
                    target_roadmap = rm
                    target_task = t
                    break
            if target_task:
                break

        # Resolve target status
        target_status = req.status
        if target_status is None:
            if req.completed is True:
                target_status = "completed"
            elif req.completed is False:
                target_status = "not_started"
            else:
                target_status = "completed"

        if not target_task or not target_roadmap:
            # Auto-register in default roadmap if task was generated dynamically
            default_rm_id = f"rdm-{req.user_email or 'student-default'}"
            if default_rm_id not in cls._roadmaps:
                cls._roadmaps[default_rm_id] = PersistedRoadmap(
                    id=default_rm_id,
                    user_id=req.user_email or "student-default",
                    role_title=req.role_title or "Target Role",
                    created_at=datetime.now(timezone.utc).isoformat(),
                    updated_at=datetime.now(timezone.utc).isoformat()
                )
            target_roadmap = cls._roadmaps[default_rm_id]
            target_task = PersistedTask(
                id=task_id,
                roadmap_id=default_rm_id,
                phase_title="Phase 1",
                title=f"Task {task_id}",
                description="Milestone task",
                deliverable="Code submission",
                estimated_hours=5,
                status=target_status
            )
            target_roadmap.tasks.append(target_task)

        # Update task fields
        target_task.status = target_status
        if req.notes is not None:
            target_task.notes = req.notes
        if req.project_link is not None:
            target_task.project_link = req.project_link
        elif req.repo_url is not None:
            target_task.project_link = req.repo_url
        if target_status == "completed" and not target_task.completed_at:
            target_task.completed_at = datetime.now(timezone.utc).isoformat()
        elif target_status != "completed":
            target_task.completed_at = None

        # Server-side authoritative percentage recalculation
        total = len(target_roadmap.tasks)
        completed = sum(1 for t in target_roadmap.tasks if t.status == "completed")
        target_roadmap.completed_tasks = completed
        target_roadmap.progress_percentage = round((completed / total) * 100.0, 1) if total > 0 else 0.0
        target_roadmap.updated_at = datetime.now(timezone.utc).isoformat()

        return target_task

    # ── 3. Saved Items (5.3) ──────────────────────────────────────────

    @classmethod
    def save_item(cls, user_id: str, item_type: str, item_id: str, title: str = "") -> SavedItemRecord:
        key = f"{user_id}_{item_type}_{item_id}"
        if key in cls._saved_items:
            return cls._saved_items[key]

        record = SavedItemRecord(
            id=f"sav-{uuid.uuid4().hex[:8]}",
            user_id=user_id,
            item_type=item_type,
            item_id=item_id,
            item_title=title,
            saved_at=datetime.now(timezone.utc).isoformat()
        )
        cls._saved_items[key] = record
        return record

    @classmethod
    def unsave_item(cls, user_id: str, item_type: str, item_id: str) -> bool:
        key = f"{user_id}_{item_type}_{item_id}"
        if key in cls._saved_items:
            del cls._saved_items[key]
            return True
        return False

    @classmethod
    def list_saved_items(cls, user_id: str) -> List[SavedItemRecord]:
        return [item for item in cls._saved_items.values() if item.user_id == user_id]

    # ── 4. AI Analysis History (5.4) ──────────────────────────────────

    @classmethod
    def save_analysis_history(cls, req: AnalysisHistorySaveRequest) -> AnalysisHistoryRecord:
        analysis_id = f"ana-{uuid.uuid4().hex[:8]}"
        record = AnalysisHistoryRecord(
            id=analysis_id,
            user_id=req.user_id or "student-default",
            summary=req.summary,
            top_role=req.top_role,
            match_score=req.match_score,
            skills=req.skills,
            strengths=req.strengths,
            gaps=req.gaps,
            recommended_roles=req.recommended_roles,
            created_at=datetime.now(timezone.utc).isoformat()
        )
        cls._analyses[analysis_id] = record
        return record

    @classmethod
    def list_analyses(cls, user_id: str) -> List[AnalysisHistoryRecord]:
        results = [a for a in cls._analyses.values() if a.user_id == user_id]
        results.sort(key=lambda a: a.created_at, reverse=True)
        return results

    # ── 5. Student Profile & Onboarding Responses ─────────────────────

    @classmethod
    def get_profile(cls, user_id: str) -> StudentProfileData:
        if user_id not in cls._profiles:
            cls._profiles[user_id] = StudentProfileData(
                user_id=user_id,
                full_name="Student",
                email=f"{user_id}@pathpilot.ai"
            )
        return cls._profiles[user_id]

    @classmethod
    def save_onboarding(cls, user_id: str, req: OnboardingResponseRequest) -> StudentProfileData:
        profile = cls.get_profile(user_id)
        profile.onboarding_completed = True
        profile.onboarding_answers = req.model_dump()
        return profile
