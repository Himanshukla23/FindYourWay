from fastapi import APIRouter, HTTPException, Header, Request, Query
from typing import Optional, List, Dict, Any

from schemas.payments import (
    CreatePaymentOrderRequest,
    CreatePaymentOrderResponse,
    VerifyPaymentRequest,
    VerifyPaymentResponse,
    MarkSessionCompletedRequest,
    StudentConfirmCompletionRequest,
    ReportIssueRequest,
    CancelWithRefundRequest,
    ProcessPayoutRequest,
    MentorDashboardFinancials,
    StudentDashboardFinancials,
    PaymentReconciliationRecord
)
from services.payment_service import PaymentService

router = APIRouter(prefix="/api/payments", tags=["Protected Payments & Marketplace Payouts"])

@router.get("/config")
async def get_payment_configuration():
    """
    Returns public payment parameters:
    - Provider (Razorpay Route)
    - Mode (sandbox / production)
    - Commission percentage
    - Completion review window in hours
    - Compliance approval status
    """
    return PaymentService.get_payment_config()

@router.post("/orders/create", response_model=CreatePaymentOrderResponse)
async def create_payment_order(req: CreatePaymentOrderRequest):
    """
    Initiates payment order before booking confirmation.
    Calculates platform commission and locks slot with idempotency guarantee.
    """
    return PaymentService.create_payment_order(req)

@router.post("/verify", response_model=VerifyPaymentResponse)
async def verify_payment(req: VerifyPaymentRequest):
    """
    Cryptographically verifies payment capture.
    Advances booking to 'session_scheduled' and holds funds in nodal escrow.
    Does NOT release immediate payout to mentor.
    """
    return PaymentService.verify_payment_and_confirm_booking(req)

@router.post("/webhook")
async def handle_provider_webhook(
    request: Request,
    x_razorpay_signature: Optional[str] = Header(None, alias="X-Razorpay-Signature")
):
    """
    Receives and cryptographically verifies asynchronous webhook events from Razorpay.
    """
    body_bytes = await request.body()
    return PaymentService.ingest_provider_webhook(
        raw_body=body_bytes,
        signature_header=x_razorpay_signature or ""
    )

@router.post("/bookings/{booking_id}/complete")
async def mentor_mark_complete(booking_id: str, req: Optional[MarkSessionCompletedRequest] = None):
    """
    Mentor marks consultation completed.
    Activates the 24-hour student review window.
    """
    notes = req.mentor_notes if req else ""
    evidence = req.evidence_attendance if req else ""
    return PaymentService.mentor_mark_session_completed(
        booking_id=booking_id,
        mentor_notes=notes,
        evidence_attendance=evidence
    )

@router.post("/bookings/{booking_id}/confirm-completion")
async def student_confirm_completion(booking_id: str, req: Optional[StudentConfirmCompletionRequest] = None):
    """
    Student confirms session was successfully completed.
    Immediately clears the review window and marks earnings 'payout_eligible'.
    """
    rating = req.rating if req else 5
    feedback = req.feedback if req else ""
    return PaymentService.student_confirm_completion(
        booking_id=booking_id,
        rating=rating,
        feedback=feedback
    )

@router.post("/bookings/{booking_id}/report-issue")
async def report_issue_or_no_show(booking_id: str, req: ReportIssueRequest):
    """
    Student reports mentor no-show or session issue.
    Immediately freezes payout release and initiates refund workflow.
    """
    return PaymentService.report_issue_or_no_show(
        booking_id=booking_id,
        reason=req.reason,
        description=req.description,
        evidence_urls=req.evidence_urls or []
    )

@router.post("/bookings/{booking_id}/cancel-refund")
async def cancel_with_refund(booking_id: str, req: CancelWithRefundRequest):
    """
    Cancels consultation and initiates automated refund via payment provider.
    Enforces student time-window policy (100% vs 50%).
    """
    return PaymentService.cancel_with_refund(
        booking_id=booking_id,
        reason=req.reason,
        cancelled_by=req.cancelled_by
    )

@router.get("/mentor/{mentor_id}/dashboard", response_model=MentorDashboardFinancials)
async def get_mentor_dashboard_financials(mentor_id: str):
    """
    Aggregates financial earnings, payout eligibility, active disputes,
    and historical payouts for the mentor portal.
    """
    return PaymentService.get_mentor_dashboard_financials(mentor_id)

@router.post("/mentor/{mentor_id}/request-payout")
async def request_mentor_payout(mentor_id: str, req: Optional[ProcessPayoutRequest] = None):
    """
    Triggers batch settlement for all 'payout_eligible' sessions.
    Guarded by compliance checks and idempotency.
    """
    idempotency_key = req.idempotency_key if req else None
    return PaymentService.process_mentor_payout(mentor_id=mentor_id, idempotency_key=idempotency_key)

@router.get("/student/{student_email}/history", response_model=StudentDashboardFinancials)
async def get_student_dashboard_financials(student_email: str):
    """
    Retrieves all payment transactions, active booking protections,
    refund records, and pending completion confirmations for a student.
    """
    return PaymentService.get_student_dashboard_financials(student_email)

@router.get("/reconciliation", response_model=List[PaymentReconciliationRecord])
async def get_reconciliation_ledger():
    """
    Returns complete auditable financial ledger for accounting and dispute review.
    """
    return PaymentService.get_reconciliation_records()

@router.post("/cron/process-review-windows")
async def trigger_review_windows_cron():
    """
    Cron endpoint to automatically elevate completed sessions past their 24h review window.
    """
    count = PaymentService.process_review_window_auto_expiry()
    return {"success": True, "converted_to_payout_eligible": count}
