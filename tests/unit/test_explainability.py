"""
Unit tests for core/explainability.py.
Verifies Section K explainability engine, reason/warning generation,
Member 3 string passthrough, conflict detection, null semantics, and determinism.
"""
import pytest
from adapters.result import AdapterResult
from core.models import NormalizedRisk
from core.explainability import build_explainability, build, generate_explanation


# Helper test fixtures
def make_m1_result(status="ok", raw_score=0.85, clipping=False, sufficient_duration=True):
    if status != "ok":
        return AdapterResult(status=status, error_message="M1 error")
    return AdapterResult(
        status="ok",
        data={
            "raw_score": raw_score,
            "diagnostics": {
                "clipping_detected": clipping,
                "sufficient_duration": sufficient_duration,
            },
        },
    )


def make_m2_result(status="ok", similarity=0.65):
    if status == "skipped":
        return AdapterResult(status="skipped")
    if status != "ok":
        return AdapterResult(status="error", error_message="M2 error")
    return AdapterResult(status="ok", data={"similarity": similarity})


def make_m3_result(status="ok", context_score=0, reasons=None):
    if status != "ok":
        return AdapterResult(status="error", error_message="M3 error")
    return AdapterResult(
        status="ok",
        data={
            "context_score": context_score,
            "reasons": reasons if reasons is not None else [],
        },
    )


# =============================================================================
# 1. LOW Risk Tests
# =============================================================================
def test_low_risk_explanation():
    risks = NormalizedRisk(deepfake_risk=10.0, speaker_mismatch_risk=10.0, context_risk=0.0)
    m1 = make_m1_result(raw_score=0.10)
    m2 = make_m2_result(similarity=0.90)
    m3 = make_m3_result(context_score=0)

    reasons, warnings = build(risks, m1, m2, m3, reliability_score=90.0)
    assert any("High genuine-voice probability" in r for r in reasons)
    assert any("Voice matches the claimed reference speaker" in r for r in reasons)
    assert any("No suspicious context or keywords detected" in r for r in reasons)
    assert len(warnings) == 0


# =============================================================================
# 2. HIGH Risk Tests
# =============================================================================
def test_high_risk_explanation():
    risks = NormalizedRisk(deepfake_risk=85.0, speaker_mismatch_risk=80.0, context_risk=60.0)
    m1 = make_m1_result(raw_score=0.85)
    m2 = make_m2_result(similarity=0.50)
    m3 = make_m3_result(context_score=60, reasons=["Financial/Bank-related content detected"])

    reasons, warnings = build(risks, m1, m2, m3, reliability_score=85.0)
    assert any("High synthetic-voice probability" in r for r in reasons)
    assert any("0.85" in r for r in reasons)
    assert any("Voice does not match the claimed reference speaker" in r for r in reasons)
    assert "Financial/Bank-related content detected" in reasons


# =============================================================================
# 3. INCONCLUSIVE & Warning Tests
# =============================================================================
def test_inconclusive_decision_note_surfaced_in_warnings():
    risks = NormalizedRisk(deepfake_risk=65.0, speaker_mismatch_risk=None, context_risk=0.0)
    m1 = make_m1_result(raw_score=0.65)
    m2 = make_m2_result(status="skipped")
    m3 = make_m3_result(context_score=0)

    note = "Risk score falls within the decision boundary margin."
    reasons, warnings = build(risks, m1, m2, m3, reliability_score=80.0, decision_note=note)
    assert note in warnings
    assert "Speaker verification skipped: no reference audio was provided." in warnings


def test_reliability_below_floor_warning():
    risks = NormalizedRisk(deepfake_risk=80.0, speaker_mismatch_risk=None, context_risk=None)
    m1 = make_m1_result(raw_score=0.80)
    m2 = make_m2_result(status="skipped")
    m3 = make_m3_result(status="error")

    note = "Evidence reliability too low for an automated decision."
    reasons, warnings = build(risks, m1, m2, m3, reliability_score=30.0, decision_note=note)
    assert note in warnings
    assert "Overall evidence reliability is low; treat this result as provisional." in warnings


# =============================================================================
# 4. Evidence Availability & Skipped/Error Channels
# =============================================================================
def test_member2_skipped_warning():
    risks = NormalizedRisk(deepfake_risk=20.0, speaker_mismatch_risk=None, context_risk=0.0)
    m1 = make_m1_result(raw_score=0.20)
    m2 = make_m2_result(status="skipped")
    m3 = make_m3_result()

    reasons, warnings = build(risks, m1, m2, m3, reliability_score=70.0)
    assert "Speaker verification skipped: no reference audio was provided." in warnings
    # Must not claim speaker matched or mismatched
    assert not any("reference speaker" in r for r in reasons)


def test_module_error_warning():
    risks = NormalizedRisk(deepfake_risk=None, speaker_mismatch_risk=70.0, context_risk=50.0)
    m1 = make_m1_result(status="error")
    m2 = make_m2_result(similarity=0.50)
    m3 = make_m3_result(context_score=50)

    reasons, warnings = build(risks, m1, m2, m3, reliability_score=50.0)
    assert "One or more analysis modules failed; result is based on partial evidence." in warnings


# =============================================================================
# 5. Audio Quality Warnings
# =============================================================================
def test_clipping_and_duration_warnings():
    risks = NormalizedRisk(deepfake_risk=50.0, speaker_mismatch_risk=None, context_risk=0.0)
    m1 = make_m1_result(raw_score=0.50, clipping=True, sufficient_duration=False)
    m2 = make_m2_result(status="skipped")
    m3 = make_m3_result()

    reasons, warnings = build(risks, m1, m2, m3, reliability_score=50.0)
    assert "Audio clipping detected in primary input." in warnings
    assert "Audio duration is below minimum recommended length." in warnings


# =============================================================================
# 6. Conflicting Evidence Detection
# =============================================================================
def test_conflicting_evidence_genuine_voice_wrong_speaker():
    # Genuine deepfake score (low risk 10.0) but wrong speaker (high mismatch risk 80.0)
    risks = NormalizedRisk(deepfake_risk=10.0, speaker_mismatch_risk=80.0, context_risk=0.0)
    m1 = make_m1_result(raw_score=0.10)
    m2 = make_m2_result(similarity=0.50)
    m3 = make_m3_result()

    reasons, warnings = build(risks, m1, m2, m3, reliability_score=80.0)
    assert any("Conflicting evidence: Voice appears genuine but does not match the reference speaker." in r for r in reasons)


def test_conflicting_evidence_synthetic_voice_same_speaker():
    # Synthetic deepfake score (high risk 80.0) but matching speaker (low mismatch risk 10.0)
    risks = NormalizedRisk(deepfake_risk=80.0, speaker_mismatch_risk=10.0, context_risk=0.0)
    m1 = make_m1_result(raw_score=0.80)
    m2 = make_m2_result(similarity=0.90)
    m3 = make_m3_result()

    reasons, warnings = build(risks, m1, m2, m3, reliability_score=80.0)
    assert any("Conflicting evidence: High synthetic voice probability despite speaker verification match." in r for r in reasons)


# =============================================================================
# 7. Null Semantics & Determinism Tests
# =============================================================================
def test_none_risk_never_described_as_zero():
    risks = NormalizedRisk(deepfake_risk=10.0, speaker_mismatch_risk=None, context_risk=None)
    m1 = make_m1_result(raw_score=0.10)
    m2 = make_m2_result(status="skipped")
    m3 = make_m3_result(status="error")

    reasons, warnings = build(risks, m1, m2, m3, reliability_score=50.0)
    # Speaker and Context should NOT produce "0 risk" reasons
    assert not any("No suspicious context" in r for r in reasons)
    assert not any("Voice matches" in r for r in reasons)


def test_explainability_determinism():
    risks = NormalizedRisk(deepfake_risk=85.0, speaker_mismatch_risk=80.0, context_risk=60.0)
    m1 = make_m1_result(raw_score=0.85)
    m2 = make_m2_result(similarity=0.50)
    m3 = make_m3_result(context_score=60, reasons=["Financial/Bank-related content detected"])

    r1, w1 = build(risks, m1, m2, m3, reliability_score=85.0)
    r2, w2 = build(risks, m1, m2, m3, reliability_score=85.0)

    assert r1 == r2
    assert w1 == w2
