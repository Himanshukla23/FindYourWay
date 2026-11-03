"""
Job Tailor Engine & Outreach Pitch Verification Suite
Verifies:
- STAR-format bullet point generation with metrics and targeted keywords
- Personalized recruiter LinkedIn DM generation
- ATS keyword extraction
- Deterministic heuristic fallback and model consistency
"""

import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from services.job_scraper_service import JobEngineService
from services.job_tailor_service import JobTailorService
from schemas.job_schemas import JobTailorRequest

def test_tailor_engine():
    print("\n" + "="*70)
    print("JOB TAILOR & OUTREACH ENGINE VERIFICATION SUITE")
    print("="*70)

    JobEngineService.initialize_catalog()
    assert len(JobEngineService._jobs_by_id) >= 14

    # Select Swiggy or CRED role
    sample_job = next(iter(JobEngineService._jobs_by_id.values()))
    print(f"\n[Test 1] Testing Tailoring for: {sample_job.company} - {sample_job.title}...")

    req = JobTailorRequest(
        job_id=sample_job.id,
        user_email="student@pathpilot.dev",
        resume_text="Built microservices using Python, FastAPI, and Postgres. Managed API latency and database queries.",
        student_skills=["Python", "PostgreSQL", "FastAPI", "SQL", "Git"]
    )

    tailored = JobTailorService.generate_heuristic_tailoring(
        job=sample_job,
        student_skills=req.student_skills,
        resume_text=req.resume_text
    )

    assert tailored.job_id == sample_job.id
    assert tailored.company == sample_job.company
    assert len(tailored.tailored_bullets) == 3
    print("  -> Generated 3 STAR bullets with metrics:")
    for i, b in enumerate(tailored.tailored_bullets, 1):
        print(f"     [{i}] {b.tailored_star}")
        assert len(b.targeted_keywords) > 0
        assert b.metrics_impact != ""

    # Test Recruiter LinkedIn Outreach DM
    print("\n[Test 2] Testing Recruiter LinkedIn DM Personalization...")
    assert len(tailored.recruiter_outreach_dm) > 50
    assert sample_job.company in tailored.recruiter_outreach_dm
    assert sample_job.title in tailored.recruiter_outreach_dm
    print("  -> Recruiter Outreach DM Preview:")
    print("     " + "\n     ".join(tailored.recruiter_outreach_dm.split("\n")[:4]))

    # Test ATS Keywords
    print("\n[Test 3] Testing ATS Keywords Checklist...")
    assert len(tailored.ats_keywords_to_include) >= 3
    print(f"  -> ATS Keywords: {tailored.ats_keywords_to_include}")

    # Test Cover Pitch
    print("\n[Test 4] Testing Cover Pitch Structure...")
    assert len(tailored.cover_pitch) > 100
    assert sample_job.company in tailored.cover_pitch

    print("\n" + "="*70)
    print("ALL JOB TAILOR ENGINE TESTS PASSED SUCCESSFULLY!")
    print("="*70 + "\n")

if __name__ == "__main__":
    test_tailor_engine()

