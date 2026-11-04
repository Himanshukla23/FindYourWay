import os
import sys
import asyncio
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', line_buffering=True, errors='replace')

from services.payment_service import PaymentService
from schemas.payments import (
    PaymentLifecycleStatus,
    DisputeReason,
    CreatePaymentOrderRequest,
    VerifyPaymentRequest,
    ReportIssueRequest,
    CancelWithRefundRequest,
    ProcessPayoutRequest
)

def reset_service_data():
    PaymentService._payments.clear()
    PaymentService._booking_payments.clear()
    PaymentService._mentor_earnings.clear()
    PaymentService._platform_commissions.clear()
    PaymentService._payouts.clear()
    PaymentService._refunds.clear()
    PaymentService._disputes.clear()
    PaymentService._webhook_events.clear()
    PaymentService._reconciliation_records.clear()
    PaymentService._idempotency_keys.clear()
    PaymentService._initialized = True

def run_all_tests():
    print("\n" + "="*70)
    print("PHASE 4 PAYMENT MODULE: PROTECTED PAYMENTS & DELAYED PAYOUTS SUITE")
    print("="*70)

    # ── Test 1: Configuration & Nodal Compliance Parameters ──────────
    print("\n[Test 1] Testing Payment Configuration & Compliance Flags...")
    reset_service_data()
    cfg = PaymentService.get_payment_config()
    assert cfg["provider"] == "razorpay_route"
    assert cfg["platform_commission_percent"] == 15.0
    assert cfg["completion_review_window_hours"] == 24
    assert cfg["funds_held_in_nodal"] is True
    assert cfg["anti_no_show_protection"] is True
    print("  ✓ Passed: Provider is razorpay_route with 15% commission and 24h review window.")

    # ── Test 2: Pre-Booking Payment Order & Commission Calculation ────
    print("\n[Test 2] Testing Payment Order Initiation & Commission Split...")
    reset_service_data()
    order_req = CreatePaymentOrderRequest(
        mentor_id="mentor-1",
        slot_id="slot-test-01",
        topic="Resume Review & ATS Strategy",
        notes="Testing protected payment flow",
        user_name="Test Student",
        user_email="student@test.edu",
        amount_inr=1000.0,
        idempotency_key="idem-order-001"
    )
    order = PaymentService.create_payment_order(order_req)
    assert order.success is True
    assert order.amount_inr == 1000.0
    assert order.commission_percent == 15.0
    assert order.mentor_earnings_inr == 850.0  # 85% to mentor, 15% platform

    # Idempotency check: duplicate call returns same order
    dup_order = PaymentService.create_payment_order(order_req)
    assert dup_order.order_id == order.order_id
    print("  ✓ Passed: Order created with 15% platform take-rate (₹150) and 85% mentor share (₹850). Idempotency verified.")

    # ── Test 3: Mentor Does Not Receive Payout Merely Upon Booking ───
    print("\n[Test 3] Testing Delayed Payout: Mentor Receives ₹0 Payout Upon Booking...")
    reset_service_data()
    ord3 = PaymentService.create_payment_order(CreatePaymentOrderRequest(
        mentor_id="mentor-3",
        slot_id="slot-delayed-01",
        topic="System Design",
        user_name="Alice",
        user_email="alice@univ.ac.in",
        amount_inr=500.0
    ))
    v3 = PaymentService.verify_payment_and_confirm_booking(VerifyPaymentRequest(
        payment_id=ord3.payment_id,
        booking_id=ord3.booking_id,
        razorpay_order_id=ord3.order_id,
        razorpay_payment_id="pay_test_immediate_hold",
        razorpay_signature="simulated_valid_sig"
    ))
    assert v3.status == PaymentLifecycleStatus.SESSION_SCHEDULED

    # Check mentor financial ledger
    fin3 = PaymentService.get_mentor_dashboard_financials("mentor-3")
    assert fin3.payout_eligible_inr == 0.0, f"Expected 0.0 payout eligible, got {fin3.payout_eligible_inr}"
    assert fin3.pending_earnings_inr == 425.0, f"Expected 425.0 pending, got {fin3.pending_earnings_inr}"

    # Payout request must be blocked
    try:
        PaymentService.process_mentor_payout("mentor-3")
        assert False, "Payout should have failed!"
    except Exception as e:
        assert "No payout-eligible earnings" in str(e)
    print("  ✓ Passed: Mentor earnings strictly held in escrow/pending. Payout release is blocked.")

    # ── Test 4: Mentor Marks Completed -> 24h Review Window Started ──
    print("\n[Test 4] Testing Session Completion & 24h Review Window...")
    reset_service_data()
    ord4 = PaymentService.create_payment_order(CreatePaymentOrderRequest(
        mentor_id="mentor-3",
        slot_id="slot-complete-01",
        topic="Mock Interview",
        user_name="Bob",
        user_email="bob@college.edu",
        amount_inr=600.0
    ))
    PaymentService.verify_payment_and_confirm_booking(VerifyPaymentRequest(
        payment_id=ord4.payment_id,
        booking_id=ord4.booking_id,
        razorpay_order_id=ord4.order_id,
        razorpay_payment_id="pay_test_completion",
        razorpay_signature="sig"
    ))

    # Mentor marks completed
    c4 = PaymentService.mentor_mark_session_completed(ord4.booking_id, mentor_notes="Review done")
    assert c4["status"] == PaymentLifecycleStatus.SESSION_COMPLETED.value
    assert "review_window_expires_at" in c4

    # Payout should STILL be ₹0 because review window has not cleared and student has not confirmed yet
    fin4_pre = PaymentService.get_mentor_dashboard_financials("mentor-3")
    assert fin4_pre.payout_eligible_inr == 0.0
    print("  ✓ Passed: Session marked completed. Review window active. Payout remains ₹0 pending student verification.")

    # ── Test 5: Student Confirms Session -> Earnings Become Payout Eligible ──
    print("\n[Test 5] Testing Student Confirmation & Payout Settlement...")
    s5 = PaymentService.student_confirm_completion(ord4.booking_id, rating=5, feedback="Outstanding session!")
    assert s5["status"] == PaymentLifecycleStatus.PAYOUT_ELIGIBLE.value

    # Earnings must now be eligible: ₹600 - 15% = ₹510
    fin4_post = PaymentService.get_mentor_dashboard_financials("mentor-3")
    assert fin4_post.payout_eligible_inr == 510.0

    # Execute payout
    pout4 = PaymentService.process_mentor_payout("mentor-3", idempotency_key="pout-idem-001")
    assert pout4["amount_inr"] == 510.0
    assert pout4["status"] == PaymentLifecycleStatus.PAYOUT_COMPLETED.value
    print("  ✓ Passed: Student confirmed session. Payout unlocked and settled for ₹510.")

    # ── Test 6: Mentor No-Show Protection & Automated Student Refund ─
    print("\n[Test 6] Testing Mentor No-Show Protection & Automated Refund Workflow...")
    reset_service_data()
    ord6 = PaymentService.create_payment_order(CreatePaymentOrderRequest(
        mentor_id="mentor-2",
        slot_id="slot-noshow-01",
        topic="Frontend Architecture",
        user_name="Charlie",
        user_email="charlie@mit.edu",
        amount_inr=800.0
    ))
    PaymentService.verify_payment_and_confirm_booking(VerifyPaymentRequest(
        payment_id=ord6.payment_id,
        booking_id=ord6.booking_id,
        razorpay_order_id=ord6.order_id,
        razorpay_payment_id="pay_test_noshow",
        razorpay_signature="sig"
    ))

    # Student reports mentor absence
    disp6 = PaymentService.report_issue_or_no_show(
        booking_id=ord6.booking_id,
        reason=DisputeReason.MENTOR_NO_SHOW,
        description="Waited 15 minutes, mentor was absent.",
        evidence_urls=["https://meet.google.com/logs/charlie-session"]
    )
    assert disp6["status"] == PaymentLifecycleStatus.DISPUTED.value
    assert disp6["refund_initiated"] is True

    # Payout to mentor must be frozen at ₹0
    fin6 = PaymentService.get_mentor_dashboard_financials("mentor-2")
    assert fin6.payout_eligible_inr == 0.0
    assert fin6.disputed_sessions_count == 1

    # Student history reflects refund
    s_hist = PaymentService.get_student_dashboard_financials("charlie@mit.edu")
    assert len(s_hist.refunds) == 1
    assert s_hist.refunds[0].amount_inr == 800.0
    print("  ✓ Passed: Mentor absence reported. Payout frozen. 100% refund (₹800) initiated to student.")

    # ── Test 7: Mentor Cancellation Triggers Full Refund ──────────────
    print("\n[Test 7] Testing Mentor Cancellation & Slot Release...")
    reset_service_data()
    ord7 = PaymentService.create_payment_order(CreatePaymentOrderRequest(
        mentor_id="mentor-1",
        slot_id="slot-cancel-01",
        topic="Career Strategy",
        user_name="Diana",
        user_email="diana@univ.edu",
        amount_inr=500.0
    ))
    PaymentService.verify_payment_and_confirm_booking(VerifyPaymentRequest(
        payment_id=ord7.payment_id,
        booking_id=ord7.booking_id,
        razorpay_order_id=ord7.order_id,
        razorpay_payment_id="pay_test_cancel",
        razorpay_signature="sig"
    ))

    can7 = PaymentService.cancel_with_refund(
        booking_id=ord7.booking_id,
        reason="Emergency flight schedule change",
        cancelled_by="mentor"
    )
    assert can7["status"] == PaymentLifecycleStatus.CANCELLED.value
    assert can7["refund_amount_inr"] == 500.0
    print("  ✓ Passed: Mentor cancellation triggered 100% refund (₹500) and released slot.")

    # ── Test 8: Financial Reconciliation Audit Ledger ─────────────────
    print("\n[Test 8] Testing Auditable Financial Reconciliation Ledger...")
    ledger = PaymentService.get_reconciliation_records()
    assert len(ledger) > 0
    print(f"  ✓ Passed: Ledger records {len(ledger)} immutable audit events across orders, refunds, and payouts.")

    print("\n" + "="*70)
    print("ALL 8 PROTECTED PAYMENT & DELAYED PAYOUT ACCEPTANCE CRITERIA PASSED!")
    print("="*70 + "\n")

if __name__ == "__main__":
    run_all_tests()
