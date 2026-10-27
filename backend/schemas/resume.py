from typing import List, Optional
from pydantic import BaseModel, Field

class EducationInfo(BaseModel):
    degree: Optional[str] = "B.Tech / B.E."
    branch: Optional[str] = "Computer Science"
    college: Optional[str] = "University"
    graduation_year: Optional[str] = "2026"

class ProjectInfo(BaseModel):
    title: str
    description: str
    technologies: List[str] = Field(default_factory=list)

class ExperienceInfo(BaseModel):
    company: str
    role: str
    duration: Optional[str] = ""
    description: Optional[str] = ""

class LinkInfo(BaseModel):
    type: str
    url: str

class SkillsBreakdown(BaseModel):
    technical: List[str] = Field(default_factory=list)
    non_technical: List[str] = Field(default_factory=list)

class RecommendedRole(BaseModel):
    title: str
    match: int = Field(ge=0, le=100)
    domain: str
    category: Optional[str] = "Primary Target"
    reasoning: Optional[str] = ""

class ResumeParsedData(BaseModel):
    full_name: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    summary: str
    education: EducationInfo = Field(default_factory=EducationInfo)
    skills_breakdown: SkillsBreakdown = Field(default_factory=SkillsBreakdown)
    skills: List[str] = Field(default_factory=list)
    projects: List[ProjectInfo] = Field(default_factory=list)
    experience: List[ExperienceInfo] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    links: List[LinkInfo] = Field(default_factory=list)
    inferred_interests: List[str] = Field(default_factory=list)
    confidence_notes: Optional[str] = "Extracted via calibrated semantic parsing"
    strengths: List[str] = Field(default_factory=list)
    gaps: List[str] = Field(default_factory=list)
    recommendedRoles: List[RecommendedRole] = Field(default_factory=list)

class ResumeParseApiResponse(BaseModel):
    success: bool = True
    data: ResumeParsedData
    providerUsed: str = "gemini"
    model: str = "gemini-2.0-flash"
    chunksAnalyzed: int = 1

class ResumeTextRequest(BaseModel):
    text: str
