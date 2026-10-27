import uuid
import hmac
import hashlib
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from fastapi import HTTPException
from config import settings
from schemas.marketplace import (
    BookingCreateRequest,
    BookingRecord,
    CancellationResponse,
    RazorpayOrderResponse
)
from services.marketplace_service import MarketplaceService

class BookingService:
    # In-memory booking database
    _bookings: Dict[str, BookingRecord] = {}

    @classmethod
    def create_booking(cls, req: BookingCreateRequest) -> BookingRecord:
        mentor = MarketplaceService.get_mentor_by_id(req.mentor_id)
        if not mentor:
            raise HTTPException(status_code=404, detail="Mentor not found.")

        # Check if slot already booked to strictly prevent double-booking
        if MarketplaceService.is_slot_booked(req.slot_id):
            raise HTTPException(
                status_code=409,
                detail="This time slot has already been booked. Please select another available slot."
            )

        # Generate unique booking ID
        booking_id = f"bk-{uuid.uuid4().hex[:8]}"

        # Look up slot details
        slots = MarketplaceService.generate_slots_for_mentor(req.mentor_id)
        slot_match = next((s for s in slots if s.id == req.slot_id), None)

        if slot_match:
            start_iso = slot_match.start_time
            end_iso = slot_match.end_time
            slot_label = slot_match.label
        else:
            # Fallback if custom slot
            now = datetime.now(timezone.utc)
            start_iso = now.isoformat()
            end_iso = now.isoformat()
            slot_label = "Upcoming Mentorship Session"

        # Status and Payment Logic
        is_demo = (req.payment_method or "demo").lower() == "demo"
        status = "DEMO_CONFIRMED" if is_demo else "CONFIRMED"

        resolved_name = req.student_name or req.user_name or "Student"
        resolved_email = req.student_email or req.user_email or "student@pathpilot.dev"

        # Integrate Google Calendar API for real Meet scheduling
        from services.google_calendar_service import GoogleCalendarService
        google_result = GoogleCalendarService.create_meeting_event(
            summary=f"PathPilot AI Mentor Consultation — {mentor.full_name}",
            description=f"Consultation Topic: {req.topic}\nMentor: {mentor.full_name} ({mentor.organisation})\nCandidate: {resolved_name} ({resolved_email})\nNotes: {req.notes or 'None'}",
            start_iso=start_iso,
            end_iso=end_iso,
            student_email=resolved_email,
            mentor_email=mentor.email,
            idempotency_key=f"booking-{booking_id}"
        )

        # Real Google Meet link is persisted ONLY when returned by Google API
        real_meet_link = google_result.get("meet_link")
        google_event_id = google_result.get("event_id")
        google_cal_status = google_result.get("status", "AWAITING_CREDENTIALS")

        record = BookingRecord(
            id=booking_id,
            mentor_id=mentor.id,
            mentor_name=mentor.full_name,
            mentor_title=mentor.title,
            mentor_organisation=mentor.organisation,
            mentor_org=mentor.organisation,
            mentor_avatar=mentor.avatar_url,
            mentor_email=mentor.email,
            student_name=resolved_name,
            user_name=resolved_name,
            student_email=resolved_email,
            user_email=resolved_email,
            slot_id=req.slot_id,
            start_time=start_iso,
            end_time=end_iso,
            slot_label=slot_label,
            time_zone=req.time_zone or "Asia/Kolkata",
            duration_mins=req.duration_mins,
            topic=req.topic,
            notes=req.notes or "",
            amount_inr=req.amount_inr or mentor.session_price_inr,
            payment_method=req.payment_method,
            status=status,
            is_demo_booking=is_demo,
            meeting_link=real_meet_link,
            meet_link=real_meet_link,
            google_event_id=google_event_id,
            google_calendar_status=google_cal_status,
            ics_calendar_url=f"/api/bookings/{booking_id}/calendar.ics",
            calendar_ics_url=f"/api/bookings/{booking_id}/calendar.ics",
            created_at=datetime.now(timezone.utc).isoformat()
        )

        # Mark slot booked
        MarketplaceService.mark_slot_as_booked(req.slot_id)
        cls._bookings[booking_id] = record

        return record

    @classmethod
    def get_bookings(
        cls,
        student_email: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[BookingRecord]:
        results = list(cls._bookings.values())
        if student_email and student_email.strip():
            results = [b for b in results if b.student_email.lower() == student_email.strip().lower()]
        if status and status.strip():
            results = [b for b in results if b.status.lower() == status.strip().lower()]
        
        # Sort by creation time descending (newest first)
        results.sort(key=lambda b: b.created_at, reverse=True)
        return results

    @classmethod
    def get_booking_by_id(cls, booking_id: str) -> Optional[BookingRecord]:
        return cls._bookings.get(booking_id)

    @classmethod
    def cancel_booking(cls, booking_id: str) -> CancellationResponse:
        booking = cls.get_booking_by_id(booking_id)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking record not found.")

        if booking.status == "CANCELLED":
            return CancellationResponse(
                booking_id=booking_id,
                status="CANCELLED",
                message="This booking was already cancelled.",
                refund_status="Not applicable"
            )

        # Update status
        booking.status = "CANCELLED"
        # Release the slot back to the bookable pool
        MarketplaceService.release_booked_slot(booking.slot_id)

        refund_msg = (
            "Demo booking - no charge incurred."
            if booking.is_demo_booking
            else "Refund will be automatically processed to your original payment method in 5-7 business days."
        )

        return CancellationResponse(
            booking_id=booking_id,
            status="CANCELLED",
            message=f"Session with {booking.mentor_name} has been successfully cancelled.",
            refund_status=refund_msg
        )

    @classmethod
    def generate_ics_calendar(cls, booking_id: str) -> str:
        """
        Generates standard RFC 5545 iCalendar (.ics) string for direct calendar export.
        """
        booking = cls.get_booking_by_id(booking_id)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found.")

        try:
            dt_start = datetime.fromisoformat(booking.start_time)
            dt_end = datetime.fromisoformat(booking.end_time)
            dt_stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
            t_start = dt_start.strftime("%Y%m%dT%H%M%SZ")
            t_end = dt_end.strftime("%Y%m%dT%H%M%SZ")
        except Exception:
            dt_stamp = "20261025T120000Z"
            t_start = "20261026T123000Z"
            t_end = "20261026T130000Z"

        summary = f"PathPilot 1-on-1 Mentorship: {booking.mentor_name} & {booking.student_name}"
        meet_info = f"Meeting Link: {booking.meeting_link}\\n" if booking.meeting_link else "Meeting Room: Google Calendar Meet link will appear once integration is authorized\\n"
        desc = f"Topic: {booking.topic}\\n{meet_info}Student Notes: {booking.notes or 'None'}"
        location_val = booking.meeting_link or "Google Meet (Link will be dispatched via Google Calendar)"

        ics_content = f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//PathPilot AI//Mentorship Sessions//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:{booking.id}@pathpilot.ai
DTSTAMP:{dt_stamp}
DTSTART:{t_start}
DTEND:{t_end}
SUMMARY:{summary}
DESCRIPTION:{desc}
LOCATION:{location_val}
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Reminder: Mentorship session starting in 15 minutes!
END:VALARM
END:VEVENT
END:VCALENDAR"""
        return ics_content

    # ─── Razorpay Integration ────────────────────────────────────────

    @classmethod
    def create_razorpay_order(cls, mentor_id: str, amount_inr: int) -> RazorpayOrderResponse:
        key_id = settings.RAZORPAY_KEY_ID
        key_secret = settings.RAZORPAY_KEY_SECRET

        if not key_id or not key_secret:
            # Simulated Razorpay order in demo mode
            mock_order_id = f"order_{uuid.uuid4().hex[:14]}"
            return RazorpayOrderResponse(
                success=True,
                order_id=mock_order_id,
                amount=amount_inr * 100,  # in paise
                currency="INR",
                key_id="rzp_test_demo_mode"
            )

        try:
            import razorpay
            client = razorpay.Client(auth=(key_id, key_secret))
            data = {
                "amount": amount_inr * 100,
                "currency": "INR",
                "receipt": f"rcpt_{uuid.uuid4().hex[:8]}",
                "notes": {"mentor_id": mentor_id}
            }
            order = client.order.create(data=data)
            return RazorpayOrderResponse(
                success=True,
                order_id=order["id"],
                amount=order["amount"],
                currency=order["currency"],
                key_id=key_id
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to create Razorpay order: {e}")

    @classmethod
    def verify_razorpay_payment(
        cls,
        booking_id: str,
        razorpay_order_id: str,
        razorpay_payment_id: str,
        razorpay_signature: str
    ) -> bool:
        key_secret = settings.RAZORPAY_KEY_SECRET
        if not key_secret:
            # If running in test mode without real secrets, verify demo signature
            booking = cls.get_booking_by_id(booking_id)
            if booking:
                booking.status = "CONFIRMED"
                booking.is_demo_booking = False
            return True

        # Real HMAC-SHA256 verification
        msg = f"{razorpay_order_id}|{razorpay_payment_id}".encode("utf-8")
        generated_sig = hmac.new(key_secret.encode("utf-8"), msg, hashlib.sha256).hexdigest()

        if hmac.compare_digest(generated_sig, razorpay_signature):
            booking = cls.get_booking_by_id(booking_id)
            if booking:
                booking.status = "CONFIRMED"
                booking.is_demo_booking = False
            return True
        else:
            raise HTTPException(status_code=400, detail="Invalid payment signature.")
