from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from schemas.marketplace import (
    MentorProfileSchema,
    MentorListResponse,
    MentorSlotsResponse
)
from services.marketplace_service import MarketplaceService

router = APIRouter(prefix="/api/mentors", tags=["Mentor Marketplace"])

@router.get("", response_model=MentorListResponse)
async def list_mentors(
    search: Optional[str] = Query(None, description="Search by mentor name, company, or skills"),
    domain: Optional[str] = Query(None, description="Filter by career domain"),
    max_price: Optional[int] = Query(None, description="Filter by maximum price in INR"),
    min_rating: Optional[float] = Query(None, description="Filter by minimum rating (e.g. 4.8)"),
    sort_by: Optional[str] = Query("rating", description="Sort by: rating, price_asc, price_desc, experience")
):
    """
    Search, filter, and sort mentor directory across all tech domains.
    """
    result = MarketplaceService.get_mentors(
        search=search,
        domain=domain,
        max_price=max_price,
        min_rating=min_rating,
        sort_by=sort_by
    )
    return MentorListResponse(
        success=True,
        total=result["total"],
        domains=result["domains"],
        mentors=result["mentors"]
    )

@router.get("/{mentor_id}", response_model=MentorProfileSchema)
async def get_mentor(mentor_id: str):
    """
    Get detailed profile of a specific mentor.
    """
    mentor = MarketplaceService.get_mentor_by_id(mentor_id)
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor profile not found.")
    return mentor

@router.get("/{mentor_id}/slots", response_model=MentorSlotsResponse)
async def get_mentor_slots(mentor_id: str):
    """
    Retrieve auto-generated available bookable slots for the mentor for the next 14 days.
    Already-booked slots are flagged is_booked = true.
    """
    mentor = MarketplaceService.get_mentor_by_id(mentor_id)
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found.")

    slots = MarketplaceService.generate_slots_for_mentor(mentor_id)
    return MentorSlotsResponse(
        success=True,
        mentor_id=mentor.id,
        mentor_name=mentor.full_name,
        total_slots=len(slots),
        slots=slots
    )
