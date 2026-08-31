"""
Unit tests for core/decision_engine.py.
Verifies Section J decision engine rules, rule precedence order, boundary margins,
reliability floor enforcement, missing evidence handling, and human review policy.
"""
import pytest
from core.decision_engine import decide, is_human_review_required


# =============================================================================
# 1. Basic Classifications
# =============================================================================
def test_clearly_low_risk():
    decision, note = decide(risk_score=15.0, reliability_score=80.0, member1_status="ok")
    assert decision == "LOW"
    assert note is None
    assert is_human_review_required(decision) is False


def test_clearly_high_risk():
    decision, note = decide(risk_score=85.0, reliability_score=80.0, member1_status="ok")
    assert decision == "HIGH"
    assert note is None
    assert is_human_review_required(decision) is True


def test_intermediate_midrange_risk():
    decision, note = decide(risk_score=50.0, reliability_score=80.0, member1_status="ok")
    assert decision == "INCONCLUSIVE"
    assert note == "Risk score falls in the ambiguous mid-range."
    assert is_human_review_required(decision) is True


# =============================================================================
# 2. Boundary & Margin Tests (HIGH_THRESHOLD=65, LOW_THRESHOLD=35, MARGIN=5)
# =============================================================================
def test_risk_exactly_at_high_threshold():
    # 65.0 is inside boundary margin 65 ± 5 -> INCONCLUSIVE
    decision, note = decide(risk_score=65.0, reliability_score=80.0, member1_status="ok")
    assert decision == "INCONCLUSIVE"
    assert "decision boundary margin" in note


def test_risk_exactly_at_low_threshold():
    # 35.0 is inside boundary margin 35 ± 5 -> INCONCLUSIVE
    decision, note = decide(risk_score=35.0, reliability_score=80.0, member1_status="ok")
    assert decision == "INCONCLUSIVE"
    assert "decision boundary margin" in note


def test_risk_inside_high_boundary_margin():
    # 62.0 and 68.0 are inside 65 ± 5 -> INCONCLUSIVE
    decision_62, _ = decide(risk_score=62.0, reliability_score=80.0, member1_status="ok")
    decision_68, _ = decide(risk_score=68.0, reliability_score=80.0, member1_status="ok")
    assert decision_62 == "INCONCLUSIVE"
    assert decision_68 == "INCONCLUSIVE"


def test_risk_outside_high_boundary_margin():
    # 71.0 is > 65 + 5 -> HIGH
    decision, note = decide(risk_score=71.0, reliability_score=80.0, member1_status="ok")
    assert decision == "HIGH"
    assert note is None


def test_risk_inside_low_boundary_margin():
    # 32.0 and 38.0 are inside 35 ± 5 -> INCONCLUSIVE
    decision_32, _ = decide(risk_score=32.0, reliability_score=80.0, member1_status="ok")
    decision_38, _ = decide(risk_score=38.0, reliability_score=80.0, member1_status="ok")
    assert decision_32 == "INCONCLUSIVE"
    assert decision_38 == "INCONCLUSIVE"


def test_risk_outside_low_boundary_margin():
    # 25.0 is < 35 - 5 -> LOW
    decision, note = decide(risk_score=25.0, reliability_score=80.0, member1_status="ok")
    assert decision == "LOW"
    assert note is None


# =============================================================================
# 3. Reliability Floor Tests (RELIABILITY_FLOOR=40)
# =============================================================================
def test_reliability_below_floor_forces_inconclusive():
    # High risk (85.0) but low reliability (35.0 < 40.0) -> INCONCLUSIVE
    decision_high, note_high = decide(risk_score=85.0, reliability_score=35.0, member1_status="ok")
    assert decision_high == "INCONCLUSIVE"
    assert "Evidence reliability too low" in note_high

    # Low risk (15.0) but low reliability (35.0 < 40.0) -> INCONCLUSIVE
    decision_low, note_low = decide(risk_score=15.0, reliability_score=35.0, member1_status="ok")
    assert decision_low == "INCONCLUSIVE"
    assert "Evidence reliability too low" in note_low


def test_reliability_at_or_above_floor():
    # Exactly 40.0 passes reliability check
    decision, _ = decide(risk_score=85.0, reliability_score=40.0, member1_status="ok")
    assert decision == "HIGH"


# =============================================================================
# 4. Missing Evidence & Member 1 Status Tests
# =============================================================================
def test_risk_score_none_forces_inconclusive():
    decision, note = decide(risk_score=None, reliability_score=80.0, member1_status="ok")
    assert decision == "INCONCLUSIVE"
    assert "No evidence channels" in note


def test_member1_unavailable_forces_inconclusive():
    # High risk (85.0) and high reliability (80.0), but M1 error -> INCONCLUSIVE
    decision, note = decide(risk_score=85.0, reliability_score=80.0, member1_status="error")
    assert decision == "INCONCLUSIVE"
    assert "Deepfake detection (primary evidence channel) unavailable" in note


# =============================================================================
# 5. Rule Precedence Tests (Proves Section J Evaluation Order)
# =============================================================================
def test_precedence_rule1_over_rule2():
    # risk_score is None & member1_status is error -> Rule 1 triggers first
    decision, note = decide(risk_score=None, reliability_score=80.0, member1_status="error")
    assert decision == "INCONCLUSIVE"
    assert "No evidence channels" in note


def test_precedence_rule2_over_rule3():
    # member1_status is error & reliability_score is below floor (20.0) -> Rule 2 triggers first
    decision, note = decide(risk_score=85.0, reliability_score=20.0, member1_status="error")
    assert decision == "INCONCLUSIVE"
    assert "Deepfake detection (primary evidence channel) unavailable" in note


def test_precedence_rule3_over_rule4():
    # reliability_score is below floor & risk_score is at boundary -> Rule 3 triggers first
    decision, note = decide(risk_score=65.0, reliability_score=20.0, member1_status="ok")
    assert decision == "INCONCLUSIVE"
    assert "Evidence reliability too low" in note


def test_precedence_rule4_over_rule5():
    # risk_score is exactly 65.0 (HIGH_THRESHOLD) -> Rule 4 boundary margin triggers first, not Rule 5 HIGH
    decision, note = decide(risk_score=65.0, reliability_score=80.0, member1_status="ok")
    assert decision == "INCONCLUSIVE"
    assert "decision boundary margin" in note
