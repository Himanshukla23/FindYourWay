import io
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

sys.stdout.reconfigure(line_buffering=True, errors="replace")

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_resume_storage_and_validation():
    print("\nTesting Resume Storage & Magic Bytes Validation (Phase 5.1)...")
    
    # 1. Valid PDF file with %PDF- magic bytes
    pdf_bytes = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"
    r_upload = client.post(
        "/api/storage/resumes",
        files={"file": ("resume.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
        data={"user_id": "student-test"}
    )
    assert r_upload.status_code == 200, f"Upload failed: {r_upload.text}"
    rec = r_upload.json()["data"]
    assert rec["file_type"] == "pdf"
    assert rec["is_active"] is True
    resume_id = rec["id"]
    print(f"  [PASS] Resume stored with valid PDF magic bytes. ID: {resume_id}")

    # 2. Invalid magic bytes rejection
    invalid_bytes = b"\x00\x01\x02\x03\x04\x05NotARealFile"
    r_invalid = client.post(
        "/api/storage/resumes",
        files={"file": ("fake.pdf", io.BytesIO(invalid_bytes), "application/pdf")},
        data={"user_id": "student-test"}
    )
    assert r_invalid.status_code == 400
    print("  [PASS] Invalid file correctly rejected by magic bytes checker (400 Bad Request).")

    # 3. List active resumes
    r_list = client.get("/api/storage/resumes?user_id=student-test")
    assert r_list.status_code == 200
    resumes = r_list.json()["resumes"]
    assert any(r["id"] == resume_id for r in resumes)
    print(f"  [PASS] Resume appears in active storage list ({len(resumes)} total).")

    # 4. Soft delete
    r_del = client.delete(f"/api/storage/resumes/{resume_id}?user_id=student-test")
    assert r_del.status_code == 200
    r_list_after = client.get("/api/storage/resumes?user_id=student-test")
    assert not any(r["id"] == resume_id for r in r_list_after.json()["resumes"])
    print("  [PASS] Resume soft-deleted successfully (excluded from active listings).")

def test_roadmap_persistence_and_progress():
    print("\nTesting Roadmap Persistence & Progress Telemetry (Phase 5.2)...")
    
    # 1. Save new roadmap
    payload = {
        "user_id": "student-test",
        "role_title": "Full Stack Software Engineer",
        "estimated_weeks": 8,
        "difficulty": "Intermediate",
        "tasks": [
            {"id": "task-1", "phase": "Foundations", "title": "Core Modern Architecture", "hours": 12, "skills": ["TypeScript", "Node.js"], "status": "completed"},
            {"id": "task-2", "phase": "Foundations", "title": "Distributed Caching with Redis", "hours": 16, "skills": ["Redis", "Caching"], "status": "not_started"},
            {"id": "task-3", "phase": "Systems", "title": "Relational Data Modeling with PostgreSQL", "hours": 18, "skills": ["PostgreSQL", "RLS"], "status": "not_started"},
            {"id": "task-4", "phase": "Systems", "title": "Automated Multi-Stage CI/CD with Docker", "hours": 20, "skills": ["Docker", "Actions"], "status": "not_started"},
            {"id": "task-5", "phase": "Capstone", "title": "Production Capstone Flagship Project", "hours": 28, "skills": ["End-to-End Architecture"], "status": "not_started"}
        ],
        "capstone": {
            "title": "Distributed Task Platform",
            "recommendedStack": ["Next.js", "Python FastAPI", "Redis", "PostgreSQL"]
        }
    }

    r_save = client.post("/api/progress/roadmap", json=payload)
    assert r_save.status_code == 200, f"Failed: {r_save.text}"
    roadmap = r_save.json()
    roadmap_id = roadmap["id"]
    assert roadmap["total_tasks"] == 5
    assert roadmap["completed_tasks"] == 1
    assert roadmap["progress_percentage"] == 20.0
    print(f"  [PASS] Roadmap saved. Initial progress: {roadmap['progress_percentage']}% (1/5 tasks).")

    # 2. Update task progress (Task 2 completed + notes auto-save)
    r_patch1 = client.patch(
        "/api/progress/tasks/task-2",
        json={"status": "completed", "notes": "Implemented Redis cache-aside invalidation prototype."}
    )
    assert r_patch1.status_code == 200
    task_2 = r_patch1.json()
    assert task_2["status"] == "completed"

    # Verify roadmap percentage recalculation
    r_get = client.get(f"/api/progress/roadmap/{roadmap_id}")
    assert r_get.status_code == 200
    rm_updated = r_get.json()
    assert rm_updated["completed_tasks"] == 2
    assert rm_updated["progress_percentage"] == 40.0
    print(f"  [PASS] Task 2 completed. Progress updated to: {rm_updated['progress_percentage']}% (2/5 tasks).")

    # 3. Update task 3 to in_progress with project link
    r_patch2 = client.patch(
        "/api/progress/tasks/task-3",
        json={"status": "in_progress", "project_link": "https://github.com/student/postgres-rls"}
    )
    assert r_patch2.status_code == 200
    assert r_patch2.json()["project_link"] == "https://github.com/student/postgres-rls"
    print("  [PASS] Task 3 updated to in_progress with GitHub project link auto-saved.")

    # 4. List user roadmaps
    r_list = client.get("/api/progress/roadmaps?user_id=student-test")
    assert r_list.status_code == 200
    assert len(r_list.json()) >= 1
    print(f"  [PASS] Roadmap history retrievable for student ({len(r_list.json())} saved).")

def test_saved_items():
    print("\nTesting Saved Items / Bookmarks (Phase 5.3)...")
    
    # 1. Bookmark a Job Profile
    r_job = client.post(
        "/api/saved-items?user_id=student-test&title=Backend Software Engineer",
        json={"item_type": "job_profile", "item_id": "job-1"}
    )
    assert r_job.status_code == 200
    print("  [PASS] Bookmarked job profile 'job-1'.")

    # 2. Bookmark a Mentor
    r_mentor = client.post(
        "/api/saved-items?user_id=student-test&title=Aarav Sharma",
        json={"item_type": "mentor", "item_id": "mentor-1"}
    )
    assert r_mentor.status_code == 200
    print("  [PASS] Bookmarked mentor 'mentor-1'.")

    # 3. List bookmarks
    r_list = client.get("/api/saved-items?user_id=student-test")
    assert r_list.status_code == 200
    items = r_list.json()["saved_items"]
    assert len(items) == 2
    print(f"  [PASS] Listed saved items: {len(items)} items saved.")

    # 4. Unsave an item
    r_unsave = client.delete("/api/saved-items/job_profile/job-1?user_id=student-test")
    assert r_unsave.status_code == 200
    r_list_after = client.get("/api/saved-items?user_id=student-test")
    assert len(r_list_after.json()["saved_items"]) == 1
    print("  [PASS] Unsaved item. Remaining saved count: 1.")

def test_ai_analysis_history():
    print("\nTesting AI Analysis History (Phase 5.4)...")
    
    payload = {
        "user_id": "student-test",
        "summary": "Software engineer with solid C++ and distributed systems competencies",
        "top_role": "Backend Software Engineer",
        "match_score": 95,
        "skills": ["C++", "Redis", "TypeScript", "Docker"],
        "strengths": ["Competitive programming (590+ LeetCode problems)", "Distributed caching"],
        "gaps": ["Telemetry observability suites"],
        "recommended_roles": [
            {"title": "Backend Software Engineer", "match": 95, "domain": "Software Engineering"}
        ]
    }

    r_save = client.post("/api/history/analyses", json=payload)
    assert r_save.status_code == 200
    saved_ana = r_save.json()
    assert saved_ana["top_role"] == "Backend Software Engineer"
    print(f"  [PASS] Saved AI analysis to history. ID: {saved_ana['id']}")

    r_list = client.get("/api/history/analyses?user_id=student-test")
    assert r_list.status_code == 200
    history = r_list.json()["analyses"]
    assert len(history) >= 1
    print(f"  [PASS] Retrieved analysis history ({len(history)} entry/entries).")

def test_student_profile_and_onboarding():
    print("\nTesting Student Profile & Onboarding Responses (Phase 5.5)...")
    
    # 1. Fetch default profile
    r_prof = client.get("/api/students/profile?user_id=student-default")
    assert r_prof.status_code == 200
    prof = r_prof.json()
    assert prof["user_id"] == "student-default"
    print(f"  [PASS] Student profile loaded: {prof['full_name']} ({prof['degree']} in {prof['branch']}).")

    # 2. Submit onboarding responses
    onboarding_payload = {
        "interests": ["Distributed Systems", "Cloud Native", "AI Platforms"],
        "preferred_work_style": ["Autonomous Builder", "Small Fast Team"],
        "learning_preference": ["Hands-on Project Building", "System Design Teardowns"],
        "career_goals": ["Land placement at Tier-1 product tech company"],
        "challenges": "Transitioning from academic algorithms to production deployment",
        "hours_per_week": 20
    }

    r_onboard = client.post(
        "/api/students/onboarding?user_id=student-default",
        json=onboarding_payload
    )
    assert r_onboard.status_code == 200
    updated_prof = r_onboard.json()
    assert updated_prof["onboarding_completed"] is True
    assert updated_prof["onboarding_answers"]["hours_per_week"] == 20
    print("  [PASS] Onboarding responses submitted & persisted (onboarding_completed: True).")

if __name__ == "__main__":
    print("=" * 60)
    print("RUNNING PATHPILOT PHASE 5 (PERSISTENCE & STORAGE) TEST SUITE")
    print("=" * 60)
    test_resume_storage_and_validation()
    test_roadmap_persistence_and_progress()
    test_saved_items()
    test_ai_analysis_history()
    test_student_profile_and_onboarding()
    print("\n" + "=" * 60)
    print("ALL PHASE 5 PERSISTENCE TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 60)
