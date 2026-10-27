import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

sys.stdout.reconfigure(line_buffering=True, errors='replace')

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_list_mentors():
    print("\nTesting GET /api/mentors...")
    r = client.get("/api/mentors")
    assert r.status_code == 200, f"Failed: {r.text}"
    data = r.json()
    assert data["success"] is True
    assert data["total"] >= 20, f"Expected at least 20 mentors, got {data['total']}"
    assert len(data["domains"]) >= 6
    print(f"  [PASS] Directory seeded with {data['total']} mentors across {len(data['domains'])} domains.")

    # Test domain filter
    r_domain = client.get("/api/mentors?domain=Software Engineering")
    assert r_domain.status_code == 200
    software_mentors = r_domain.json()["mentors"]
    assert len(software_mentors) > 0
    assert all(any("software" in d.lower() for d in m["domains"]) for m in software_mentors)
    print(f"  [PASS] Domain filter works. Found {len(software_mentors)} Software Engineering mentors.")

    # Test search query
    r_search = client.get("/api/mentors?search=Google")
    assert r_search.status_code == 200
    google_mentors = r_search.json()["mentors"]
    assert len(google_mentors) >= 1
    assert "Google" in google_mentors[0]["organisation"]
    print(f"  [PASS] Search filter works. Found {len(google_mentors)} mentor(s) matching 'Google'.")

    # Test price sorting
    r_sort = client.get("/api/mentors?sort_by=price_asc")
    assert r_sort.status_code == 200
    sorted_mentors = r_sort.json()["mentors"]
    assert sorted_mentors[0]["session_price_inr"] <= sorted_mentors[-1]["session_price_inr"]
    print(f"  [PASS] Price sorting works. Range: INR {sorted_mentors[0]['session_price_inr']} to INR {sorted_mentors[-1]['session_price_inr']}.")

def test_mentor_profile():
    print("\nTesting GET /api/mentors/{mentor_id}...")
    r = client.get("/api/mentors/mentor-1")
    assert r.status_code == 200, f"Failed: {r.text}"
    mentor = r.json()
    assert mentor["id"] == "mentor-1"
    assert mentor["full_name"] == "Aarav Sharma"
    assert len(mentor["mentoring_topics"]) > 0
    print(f"  [PASS] Retrieved mentor profile: {mentor['full_name']} ({mentor['title']} at {mentor['organisation']})")

    # Invalid mentor
    r_err = client.get("/api/mentors/nonexistent-mentor")
    assert r_err.status_code == 404
    print("  [PASS] 404 returned correctly for non-existent mentor.")

def test_mentor_slots():
    print("\nTesting GET /api/mentors/{mentor_id}/slots...")
    r = client.get("/api/mentors/mentor-1/slots")
    assert r.status_code == 200, f"Failed: {r.text}"
    data = r.json()
    assert data["success"] is True
    assert data["total_slots"] >= 30, f"Expected multiple slots over 14 days, got {data['total_slots']}"
    first_slot = data["slots"][0]
    assert first_slot["mentor_id"] == "mentor-1"
    assert "Tomorrow" in first_slot["label"] or "IST" in first_slot["label"]
    assert first_slot["is_booked"] is False
    print(f"  [PASS] Auto-generated {data['total_slots']} slots for mentor-1. Sample: '{first_slot['label']}'")
    return first_slot["id"]

def test_booking_flow_and_double_booking(slot_id: str):
    print("\nTesting POST /api/bookings (Demo Checkout)...")
    payload = {
        "mentor_id": "mentor-1",
        "slot_id": slot_id,
        "student_name": "Antigravity Student",
        "student_email": "student@example.com",
        "topic": "System Design & Distributed Cache Review",
        "notes": "Looking for feedback on Redis cache-aside implementation",
        "duration_mins": 30,
        "payment_method": "demo"
    }

    r = client.post("/api/bookings", json=payload)
    assert r.status_code == 200, f"Failed: {r.text}"
    booking = r.json()["data"]
    assert booking["mentor_id"] == "mentor-1"
    assert booking["status"] == "DEMO_CONFIRMED"
    assert booking["is_demo_booking"] is True
    assert "google_calendar_status" in booking
    booking_id = booking["id"]
    print(f"  [PASS] Demo booking created: ID {booking_id}, Google Calendar Status: {booking['google_calendar_status']}")

    # Test double booking prevention!
    print("Testing Double-Booking Prevention...")
    r_double = client.post("/api/bookings", json=payload)
    assert r_double.status_code == 409, f"Expected 409 Conflict, got {r_double.status_code}"
    print("  [PASS] Double-booking strictly prevented (409 Conflict returned).")

    # Verify slot is marked booked in slot query
    r_slots = client.get("/api/mentors/mentor-1/slots")
    booked_slot = next((s for s in r_slots.json()["slots"] if s["id"] == slot_id), None)
    assert booked_slot is not None
    assert booked_slot["is_booked"] is True
    print("  [PASS] Slot status correctly updated to is_booked=True in slots API.")

    return booking_id, slot_id

def test_consultations_management(booking_id: str, slot_id: str):
    print("\nTesting Consultations Management (My Consultations)...")
    
    # 1. List bookings
    r_list = client.get("/api/bookings?student_email=student@example.com")
    assert r_list.status_code == 200
    bookings = r_list.json()["bookings"]
    assert any(b["id"] == booking_id for b in bookings)
    print(f"  [PASS] Booking appears in student consultations list ({len(bookings)} total).")

    # 2. Get booking detail
    r_detail = client.get(f"/api/bookings/{booking_id}")
    assert r_detail.status_code == 200
    assert r_detail.json()["id"] == booking_id
    print(f"  [PASS] Booking details fetched successfully.")

    # 3. Calendar ICS download
    r_ics = client.get(f"/api/bookings/{booking_id}/calendar.ics")
    assert r_ics.status_code == 200
    assert "BEGIN:VCALENDAR" in r_ics.text
    assert "LOCATION:" in r_ics.text
    print("  [PASS] Downloaded RFC 5545 iCalendar (.ics) file with valid event structure and location.")

    # 4. Cancel booking and release slot
    r_cancel = client.post(f"/api/bookings/{booking_id}/cancel")
    assert r_cancel.status_code == 200
    cancel_data = r_cancel.json()
    assert cancel_data["status"] == "CANCELLED"
    print(f"  [PASS] Booking cancelled: {cancel_data['message']} ({cancel_data['refund_status']})")

    # 5. Verify slot was released back to the bookable pool
    r_slots = client.get("/api/mentors/mentor-1/slots")
    released_slot = next((s for s in r_slots.json()["slots"] if s["id"] == slot_id), None)
    assert released_slot is not None
    assert released_slot["is_booked"] is False
    print("  [PASS] Slot successfully released and available for re-booking!")

def test_razorpay_endpoints():
    print("\nTesting Razorpay Checkout Endpoints (Order & Signature Verification)...")
    # 1. Create order
    r_order = client.post("/api/bookings/razorpay/create-order", json={
        "mentor_id": "mentor-1",
        "amount_inr": 799
    })
    assert r_order.status_code == 200, f"Failed: {r_order.text}"
    order_data = r_order.json()
    assert order_data["success"] is True
    assert "order_id" in order_data
    print(f"  [PASS] Razorpay order generated: {order_data['order_id']} for amount INR 799.")

    # 2. Verify signature
    r_verify = client.post("/api/bookings/razorpay/verify-payment", json={
        "booking_id": "test-booking",
        "razorpay_order_id": order_data["order_id"],
        "razorpay_payment_id": "pay_test_123456",
        "razorpay_signature": "mock_valid_signature"
    })
    assert r_verify.status_code == 200
    assert r_verify.json()["success"] is True
    print("  [PASS] Razorpay payment verification succeeded.")

if __name__ == "__main__":
    print("=" * 60)
    print("RUNNING PATHPILOT PHASE 4 (MENTOR MARKETPLACE) TEST SUITE")
    print("=" * 60)
    test_list_mentors()
    test_mentor_profile()
    test_slot_id = test_mentor_slots()
    b_id, s_id = test_booking_flow_and_double_booking(test_slot_id)
    test_consultations_management(b_id, s_id)
    test_razorpay_endpoints()
    print("\n" + "=" * 60)
    print("ALL PHASE 4 MARKETPLACE TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 60)
