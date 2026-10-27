from typing import List, Optional, Dict
from pydantic import BaseModel, Field

# ─── Mentor Schemas ──────────────────────────────────────────────────

class MentorProfileSchema(BaseModel):
    id: str
    full_name: str
    title: str
    organisation: str
    bio: str
    avatar_url: str
    years_experience: int
    domains: List[str]
    skills: List[str]
    mentoring_topics: List[str]
    session_price_inr: int
    session_duration_mins: List[int] = Field(default_factory=lambda: [30, 60])
    rating: float = 4.9
    review_count: int = 50
    is_verified: bool = True
    is_demo_profile: bool = True
    is_available: bool = True
    email: Optional[str] = None
    linkedin_url: Optional[str] = "https://linkedin.com"

class MentorListResponse(BaseModel):
    success: bool = True
    total: int
    domains: List[str]
    mentors: List[MentorProfileSchema]

# ─── Availability & Slot Schemas ─────────────────────────────────────

class SlotItem(BaseModel):
    id: str
    mentor_id: str
    start_time: str      # ISO 8601 string
    end_time: str        # ISO 8601 string
    label: str           # e.g. "Tomorrow, 6:00 PM IST"
    display_label: Optional[str] = None
    duration_mins: int   # 30 or 60
    is_booked: bool = False

class MentorSlotsResponse(BaseModel):
    success: bool = True
    mentor_id: str
    mentor_name: str
    total_slots: int
    slots: List[SlotItem]

# ─── Booking & Checkout Schemas ──────────────────────────────────────

class BookingCreateRequest(BaseModel):
    mentor_id: str
    slot_id: str
    student_name: Optional[str] = None
    user_name: Optional[str] = None
    student_email: Optional[str] = None
    user_email: Optional[str] = None
    topic: str
    notes: Optional[str] = ""
    duration_mins: int = 30
    time_zone: Optional[str] = "Asia/Kolkata"
    payment_method: str = "demo"  # "demo" or "razorpay"
    amount_inr: Optional[int] = None

class BookingRecord(BaseModel):
    id: str
    mentor_id: str
    mentor_name: str
    mentor_title: str
    mentor_organisation: str
    mentor_org: Optional[str] = None
    mentor_avatar: str
    mentor_email: Optional[str] = None
    student_name: str
    user_name: Optional[str] = None
    student_email: str
    user_email: Optional[str] = None
    slot_id: str
    start_time: str
    end_time: str
    slot_label: str
    time_zone: Optional[str] = "Asia/Kolkata"
    duration_mins: int
    topic: str
    notes: Optional[str] = ""
    amount_inr: int
    payment_method: str
    status: str            # "DEMO_CONFIRMED", "CONFIRMED", "CANCELLED", "PENDING_PAYMENT"
    is_demo_booking: bool
    meeting_link: Optional[str] = None
    meet_link: Optional[str] = None
    google_event_id: Optional[str] = None
    google_calendar_status: Optional[str] = "AWAITING_CREDENTIALS" # "CONFIRMED", "AWAITING_CREDENTIALS", "FAILED"
    ics_calendar_url: str
    calendar_ics_url: Optional[str] = None
    email_status: Optional[str] = "SENT"
    email_dispatched: Optional[bool] = True
    email_recipients: Optional[List[str]] = Field(default_factory=list)
    created_at: str

class BookingApiResponse(BaseModel):
    success: bool = True
    data: BookingRecord
    message: str = "Booking confirmed successfully"

class BookingListResponse(BaseModel):
    success: bool = True
    total: int
    bookings: List[BookingRecord]

# ─── Cancellation Schemas ────────────────────────────────────────────

class CancellationResponse(BaseModel):
    success: bool = True
    booking_id: str
    status: str = "CANCELLED"
    message: str
    refund_status: str

# ─── Razorpay Schemas ────────────────────────────────────────────────

class RazorpayOrderRequest(BaseModel):
    amount_inr: int
    mentor_id: str
    booking_id: Optional[str] = ""

class RazorpayOrderResponse(BaseModel):
    success: bool = True
    order_id: str
    amount: int
    currency: str = "INR"
    key_id: str

class RazorpayVerifyRequest(BaseModel):
    booking_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
