from fastapi import APIRouter, HTTPException
from schemas.follow_up import (
    FollowUpQuestionsRequest,
    FollowUpQuestionsApiResponse,
    FollowUpRefineRequest,
    FollowUpRefineApiResponse
)
from services.follow_up_service import FollowUpService

router = APIRouter(prefix="/api/ai", tags=["Career Follow-Up & Refinement"])

@router.post("/follow-up", response_model=FollowUpQuestionsApiResponse)
async def generate_follow_up_questions(req: FollowUpQuestionsRequest):
    try:
        result = await FollowUpService.generate_questions(req)
        return FollowUpQuestionsApiResponse(
            success=True,
            data=result["data"],
            providerUsed=result["provider_used"],
            model=result["model"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/follow-up/refine", response_model=FollowUpRefineApiResponse)
async def refine_career_profile(req: FollowUpRefineRequest):
    try:
        result = await FollowUpService.refine_career(req)
        return FollowUpRefineApiResponse(
            success=True,
            data=result["data"],
            providerUsed=result["provider_used"],
            model=result["model"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
