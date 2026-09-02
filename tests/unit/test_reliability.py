"""
Unit tests for core/reliability.py.
Verifies Section H reliability scoring, availability, quality, confidence, penalties, and bounds.
Uses mocked AdapterResult inputs (no real ML model loading).
"""
import pytest
from adapters.result import AdapterResult
from core.reliability import compute_reliability


# Helper to build a clean Member 1 AdapterResult
def make_m1_result(
    status="ok",
    audio_valid=True,
    sufficient_duration=True,
    clipping_detected=False,
    mostly_silent=False,
    snr_db=15.0,
    confidence="HIGH",
    classification="GENUINE",
    predicted_label="bonafide",
    error=None,
):
    if status != "ok":
        return AdapterResult(status=status, error_message="M1 error")

    data = {
        "classification": classification,
        "predicted_label": predicted_label,
        "confidence": confidence,
        "diagnostics": {
            "audio_valid": audio_valid,
            "sufficient_duration": sufficient_duration,
            "clipping_detected": clipping_detected,
            "mostly_silent": mostly_silent,
            "snr_estimate_db": snr_db,
        },
        "extended_diagnostics": {
            "snr_estimate_db": snr_db,
        },
    }
    if error:
        data["error"] = error
    return AdapterResult(status="ok", data=data)


# Helper to build a clean Member 2 AdapterResult
def make_m2_result(status="ok", similarity=0.70, decision="SAME SPEAKER"):
    if status == "skipped":
        return AdapterResult(status="skipped")
    if status != "ok":
        return AdapterResult(status="error", error_message="M2 error")
    return AdapterResult(
        status="ok",
        data={"similarity": similarity, "decision": decision},
    )


# Helper to build a clean Member 3 AdapterResult
def make_m3_result(status="ok", transcript="Hello world", context_score=0):
    if status != "ok":
        return AdapterResult(status="error", error_message="M3 error")
    return AdapterResult(
        status="ok",
        data={"transcript": transcript, "context_score": context_score},
    )


# =============================================================================
# 1. Availability Tests
# =============================================================================
def test_all_modules_available_clean():
    m1 = make_m1_result()
    m2 = make_m2_result()
    m3 = make_m3_result()

    score, reasons = compute_reliability(m1, m2, m3)
    # Avail: 15 + 15 + 10 = 40
    # Quality: 10 + 8 + 7 + 10 = 35
    # Conf: 10 (HIGH) - 0 = 10
    # Total = 85.0
    assert score == 85.0
    assert len(reasons) == 0


def test_member1_unavailable():
    m1 = make_m1_result(status="error")
    m2 = make_m2_result()
    m3 = make_m3_result()

    score, reasons = compute_reliability(m1, m2, m3)
    # Avail: 0 (M1 error) + 15 (M2) + 10 (M3) = 25
    # Quality: 0 (no M1 diagnostics)
    # Conf: 0
    assert score == 25.0
    assert any("Primary deepfake detection" in r for r in reasons)


def test_member2_skipped():
    m1 = make_m1_result()
    m2 = make_m2_result(status="skipped")
    m3 = make_m3_result()

    score, reasons = compute_reliability(m1, m2, m3)
    # Avail: (15 + 10 + 0) capped at 25 = 25
    # Quality: 35
    # Conf: 10
    # Total = 70.0
    assert score == 70.0
    assert any("Speaker verification skipped" in r for r in reasons)


def test_member3_unavailable():
    m1 = make_m1_result()
    m2 = make_m2_result()
    m3 = make_m3_result(status="error")

    score, reasons = compute_reliability(m1, m2, m3)
    # Avail: 15 (M1) + 15 (M2) + 0 (M3) = 30
    # Quality: 35
    # Conf: 10
    # Total = 75.0
    assert score == 75.0
    assert any("Transcription and context" in r for r in reasons)


def test_all_modules_unavailable():
    m1 = make_m1_result(status="error")
    m2 = make_m2_result(status="error")
    m3 = make_m3_result(status="error")

    score, reasons = compute_reliability(m1, m2, m3)
    assert score == 0.0
    assert len(reasons) >= 3


# =============================================================================
# 2. Quality Tests
# =============================================================================
def test_quality_short_duration():
    m1 = make_m1_result(sufficient_duration=False)
    m2 = make_m2_result()
    m3 = make_m3_result()

    score, reasons = compute_reliability(m1, m2, m3)
    # Loses 10 pts for duration -> 75.0
    assert score == 75.0
    assert any("below minimum reliable threshold" in r for r in reasons)


def test_quality_clipping_detected():
    m1 = make_m1_result(clipping_detected=True)
    m2 = make_m2_result()
    m3 = make_m3_result()

    score, reasons = compute_reliability(m1, m2, m3)
    # Loses 8 pts for clipping -> 77.0
    assert score == 77.0
    assert any("clipping" in r for r in reasons)


def test_quality_mostly_silent():
    m1 = make_m1_result(mostly_silent=True)
    m2 = make_m2_result()
    m3 = make_m3_result()

    score, reasons = compute_reliability(m1, m2, m3)
    # Loses 7 pts for silence -> 78.0
    assert score == 78.0
    assert any("mostly silent" in r for r in reasons)


def test_quality_snr_scaling():
    # 0 dB SNR -> 0 SNR points (loses 10) -> score 75.0
    m1_zero_snr = make_m1_result(snr_db=0.0)
    score_zero, reasons = compute_reliability(m1_zero_snr, make_m2_result(), make_m3_result())
    assert score_zero == 75.0
    assert any("Low signal-to-noise ratio" in r for r in reasons)

    # 7.5 dB SNR -> 5 SNR points -> score 80.0
    m1_half_snr = make_m1_result(snr_db=7.5)
    score_half, _ = compute_reliability(m1_half_snr, make_m2_result(), make_m3_result())
    assert score_half == 80.0


# =============================================================================
# 3. Confidence & Penalty Tests
# =============================================================================
def test_confidence_moderate_and_low():
    m2, m3 = make_m2_result(), make_m3_result()

    # MODERATE conf -> +5 pts (total 80.0)
    m1_mod = make_m1_result(confidence="MODERATE")
    score_mod, _ = compute_reliability(m1_mod, m2, m3)
    assert score_mod == 80.0

    # LOW conf -> +0 pts (total 75.0)
    m1_low = make_m1_result(confidence="LOW")
    score_low, _ = compute_reliability(m1_low, m2, m3)
    assert score_low == 75.0


def test_uncertainty_flag_penalties():
    m3 = make_m3_result()

    # M1 UNCERTAIN -> -10 penalty
    m1_uncert = make_m1_result(classification="UNCERTAIN", predicted_label="uncertain")
    m2_ok = make_m2_result()
    score_m1_uncert, reasons_m1 = compute_reliability(m1_uncert, m2_ok, m3)
    # Base 85 - 10 penalty = 75.0
    assert score_m1_uncert == 75.0
    assert any("Deepfake detector score fell within uncertainty boundary" in r for r in reasons_m1)

    # M1 UNCERTAIN + M2 UNCERTAIN -> -20 penalty
    m2_uncert = make_m2_result(decision="UNCERTAIN")
    score_both, reasons_both = compute_reliability(m1_uncert, m2_uncert, m3)
    # Base 85 - 20 penalty = 65.0
    assert score_both == 65.0
    assert any("Speaker verification score fell within uncertainty boundary" in r for r in reasons_both)


# =============================================================================
# 4. Boundary & Clamping Tests
# =============================================================================
def test_reliability_bounds_zero_to_hundred():
    # Degraded input
    m1_bad = make_m1_result(
        status="error",
    )
    m2_bad = make_m2_result(status="error")
    m3_bad = make_m3_result(status="error")

    score, _ = compute_reliability(m1_bad, m2_bad, m3_bad)
    assert score == 0.0

    # Clean input
    m1_clean = make_m1_result()
    m2_clean = make_m2_result()
    m3_clean = make_m3_result()
    score_clean, _ = compute_reliability(m1_clean, m2_clean, m3_clean)
    assert 0.0 <= score_clean <= 100.0
