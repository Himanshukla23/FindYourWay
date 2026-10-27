from typing import List, Optional, Dict
from pydantic import BaseModel, Field

# ─── Career Recommendations ───────────────────────────────────────────

class CareerRecommendationsRequest(BaseModel):
    skills: List[str] = Field(default_factory=list)
    summary: Optional[str] = ""
    degree: Optional[str] = "B.Tech / B.E."
    branch: Optional[str] = "Computer Science"
    targetGoal: Optional[str] = "full_time_placement"
    preferredDomains: List[str] = Field(default_factory=list)

class DomainRecommendation(BaseModel):
    domainId: str
    domainName: str
    suitabilityScore: int = Field(ge=0, le=100)
    matchedRole: str
    category: str = "Primary Fit"
    evidence: List[str] = Field(default_factory=list)
    criticalGaps: List[str] = Field(default_factory=list)
    suggestedFirstAction: str

class CareerRecommendationsData(BaseModel):
    overallAssessment: str
    recommendations: List[DomainRecommendation]

class CareerRecommendationsApiResponse(BaseModel):
    success: bool = True
    data: CareerRecommendationsData
    providerUsed: str = "gemini"
    model: str = "gemini-2.0-flash"


# ─── Job Profiles ─────────────────────────────────────────────────────

class JobProfilesRequest(BaseModel):
    domain: str
    skills: List[str] = Field(default_factory=list)
    degree: Optional[str] = "B.Tech / B.E."
    branch: Optional[str] = "Computer Science"

class SalaryRange(BaseModel):
    entryLevel: str = "₹6 - ₹10 LPA"
    midLevel: str = "₹12 - ₹20 LPA"

class JobProfileItem(BaseModel):
    id: str
    title: str
    category: str = "Entry-level"
    matchScore: int = Field(ge=0, le=100)
    coreSkills: List[str] = Field(default_factory=list)
    salaryRange: SalaryRange = Field(default_factory=SalaryRange)
    demandLevel: str = "High"
    whyFit: str
    dayInTheLife: str

class JobProfilesData(BaseModel):
    domain: str
    profiles: List[JobProfileItem]

class JobProfilesApiResponse(BaseModel):
    success: bool = True
    data: JobProfilesData
    providerUsed: str = "gemini"
    model: str = "gemini-2.0-flash"
