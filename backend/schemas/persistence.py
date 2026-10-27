from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# ─── 1. Resume Storage Schemas ───────────────────────────────────────

class ResumeStorageRecord(BaseModel):
    id: str
    user_id: str
    file_name: str
    file_url: str
    file_type: str
    file_size_bytes: int
    uploaded_at: str
    processing_status: str = "completed"
    is_active: bool = True
    deleted_at: Optional[str] = None

class ResumeUploadResponse(BaseModel):
    success: bool = True
    data: ResumeStorageRecord
    message: str = "Resume successfully stored"

class ResumeListResponse(BaseModel):
    success: bool = True
    total: int
    resumes: List[ResumeStorageRecord]

# ─── 2. Roadmap Progress Schemas ─────────────────────────────────────

class RoadmapTaskUpdateRequest(BaseModel):
    status: Optional[str] = None
    completed: Optional[bool] = None
    notes: Optional[str] = None
    project_link: Optional[str] = None
    repo_url: Optional[str] = None
    role_title: Optional[str] = None
    user_email: Optional[str] = None

class PersistedTask(BaseModel):
    id: str
    roadmap_id: str
    phase_title: str
    title: str
    description: str
    deliverable: str
    estimated_hours: int
    skills: List[str] = Field(default_factory=list)
    resources: List[str] = Field(default_factory=list)
    status: str = "not_started"
    notes: Optional[str] = ""
    project_link: Optional[str] = ""
    completed_at: Optional[str] = None

class PersistedRoadmap(BaseModel):
    id: str
    user_id: str
    role_title: str
    difficulty: str = "Intermediate"
    estimated_weeks: int = 8
    progress_percentage: float = 0.0
    total_tasks: int = 0
    completed_tasks: int = 0
    tasks: List[PersistedTask] = Field(default_factory=list)
    capstone: Optional[Dict[str, Any]] = None
    created_at: str
    updated_at: str

class RoadmapSaveRequest(BaseModel):
    user_id: Optional[str] = "student-default"
    role_title: str
    estimated_weeks: int = 8
    difficulty: str = "Intermediate"
    tasks: List[Dict[str, Any]]
    capstone: Optional[Dict[str, Any]] = None

# ─── 3. Saved Items Schemas ──────────────────────────────────────────

class SavedItemCreateRequest(BaseModel):
    item_type: str = Field(pattern="^(job_profile|mentor)$")
    item_id: str

class SavedItemRecord(BaseModel):
    id: str
    user_id: str
    item_type: str
    item_id: str
    item_title: Optional[str] = ""
    saved_at: str

class SavedItemListResponse(BaseModel):
    success: bool = True
    total: int
    saved_items: List[SavedItemRecord]

# ─── 4. Analysis History Schemas ─────────────────────────────────────

class AnalysisHistoryRecord(BaseModel):
    id: str
    user_id: str
    summary: str
    top_role: str
    match_score: int
    skills: List[str] = Field(default_factory=list)
    strengths: List[str] = Field(default_factory=list)
    gaps: List[str] = Field(default_factory=list)
    recommended_roles: List[Dict[str, Any]] = Field(default_factory=list)
    created_at: str

class AnalysisHistorySaveRequest(BaseModel):
    user_id: Optional[str] = "student-default"
    summary: str
    top_role: str
    match_score: int
    skills: List[str] = Field(default_factory=list)
    strengths: List[str] = Field(default_factory=list)
    gaps: List[str] = Field(default_factory=list)
    recommended_roles: List[Dict[str, Any]] = Field(default_factory=list)

class AnalysisHistoryListResponse(BaseModel):
    success: bool = True
    total: int
    analyses: List[AnalysisHistoryRecord]

# ─── 5. Onboarding & Student Profile Schemas ─────────────────────────

class OnboardingResponseRequest(BaseModel):
    interests: List[str] = Field(default_factory=list)
    preferred_work_style: List[str] = Field(default_factory=list)
    learning_preference: List[str] = Field(default_factory=list)
    career_goals: List[str] = Field(default_factory=list)
    challenges: Optional[str] = ""
    hours_per_week: Optional[int] = 15

class StudentProfileData(BaseModel):
    user_id: str
    full_name: str
    email: str
    degree: str = "B.Tech"
    branch: str = "Computer Science"
    college_name: str = "Engineering Institute"
    graduation_year: int = 2026
    year_of_study: int = 3
    bio: Optional[str] = ""
    linkedin_url: Optional[str] = ""
    github_url: Optional[str] = ""
    onboarding_completed: bool = False
    onboarding_answers: Optional[Dict[str, Any]] = None
