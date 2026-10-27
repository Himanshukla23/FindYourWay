from fastapi import APIRouter, HTTPException, Query, Response
from typing import Optional
from schemas.marketplace import (
    BookingCreateRequest,
    BookingApiResponse,
    BookingListResponse,
    BookingRecord,
    CancellationResponse,
    RazorpayOrderRequest,
    RazorpayOrderResponse,
    RazorpayVerifyRequest
)
from services.booking_service import BookingService

router = APIRouter(prefix="/api/bookings", tags=["Bookings & Checkout"])

@router.get("/integrations/google-calendar/status")
async def get_google_calendar_status():
    """
    Returns the real connection status of the Google Calendar API & Google Meet integration.
    """
    from services.google_calendar_service import GoogleCalendarService
    return GoogleCalendarService.get_status()

@router.post("", response_model=BookingApiResponse)
async def create_booking(req: BookingCreateRequest):
    """
    Create a new 1-on-1 mentorship consultation booking.
    Locks the selected slot to strictly prevent double-booking.
    """
    record = BookingService.create_booking(req)
    return BookingApiResponse(
        success=True,
        data=record,
        message="Mentorship session reserved successfully!"
    )

@router.get("", response_model=BookingListResponse)
async def list_bookings(
    student_email: Optional[str] = Query(None, description="Filter by student email"),
    status: Optional[str] = Query(None, description="Filter by status (e.g. DEMO_CONFIRMED, CONFIRMED, CANCELLED)")
):
    """
    List all consultations for the student (My Consultations).
    """
    bookings = BookingService.get_bookings(student_email=student_email, status=status)
    return BookingListResponse(
        success=True,
        total=len(bookings),
        bookings=bookings
    )

@router.get("/{booking_id}", response_model=BookingRecord)
async def get_booking_detail(booking_id: str):
    """
    Retrieve full details for a single consultation booking.
    """
    booking = BookingService.get_booking_by_id(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")
    return booking

@router.post("/{booking_id}/cancel", response_model=CancellationResponse)
async def cancel_booking(booking_id: str):
    """
    Cancel an upcoming mentorship consultation.
    Releases the reserved slot back to the mentor's available pool.
    """
    return BookingService.cancel_booking(booking_id)

@router.get("/{booking_id}/calendar.ics")
async def download_calendar_ics(booking_id: str):
    """
    Download RFC 5545 iCalendar (.ics) file for 1-click import into Google Calendar, Outlook, and Apple Calendar.
    """
    ics_text = BookingService.generate_ics_calendar(booking_id)
    return Response(
        content=ics_text,
        media_type="text/calendar",
        headers={
            "Content-Disposition": f"attachment; filename=mentorship-{booking_id}.ics"
        }
    )

# ─── Razorpay Checkout Integration ───────────────────────────────────

@router.post("/razorpay/create-order", response_model=RazorpayOrderResponse)
async def create_razorpay_order(req: RazorpayOrderRequest):
    """
    Creates a server-side Razorpay order (or returns simulated demo order if keys not configured).
    """
    return BookingService.create_razorpay_order(mentor_id=req.mentor_id, amount_inr=req.amount_inr)

@router.post("/razorpay/verify-payment")
async def verify_razorpay_payment(req: RazorpayVerifyRequest):
    """
    Validates Razorpay HMAC signature and confirms real paid booking.
    """
    is_valid = BookingService.verify_razorpay_payment(
        booking_id=req.booking_id,
        razorpay_order_id=req.razorpay_order_id,
        razorpay_payment_id=req.razorpay_payment_id,
        razorpay_signature=req.razorpay_signature
    )
    return {"success": is_valid, "message": "Payment verified and booking confirmed"}
