from fastapi import APIRouter, HTTPException
from schemas.career import (
    CareerRecommendationsRequest,
    CareerRecommendationsApiResponse,
    JobProfilesRequest,
    JobProfilesApiResponse
)
from services.career_service import CareerService

router = APIRouter(prefix="/api/ai", tags=["Career Recommendations"])

@router.post("/career-recommendations", response_model=CareerRecommendationsApiResponse)
async def get_career_recommendations(req: CareerRecommendationsRequest):
    try:
        result = await CareerService.get_career_recommendations(req)
        return CareerRecommendationsApiResponse(
            success=True,
            data=result["data"],
            providerUsed=result["provider_used"],
            model=result["model"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/job-profiles", response_model=JobProfilesApiResponse)
async def get_job_profiles(req: JobProfilesRequest):
    try:
        result = await CareerService.get_job_profiles(req)
        return JobProfilesApiResponse(
            success=True,
            data=result["data"],
            providerUsed=result["provider_used"],
            model=result["model"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
