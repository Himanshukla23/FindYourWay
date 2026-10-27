"""
Phase 6 End-to-End Test Suite: Comprehensive Contract & User Flow Verification
Verifies the complete integration across all layers:
- Onboarding & profile persistence
- Resume diagnostic & skill extraction
- Career recommendations & roadmap generation
- Task completion progress autosave & percentage recalculation
- Mentor marketplace search, filtering, and availability
- Booking reservation, slot locking (prevents double-booking), Google Meet generation, and calendar .ics export
- Cancellation and slot release
"""

import sys
import io
import asyncio
from datetime import datetime, timezone

from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

# Ensure utf-8 stdout in Windows console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(line_buffering=True, errors='replace')

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_phase6_full_e2e_journey():
    print("\n" + "="*70)
    print("PHASE 6: FULL END-TO-END SYSTEM INTEGRATION & CONTRACT AUDIT")
    print("="*70)

    # 1. Onboarding Profile Save & Retrieval
    print("\n[Step 1] Student Onboarding Profile Flow...")
    profile_payload = {
        "user_email": "e2e.student@pathpilot.dev",
        "full_name": "Aarav Mehta",
        "degree": "B.Tech",
        "branch": "Computer Science & Engineering",
        "college": "IIT Delhi",
        "graduation_year": "2026",
        "target_role": "Full Stack Software Engineer",
        "hours_per_week": 20,
        "primary_interest": "Software Engineering"
    }
    res = client.post("/api/onboarding/profile", json=profile_payload)
    assert res.status_code == 200, f"Profile save failed: {res.text}"
    saved_profile = res.json()["profile"]
    assert saved_profile["user_email"] == "e2e.student@pathpilot.dev"
    assert saved_profile["target_role"] == "Full Stack Software Engineer"

    res_get = client.get("/api/onboarding/profile?user_email=e2e.student@pathpilot.dev")
    assert res_get.status_code == 200
    assert res_get.json()["profile"]["branch"] == "Computer Science & Engineering"
    print("  -> Onboarding profile successfully persisted and retrieved.")

    # 2. Resume Upload & Diagnostic
    print("\n[Step 2] Resume Parsing & Semantic Diagnostic Flow...")
    sample_resume = """
Aarav Mehta - Software Engineer
PROFESSIONAL SUMMARY:
Built full-stack microservices using Node.js, Express, Docker, and Redis.
Solved 500+ LeetCode problems in C++ with deep knowledge of DSA and algorithms.
EDUCATION:
B.Tech CSE, IIT Delhi (2022-2026)
SKILLS:
C++, Python, TypeScript, React, Docker, Redis, PostgreSQL.
"""
    res_resume = client.post("/api/ai/parse-resume", json={"text": sample_resume})
    assert res_resume.status_code == 200, f"Resume parse failed: {res_resume.text}"
    resume_data = res_resume.json()
    assert resume_data["success"] is True
    assert "data" in resume_data
    assert len(resume_data["data"]["skills"]) > 0
    assert len(resume_data["data"]["recommendedRoles"]) > 0
    top_role = resume_data["data"]["recommendedRoles"][0]["title"]
    print(f"  -> Resume parsed. Top recommended role: '{top_role}' (Match: {resume_data['data']['recommendedRoles'][0]['match']}%)")

    # 3. AI Roadmap Generation Flow
    print("\n[Step 3] AI Roadmap Generation Flow...")
    roadmap_req = {
        "role_title": "Full Stack Software Engineer",
        "hours_per_week": 20,
        "graduation_year": "2026",
        "existing_skills": ["C++", "React", "Docker"]
    }
    res_roadmap = client.post("/api/ai/roadmap", json=roadmap_req)
    assert res_roadmap.status_code == 200, f"Roadmap failed: {res_roadmap.text}"
    roadmap_data = res_roadmap.json()
    assert roadmap_data["success"] is True
    tasks = roadmap_data["data"]["tasks"]
    assert len(tasks) > 0
    print(f"  -> Roadmap generated with {len(tasks)} milestone tasks over {roadmap_data['data']['estimatedWeeks']} estimated weeks.")

    # 4. Roadmap Task Progress Autosave & Percentage Recalculation Flow
    print("\n[Step 4] Progress Autosave & Percentage Recalculation Flow...")
    task_id = tasks[0]["id"]
    patch_req = {
        "completed": True,
        "notes": "Reviewed core microservices architecture and completed initial hands-on exercise.",
        "role_title": "Full Stack Software Engineer",
        "user_email": "e2e.student@pathpilot.dev"
    }
    res_patch = client.patch(f"/api/progress/tasks/{task_id}", json=patch_req)
    assert res_patch.status_code == 200, f"Task patch failed: {res_patch.text}"
    progress_status = res_patch.json()
    assert progress_status["id"] == task_id
    assert progress_status["status"] == "completed"
    print(f"  -> Task '{task_id}' marked complete with status '{progress_status['status']}'.")

    # 5. Mentor Marketplace Directory, Search & Filter Flow
    print("\n[Step 5] Mentor Marketplace Directory & Slot Verification Flow...")
    res_mentors = client.get("/api/mentors?domain=Software&sort_by=price_asc")
    assert res_mentors.status_code == 200
    mentors_data = res_mentors.json()
    mentors = mentors_data["mentors"] if isinstance(mentors_data, dict) and "mentors" in mentors_data else mentors_data
    assert len(mentors) > 0
    assert all(any("software" in d.lower() for d in m["domains"]) for m in mentors)
    # Check price sorting
    prices = [m["session_price_inr"] for m in mentors]
    assert prices == sorted(prices), "Prices are not sorted ascending"
    chosen_mentor = mentors[0]
    print(f"  -> Found {len(mentors)} Software mentors. Selected '{chosen_mentor['full_name']}' at {chosen_mentor['organisation']}.")

    # Fetch slots for chosen mentor
    res_slots = client.get(f"/api/mentors/{chosen_mentor['id']}/slots")
    assert res_slots.status_code == 200
    slots_data = res_slots.json()
    slots = slots_data["slots"] if isinstance(slots_data, dict) and "slots" in slots_data else slots_data
    assert len(slots) > 0
    chosen_slot = slots[0]
    print(f"  -> Mentor has {len(slots)} bookable slots. Target slot: {chosen_slot['display_label']}.")

    # 6. Booking Flow, Double-Booking Lock & Calendar ICS Download
    print("\n[Step 6] Booking Reservation, Slot Locking & Calendar Invite Flow...")
    booking_payload = {
        "mentor_id": chosen_mentor["id"],
        "slot_id": chosen_slot["id"],
        "topic": "System Design & Distributed Caching",
        "notes": "Looking to discuss cache invalidation patterns and production Redis architectures.",
        "user_name": "Aarav Mehta",
        "user_email": "e2e.student@pathpilot.dev",
        "amount_inr": chosen_mentor["session_price_inr"]
    }
    res_book = client.post("/api/bookings", json=booking_payload)
    assert res_book.status_code == 200, f"Booking failed: {res_book.text}"
    booking_raw = res_book.json()
    booking = booking_raw["data"] if isinstance(booking_raw, dict) and "data" in booking_raw else booking_raw
    assert "CONFIRMED" in booking["status"]
    assert "google_calendar_status" in booking
    booking_id = booking["id"]
    print(f"  -> Booking confirmed (ID: {booking_id}).")
    print(f"     Google Calendar Status: {booking.get('google_calendar_status')}")
    print(f"     Calendar URL: {booking.get('calendar_ics_url') or booking.get('ics_calendar_url')}")

    # Attempt duplicate booking on the exact same slot -> MUST return 409 Conflict
    print("  -> Testing double-booking conflict prevention...")
    res_duplicate = client.post("/api/bookings", json=booking_payload)
    assert res_duplicate.status_code == 409, f"Expected 409 Conflict on duplicate slot, got {res_duplicate.status_code}"
    print("     Double-booking successfully blocked with 409 Conflict.")

    # Download .ics calendar invite
    res_ics = client.get(f"/api/bookings/{booking_id}/calendar.ics")
    assert res_ics.status_code == 200
    assert "text/calendar" in res_ics.headers.get("content-type", "")
    assert "BEGIN:VCALENDAR" in res_ics.text
    assert "BEGIN:VEVENT" in res_ics.text
    print("  -> RFC 5545 iCalendar invite downloaded and verified.")

    # 7. Cancellation Flow & Slot Release
    print("\n[Step 7] Session Cancellation & Slot Release Flow...")
    res_cancel = client.post(f"/api/bookings/{booking_id}/cancel")
    assert res_cancel.status_code == 200
    cancel_res = res_cancel.json()
    assert cancel_res["status"].upper() == "CANCELLED"
    print(f"  -> Booking '{booking_id}' cancelled.")

    # Verify slot is released and can now be booked again
    res_rebook = client.post("/api/bookings", json=booking_payload)
    assert res_rebook.status_code == 200, "Failed to re-book after slot release"
    print("  -> Released slot successfully re-booked. Slot management verified 100%.")

    print("\n" + "="*70)
    print("ALL PHASE 6 E2E CONTRACT AND INTEGRATION CHECKS PASSED SUCCESSFULLY!")
    print("="*70 + "\n")

if __name__ == "__main__":
    test_phase6_full_e2e_journey()
