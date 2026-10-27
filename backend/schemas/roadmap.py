from typing import List, Optional
from pydantic import BaseModel, Field

class RoadmapRequest(BaseModel):
    roleTitle: str = "Full Stack Engineer"
    hoursPerWeek: int = Field(default=15, ge=5, le=60)
    graduationYear: str = "2026"
    existingSkills: List[str] = Field(default_factory=list)

class MilestoneTask(BaseModel):
    id: str
    phase: str
    title: str
    desc: str
    deliverable: str
    hours: int
    skills: List[str] = Field(default_factory=list)
    resources: List[str] = Field(default_factory=list)

class CapstoneProject(BaseModel):
    title: str
    description: str
    deliverables: List[str] = Field(default_factory=list)
    recommendedStack: List[str] = Field(default_factory=list)

class RoadmapData(BaseModel):
    role: str
    estimatedWeeks: int
    difficulty: str = "Intermediate"
    prerequisites: List[str] = Field(default_factory=list)
    tasks: List[MilestoneTask] = Field(default_factory=list)
    capstoneProject: CapstoneProject

class RoadmapApiResponse(BaseModel):
    success: bool = True
    data: RoadmapData
    providerUsed: str = "gemini"
    model: str = "gemini-2.0-flash"
