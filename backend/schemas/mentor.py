from typing import List, Optional
from pydantic import BaseModel, Field

class MentorMatchRequest(BaseModel):
    targetRole: str = "Full Stack Software Engineer"
    skillGaps: List[str] = Field(default_factory=list)
    consultationGoal: str = "Resume Review & Technical Mock Interview"
    budgetMax: Optional[int] = 2000

class MentorMatchItem(BaseModel):
    mentorId: str
    name: str
    role: str
    company: str
    avatarUrl: Optional[str] = ""
    matchScore: int = Field(ge=0, le=100)
    matchReasons: List[str] = Field(default_factory=list)
    recommendedTopic: str
    sessionFee: int
    availableSlot: str

class MentorMatchData(BaseModel):
    targetRole: str
    consultationGoal: str
    matchedMentors: List[MentorMatchItem]

class MentorMatchApiResponse(BaseModel):
    success: bool = True
    data: MentorMatchData
    providerUsed: str = "gemini"
    model: str = "gemini-2.0-flash"
