"""
Unit tests for core/normalization.py.
Verifies Section G normalization formulas, boundaries, edge cases, and None preservation.
"""
import pytest
import math
from adapters.result import AdapterResult
from core.models import NormalizedRisk
from core.normalization import (
    deepfake_score_to_risk,
    speaker_similarity_to_risk,
    context_score_to_risk,
    normalize_adapter_results,
    build,
)


def pytest_approx(val, expected, tol=1e-5):
    return abs(val - expected) < tol


# =============================================================================
# 1. Member 1 — Deepfake Score Normalization Tests
# =============================================================================
def test_deepfake_score_to_risk_boundaries():
    assert deepfake_score_to_risk(0.0) == 0.0
    assert deepfake_score_to_risk(0.50) == 50.0
    assert deepfake_score_to_risk(0.85) == 85.0
    assert deepfake_score_to_risk(1.0) == 100.0


def test_deepfake_score_to_risk_clamping():
    assert deepfake_score_to_risk(-0.1) == 0.0
    assert deepfake_score_to_risk(1.2) == 100.0


def test_deepfake_score_to_risk_invalid_raises():
    with pytest.raises(ValueError):
        deepfake_score_to_risk(float("nan"))
    with pytest.raises(ValueError):
        deepfake_score_to_risk(float("inf"))
    with pytest.raises(ValueError):
        deepfake_score_to_risk(None)  # type: ignore


# =============================================================================
# 2. Member 2 — Speaker Similarity Normalization Tests
# =============================================================================
def test_speaker_similarity_to_risk_boundaries():
    # Perfect match (similarity = 1.0) -> 0.0 mismatch risk
    assert pytest_approx(speaker_similarity_to_risk(1.0), 0.0)

    # Upper boundary SAME SPEAKER (similarity = 0.65) -> 20.0 risk
    assert pytest_approx(speaker_similarity_to_risk(0.65), 20.0)

    # Midpoint UNCERTAIN (similarity = 0.60) -> 40.0 risk
    assert pytest_approx(speaker_similarity_to_risk(0.60), 40.0)

    # Lower boundary DIFFERENT SPEAKER (similarity = 0.55) -> 70.0 risk
    assert pytest_approx(speaker_similarity_to_risk(0.55), 70.0)

    # Completely different speaker (similarity = 0.0) -> 100.0 risk
    assert pytest_approx(speaker_similarity_to_risk(0.0), 100.0)


def test_speaker_similarity_to_risk_invalid_raises():
    with pytest.raises(ValueError):
        speaker_similarity_to_risk(float("nan"))
    with pytest.raises(ValueError):
        speaker_similarity_to_risk(float("inf"))
    with pytest.raises(ValueError):
        speaker_similarity_to_risk(None)  # type: ignore


# =============================================================================
# 3. Member 3 — Context Score Normalization Tests
# =============================================================================
def test_context_score_to_risk_boundaries():
    assert context_score_to_risk(0) == 0.0
    assert context_score_to_risk(30) == 30.0
    assert context_score_to_risk(60) == 60.0
    assert context_score_to_risk(100) == 100.0


def test_context_score_to_risk_clamping():
    assert context_score_to_risk(-10) == 0.0
    assert context_score_to_risk(150) == 100.0


def test_context_score_to_risk_invalid_raises():
    with pytest.raises(ValueError):
        context_score_to_risk(float("nan"))
    with pytest.raises(ValueError):
        context_score_to_risk(float("inf"))
    with pytest.raises(ValueError):
        context_score_to_risk(None)  # type: ignore


# =============================================================================
# 4. Pipeline Builder (normalize_adapter_results / build) Tests
# =============================================================================
def test_normalize_adapter_results_all_ok():
    m1 = AdapterResult(status="ok", data={"raw_score": 0.80})
    m2 = AdapterResult(status="ok", data={"similarity": 0.65})
    m3 = AdapterResult(status="ok", data={"context_score": 50})

    risk = build(m1, m2, m3)
    assert isinstance(risk, NormalizedRisk)
    assert risk.deepfake_risk == 80.0
    assert risk.speaker_mismatch_risk == 20.0
    assert risk.context_risk == 50.0


def test_normalize_adapter_results_member2_skipped():
    m1 = AdapterResult(status="ok", data={"raw_score": 0.10})
    m2 = AdapterResult(status="skipped", data=None)
    m3 = AdapterResult(status="ok", data={"context_score": 0})

    risk = build(m1, m2, m3)
    assert risk.deepfake_risk == 10.0
    assert risk.speaker_mismatch_risk is None
    assert risk.speaker_mismatch_risk is not 0.0
    assert risk.context_risk == 0.0


def test_normalize_adapter_results_member1_error():
    m1 = AdapterResult(status="error", error_message="Corrupt audio file")
    m2 = AdapterResult(status="ok", data={"similarity": 0.55})
    m3 = AdapterResult(status="ok", data={"context_score": 75})

    risk = build(m1, m2, m3)
    assert risk.deepfake_risk is None
    assert risk.deepfake_risk is not 0.0
    assert risk.speaker_mismatch_risk == 70.0
    assert risk.context_risk == 75.0


def test_normalize_adapter_results_all_missing_or_error():
    m1 = AdapterResult(status="error", error_message="M1 fail")
    m2 = AdapterResult(status="skipped")
    m3 = AdapterResult(status="error", error_message="M3 fail")

    risk = build(m1, m2, m3)
    assert risk.deepfake_risk is None
    assert risk.speaker_mismatch_risk is None
    assert risk.context_risk is None


def test_normalize_adapter_results_member1_data_has_error_key():
    m1 = AdapterResult(
        status="ok",
        data={"classification": "UNCERTAIN", "raw_score": 0.0, "error": "File unreadable"},
    )
    m2 = AdapterResult(status="ok", data={"similarity": 1.0})
    m3 = AdapterResult(status="ok", data={"context_score": 0})

    risk = build(m1, m2, m3)
    assert risk.deepfake_risk is None
    assert risk.speaker_mismatch_risk == 0.0
    assert risk.context_risk == 0.0


def test_normalize_adapter_results_nan_or_invalid_score_becomes_none():
    m1 = AdapterResult(status="ok", data={"raw_score": float("nan")})
    m2 = AdapterResult(status="ok", data={"similarity": float("inf")})
    m3 = AdapterResult(status="ok", data={"context_score": 25})

    risk = build(m1, m2, m3)
    assert risk.deepfake_risk is None
    assert risk.speaker_mismatch_risk is None
    assert risk.context_risk == 25.0
