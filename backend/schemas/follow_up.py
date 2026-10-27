from typing import List, Optional, Dict
from pydantic import BaseModel, Field

class FollowUpQuestionsRequest(BaseModel):
    role: str = "Full Stack Engineer"
    skills: List[str] = Field(default_factory=list)
    summary: Optional[str] = ""

class QuestionItem(BaseModel):
    id: str
    question: str
    whyAsked: str
    category: str = "Technical Depth"
    options: List[str] = Field(default_factory=list)

class FollowUpQuestionsData(BaseModel):
    role: str
    questions: List[QuestionItem]

class FollowUpQuestionsApiResponse(BaseModel):
    success: bool = True
    data: FollowUpQuestionsData
    providerUsed: str = "gemini"
    model: str = "gemini-2.0-flash"

class FollowUpRefineRequest(BaseModel):
    originalRole: str
    skills: List[str] = Field(default_factory=list)
    answers: Dict[str, str] = Field(default_factory=dict)

class RefinedCareerData(BaseModel):
    refinedRole: str
    calibratedMatch: int = Field(ge=0, le=100)
    readinessLevel: str
    customAdvice: str
    recommendedNextStep: str

class FollowUpRefineApiResponse(BaseModel):
    success: bool = True
    data: RefinedCareerData
    providerUsed: str = "gemini"
    model: str = "gemini-2.0-flash"
