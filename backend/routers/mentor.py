from fastapi import APIRouter, HTTPException
from schemas.mentor import (
    MentorMatchRequest,
    MentorMatchApiResponse
)
from services.mentor_matcher_service import MentorMatcherService

router = APIRouter(prefix="/api/ai", tags=["Mentor Matcher"])

@router.post("/mentor-match", response_model=MentorMatchApiResponse)
async def match_mentors(req: MentorMatchRequest):
    try:
        result = await MentorMatcherService.match_mentors(req)
        return MentorMatchApiResponse(
            success=True,
            data=result["data"],
            providerUsed=result["provider_used"],
            model=result["model"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
