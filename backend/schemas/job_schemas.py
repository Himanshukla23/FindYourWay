"""
Job Board & Match Engine Pydantic Schemas (Architecture Spec 2.0)
Optimized for high performance, minimal memory footprints, and strict typing.
"""

from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field, HttpUrl
from datetime import datetime, timezone

WorkModeType = Literal['Remote', 'Hybrid', 'On-site']
JobStatusType = Literal['active', 'closed', 'new']
ApplicationStageType = Literal['saved', 'applied', 'interviewing', 'offered', 'rejected']

class JobHiringContactSchema(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    linkedin: Optional[str] = None
    email: Optional[str] = None

class JobBase(BaseModel):
    title: str = Field(..., max_length=255)
    company: str = Field(..., max_length=255)
    company_logo: Optional[str] = None
    location: str = Field(..., max_length=255)
    country: str = Field(default="India", max_length=100)
    work_mode: WorkModeType = "Remote"
    exp_min: int = Field(default=0, ge=0, le=30)
    exp_max: int = Field(default=2, ge=0, le=30)
    salary_display: Optional[str] = Field(default="Not Disclosed", max_length=100)
    skills: List[str] = Field(default_factory=list)
    role_category: str = Field(default="Software Engineering", max_length=100)
    tier: int = Field(default=2, ge=1, le=3)
    apply_url: str
    source: str = Field(default="Direct ATS", max_length=100)
    jd_summary: Optional[str] = None
    jd_full: Optional[str] = None
    hiring_contact: Optional[JobHiringContactSchema] = None

class JobCreate(JobBase):
    status: JobStatusType = "active"
    posted_at: Optional[str] = None

class JobResponse(JobBase):
    id: str
    hash_id: str
    status: JobStatusType
    verified_at: str
    posted_at: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    is_saved: Optional[bool] = False
    application_status: Optional[str] = None
    match_score: Optional[int] = None

class JobListResponse(BaseModel):
    total: int
    limit: int
    offset: int
    has_more: bool
    jobs: List[JobResponse]
    last_verified: str

class JobFilterQuery(BaseModel):
    search: Optional[str] = None
    country: Optional[str] = None
    work_mode: Optional[str] = None
    role_category: Optional[str] = None
    exp_range: Optional[str] = None # '0-1', '1-3', '3+'
    min_exp: Optional[int] = None
    max_exp: Optional[int] = None
    status: Optional[str] = None # 'active', 'new', 'closed', or 'all'
    include_closed: Optional[bool] = False
    sort_by: Optional[str] = "newest" # 'newest', 'verified', 'salary'
    limit: int = Field(default=30, ge=1, le=100)
    offset: int = Field(default=0, ge=0)

class JobSaveRequest(BaseModel):
    job_id: str
    user_email: str

class JobApplyRequest(BaseModel):
    job_id: str
    user_email: str
    status: ApplicationStageType = "applied"
    notes: Optional[str] = ""

class UserSavedJobRecord(BaseModel):
    id: str
    user_id: str
    job_id: str
    created_at: str
    job: Optional[JobResponse] = None

class UserAppliedJobRecord(BaseModel):
    id: str
    user_id: str
    job_id: str
    status: ApplicationStageType
    notes: str = ""
    applied_at: str
    updated_at: str
    job: Optional[JobResponse] = None

class JobMatchRequest(BaseModel):
    job_id: str
    user_email: Optional[str] = None
    resume_text: Optional[str] = None
    student_skills: Optional[List[str]] = None

class JobMatchResult(BaseModel):
    job_id: str
    job_title: str
    company: str
    match_score: int # 0 to 100
    matching_skills: List[str]
    missing_skills: List[str]
    strengths: List[str]
    tailoring_tips: List[str]
    recommendation_level: Literal['High Fit', 'Moderate Fit', 'Reach Role']

class TailoredBullet(BaseModel):
    original_theme: str
    tailored_star: str
    metrics_impact: str
    targeted_keywords: List[str]

class JobTailorRequest(BaseModel):
    job_id: str
    user_email: Optional[str] = None
    resume_text: Optional[str] = None
    student_skills: Optional[List[str]] = None
    target_role: Optional[str] = None

class JobTailorResponse(BaseModel):
    job_id: str
    company: str
    role_title: str
    tailored_bullets: List[TailoredBullet]
    recruiter_outreach_dm: str
    ats_keywords_to_include: List[str]
    cover_pitch: str


