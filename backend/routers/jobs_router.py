"""
FastAPI Router for Job Board & Intelligence Engine (Architecture Spec 2.0)
High performance, non-blocking asynchronous endpoints with sub-millisecond query caching.
"""

from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query, BackgroundTasks, status

from schemas.job_schemas import (
    JobListResponse,
    JobResponse,
    JobFilterQuery,
    JobMatchRequest,
    JobMatchResult,
    JobSaveRequest,
    JobApplyRequest,
    JobTailorRequest,
    JobTailorResponse
)
from services.job_scraper_service import JobEngineService
from services.job_verifier_service import JobVerifierService
from services.job_match_service import JobMatchService
from services.job_tailor_service import JobTailorService

router = APIRouter(prefix="/api/jobs", tags=["Job Board & Match Engine"])


@router.get("", response_model=JobListResponse)
async def list_jobs(
    search: Optional[str] = Query(None, description="Free text keyword search across title, company, skills"),
    country: Optional[str] = Query(None, description="Region filter: 'India', 'Global', 'Remote', or 'All'"),
    work_mode: Optional[str] = Query(None, description="'Remote', 'Hybrid', 'On-site', or 'All'"),
    role_category: Optional[str] = Query(None, description="'Product', 'Software Engineering', 'Design', 'Data & Analytics', 'Cloud & DevOps', etc."),
    exp_range: Optional[str] = Query(None, description="Experience level: '0-1', '1-3', '3+', or 'All'"),
    sort_by: Optional[str] = Query("newest", description="'newest', 'verified', 'salary'"),
    limit: int = Query(30, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user_email: Optional[str] = Query(None, description="User email for bookmark and application state lookup")
):
    """
    Sub-millisecond filtered query across active job catalog.
    """
    query = JobFilterQuery(
        search=search,
        country=country,
        work_mode=work_mode,
        role_category=role_category,
        exp_range=exp_range,
        sort_by=sort_by,
        limit=limit,
        offset=offset
    )
    return JobEngineService.query_jobs(query, user_email=user_email)


@router.get("/{job_id}", response_model=JobResponse)
async def get_job_details(
    job_id: str,
    user_email: Optional[str] = Query(None)
):
    """
    Retrieve single job listing with full JD and verified recruiter hiring contact.
    """
    job = JobEngineService.get_job_by_id(job_id, user_email=user_email)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job posting with ID '{job_id}' not found."
        )
    return job


@router.post("/sync")
async def trigger_live_sync(background_tasks: BackgroundTasks):
    """
    Triggers non-blocking background ingestion across company ATS feeds.
    """
    background_tasks.add_task(JobEngineService.run_live_sync)
    return {
        "status": "accepted",
        "message": "Background job ingestion sync triggered across registered ATS boards."
    }


@router.post("/verify")
async def trigger_link_verification(background_tasks: BackgroundTasks):
    """
    Triggers automated link health check to retire closed/404 postings.
    """
    background_tasks.add_task(JobVerifierService.sweep_active_jobs)
    return {
        "status": "accepted",
        "message": "Link health sweeper dispatched in background."
    }


@router.post("/{job_id}/save")
async def save_job_bookmark(job_id: str, payload: JobSaveRequest):
    """
    Saves a job to the student's wishlist.
    """
    job = JobEngineService.get_job_by_id(job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    
    is_saved = JobEngineService.toggle_save_job(payload.user_email, job_id, save=True)
    return {"status": "success", "saved": is_saved, "job_id": job_id}


@router.delete("/{job_id}/save")
async def remove_saved_job(job_id: str, user_email: str = Query(...)):
    """
    Removes a job from the student's wishlist.
    """
    JobEngineService.toggle_save_job(user_email, job_id, save=False)
    return {"status": "success", "saved": False, "job_id": job_id}


@router.get("/user/saved")
async def get_user_saved_jobs(user_email: str = Query(...)):
    """
    Lists all saved jobs for a student.
    """
    jobs = JobEngineService.list_saved_jobs(user_email)
    return {"user_email": user_email, "total": len(jobs), "saved_jobs": jobs}


@router.post("/{job_id}/apply")
async def track_application(job_id: str, payload: JobApplyRequest):
    """
    Records an application in the student's pipeline (applied, interviewing, offered).
    """
    job = JobEngineService.get_job_by_id(job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    record = JobEngineService.record_application(
        user_email=payload.user_email,
        job_id=job_id,
        status=payload.status,
        notes=payload.notes or ""
    )
    return {"status": "success", "record": record}


@router.get("/user/applied")
async def get_user_applied_jobs(user_email: str = Query(...)):
    """
    Lists all tracked applications for a student.
    """
    records = JobEngineService.list_applied_jobs(user_email)
    return {"user_email": user_email, "total": len(records), "applications": records}


@router.post("/match", response_model=JobMatchResult)
async def match_resume(payload: JobMatchRequest):
    """
    Evaluates candidate resume fit score against a job opening.
    """
    job = JobEngineService.get_job_by_id(payload.job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    return await JobMatchService.match_resume_to_job(
        job=job,
        resume_text=payload.resume_text,
        student_skills=payload.student_skills
    )


@router.post("/tailor", response_model=JobTailorResponse)
async def tailor_resume_bullets(payload: JobTailorRequest):
    """
    Generates ATS-optimized STAR bullets, recruiter LinkedIn DMs, and key ATS keywords.
    """
    job = JobEngineService.get_job_by_id(payload.job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    return await JobTailorService.tailor_resume_for_job(job=job, request=payload)


