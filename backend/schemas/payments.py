from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

# ── Lifecycle Status Enums ────────────────────────────────────────────────────

class PaymentLifecycleStatus(str, Enum):
    # Standard lifecycle states
    PAYMENT_PENDING = "payment_pending"
    PAYMENT_SUCCESSFUL = "payment_successful"
    BOOKING_CONFIRMED = "booking_confirmed"
    SESSION_SCHEDULED = "session_scheduled"
    SESSION_IN_PROGRESS = "session_in_progress"
    SESSION_COMPLETED = "session_completed"
    PAYOUT_ELIGIBLE = "payout_eligible"
    PAYOUT_PROCESSING = "payout_processing"
    PAYOUT_COMPLETED = "payout_completed"

    # Exception statuses
    PAYMENT_FAILED = "payment_failed"
    REFUND_PENDING = "refund_pending"
    REFUND_COMPLETED = "refund_completed"
    CANCELLED = "cancelled"
    DISPUTED = "disputed"
    UNDER_REVIEW = "under_review"
    PAYOUT_FAILED = "payout_failed"

class DisputeReason(str, Enum):
    MENTOR_NO_SHOW = "mentor_no_show"
    STUDENT_NO_SHOW = "student_no_show"
    TECHNICAL_FAILURE = "technical_failure"
    POOR_QUALITY = "poor_quality"
    INCOMPLETE_SESSION = "incomplete_session"
    OTHER = "other"

class DisputeResolution(str, Enum):
    FULL_REFUND_STUDENT = "full_refund_student"
    PARTIAL_REFUND = "partial_refund"
    RELEASE_TO_MENTOR = "release_to_mentor"
    RESCHEDULE_ACCEPTED = "reschedule_accepted"
    REJECTED = "rejected"

# ── Core Financial Database Entities ──────────────────────────────────────────

class PaymentRecord(BaseModel):
    id: str
    order_id: str
    booking_id: Optional[str] = None
    student_email: str
    mentor_id: str
    amount_inr: float
    currency: str = "INR"
    status: PaymentLifecycleStatus = PaymentLifecycleStatus.PAYMENT_PENDING
    payment_method: str = "razorpay"
    provider: str = "razorpay_route"
    provider_payment_id: Optional[str] = None
    provider_order_id: Optional[str] = None
    provider_signature: Optional[str] = None
    idempotency_key: str
    is_sandbox: bool = True
    created_at: str
    updated_at: str

class PlatformCommission(BaseModel):
    id: str
    payment_id: str
    booking_id: str
    total_amount_inr: float
    commission_percentage: float
    commission_amount_inr: float
    created_at: str

class MentorEarnings(BaseModel):
    id: str
    mentor_id: str
    booking_id: str
    payment_id: str
    gross_amount_inr: float
    commission_amount_inr: float
    net_earnings_inr: float
    status: PaymentLifecycleStatus = PaymentLifecycleStatus.PAYMENT_SUCCESSFUL
    review_window_ends_at: Optional[str] = None
    student_confirmed_at: Optional[str] = None
    payout_id: Optional[str] = None
    is_payout_eligible: bool = False
    is_payout_settled: bool = False
    created_at: str
    updated_at: str

class BookingPaymentRecord(BaseModel):
    id: str
    booking_id: str
    payment_id: str
    mentor_id: str
    mentor_name: str
    student_name: str
    student_email: str
    topic: str
    slot_id: str
    scheduled_start: str
    scheduled_end: str
    amount_inr: float
    lifecycle_status: PaymentLifecycleStatus = PaymentLifecycleStatus.PAYMENT_PENDING
    mentor_marked_completed_at: Optional[str] = None
    student_confirmed_at: Optional[str] = None
    review_window_expires_at: Optional[str] = None
    dispute_id: Optional[str] = None
    refund_id: Optional[str] = None
    payout_id: Optional[str] = None
    created_at: str
    updated_at: str

class PayoutRecord(BaseModel):
    id: str
    mentor_id: str
    booking_ids: List[str]
    amount_inr: float
    currency: str = "INR"
    status: PaymentLifecycleStatus = PaymentLifecycleStatus.PAYOUT_PROCESSING
    provider_payout_id: Optional[str] = None
    destination_account: Optional[str] = None
    failure_reason: Optional[str] = None
    idempotency_key: str
    is_sandbox: bool = True
    initiated_at: str
    completed_at: Optional[str] = None

class RefundRecord(BaseModel):
    id: str
    payment_id: str
    booking_id: str
    student_email: str
    amount_inr: float
    reason: str
    status: PaymentLifecycleStatus = PaymentLifecycleStatus.REFUND_PENDING
    provider_refund_id: Optional[str] = None
    idempotency_key: str
    is_sandbox: bool = True
    initiated_at: str
    completed_at: Optional[str] = None

class DisputeRecord(BaseModel):
    id: str
    booking_id: str
    payment_id: str
    raised_by: str  # 'student' or 'mentor'
    student_email: str
    mentor_id: str
    reason: DisputeReason
    description: str
    evidence_urls: List[str] = []
    status: str = "under_review"  # 'under_review', 'resolved', 'dismissed'
    resolution: Optional[DisputeResolution] = None
    resolved_by: Optional[str] = None
    resolution_notes: Optional[str] = None
    created_at: str
    resolved_at: Optional[str] = None

class PaymentWebhookEvent(BaseModel):
    id: str
    provider: str
    event_type: str
    payload: Dict[str, Any]
    signature_verified: bool
    processed: bool
    error: Optional[str] = None
    received_at: str

class PaymentReconciliationRecord(BaseModel):
    id: str
    entity_type: str  # 'payment', 'payout', 'refund', 'commission'
    entity_id: str
    booking_id: Optional[str] = None
    amount_inr: float
    previous_status: Optional[str] = None
    new_status: str
    actor: str
    provider_reference: Optional[str] = None
    metadata: Dict[str, Any] = {}
    timestamp: str

# ── API Request and Response Schemas ──────────────────────────────────────────

class CreatePaymentOrderRequest(BaseModel):
    mentor_id: str
    slot_id: str
    topic: str
    notes: Optional[str] = ""
    user_name: str
    user_email: str
    amount_inr: float
    time_zone: Optional[str] = "Asia/Kolkata"
    duration_mins: Optional[int] = 30
    idempotency_key: Optional[str] = None

class CreatePaymentOrderResponse(BaseModel):
    success: bool
    order_id: str
    payment_id: str
    booking_id: str
    amount_inr: float
    amount_paise: int
    currency: str = "INR"
    key_id: str
    commission_percent: float
    mentor_earnings_inr: float
    is_sandbox: bool
    message: str

class VerifyPaymentRequest(BaseModel):
    payment_id: str
    booking_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    idempotency_key: Optional[str] = None

class VerifyPaymentResponse(BaseModel):
    success: bool
    booking_id: str
    status: PaymentLifecycleStatus
    meeting_link: Optional[str] = None
    calendar_ics_url: Optional[str] = None
    message: str

class MarkSessionCompletedRequest(BaseModel):
    booking_id: str
    mentor_notes: Optional[str] = ""
    evidence_attendance: Optional[str] = "Mentor confirmed attendance and completed 1-on-1 consultation."

class StudentConfirmCompletionRequest(BaseModel):
    booking_id: str
    rating: Optional[int] = 5
    feedback: Optional[str] = ""

class ReportIssueRequest(BaseModel):
    booking_id: str
    reason: DisputeReason
    description: str
    evidence_urls: Optional[List[str]] = []

class CancelWithRefundRequest(BaseModel):
    booking_id: str
    reason: str
    cancelled_by: str = "student"  # 'student' or 'mentor'

class ProcessPayoutRequest(BaseModel):
    mentor_id: str
    idempotency_key: Optional[str] = None

# ── Dashboard Schemas ─────────────────────────────────────────────────────────

class MentorDashboardFinancials(BaseModel):
    mentor_id: str
    total_earnings_inr: float
    pending_earnings_inr: float
    payout_eligible_inr: float
    payout_completed_inr: float
    upcoming_sessions_count: int
    completed_sessions_count: int
    cancelled_sessions_count: int
    disputed_sessions_count: int
    payout_history: List[PayoutRecord] = []
    active_disputes: List[DisputeRecord] = []
    recent_earnings: List[MentorEarnings] = []

class StudentDashboardFinancials(BaseModel):
    student_email: str
    payment_history: List[PaymentRecord] = []
    booking_payments: List[BookingPaymentRecord] = []
    refunds: List[RefundRecord] = []
    disputes: List[DisputeRecord] = []
    pending_confirmations: List[BookingPaymentRecord] = []
