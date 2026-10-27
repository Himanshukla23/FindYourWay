from fastapi import APIRouter, HTTPException
from schemas.roadmap import (
    RoadmapRequest,
    RoadmapApiResponse
)
from services.roadmap_service import RoadmapService

router = APIRouter(prefix="/api/ai", tags=["Roadmap Generator"])

@router.post("/roadmap", response_model=RoadmapApiResponse)
async def generate_roadmap(req: RoadmapRequest):
    try:
        result = await RoadmapService.generate_roadmap(req)
        return RoadmapApiResponse(
            success=True,
            data=result["data"],
            providerUsed=result["provider_used"],
            model=result["model"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
