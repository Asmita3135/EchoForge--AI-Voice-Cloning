"""
Unit tests for core/risk_engine.py.
Verifies Section I weighted risk aggregation, missing-channel renormalization,
all-missing None semantics, boundaries, and hand-calculated test cases.
"""
import pytest
from core.models import NormalizedRisk
from core.risk_engine import aggregate_risk


# Helper float comparison
def pytest_approx(val, expected, tol=1e-2):
    return abs(val - expected) < tol


# =============================================================================
# 1. Basic Aggregation Tests (All Channels Available)
# =============================================================================
def test_all_channels_available_mixed_risk():
    # Hand-calculated example from specification/prompt:
    # deepfake = 80 (wt 0.5), speaker = 50 (wt 0.3), context = 20 (wt 0.2)
    # Total = 80*0.5 + 50*0.3 + 20*0.2 = 40 + 15 + 4 = 59.0
    risk = NormalizedRisk(deepfake_risk=80.0, speaker_mismatch_risk=50.0, context_risk=20.0)
    score = aggregate_risk(risk)
    assert score == 59.0


def test_all_channels_available_high_risk():
    risk = NormalizedRisk(deepfake_risk=100.0, speaker_mismatch_risk=100.0, context_risk=100.0)
    assert aggregate_risk(risk) == 100.0


def test_all_channels_available_zero_risk():
    risk = NormalizedRisk(deepfake_risk=0.0, speaker_mismatch_risk=0.0, context_risk=0.0)
    assert aggregate_risk(risk) == 0.0


# =============================================================================
# 2. Missing-Channel Renormalization Tests (Single Channel Available)
# =============================================================================
def test_only_deepfake_available():
    risk = NormalizedRisk(deepfake_risk=80.0, speaker_mismatch_risk=None, context_risk=None)
    # Effective weight: 0.5 / 0.5 = 1.0 -> score = 80.0
    assert aggregate_risk(risk) == 80.0


def test_only_speaker_available():
    risk = NormalizedRisk(deepfake_risk=None, speaker_mismatch_risk=60.0, context_risk=None)
    # Effective weight: 0.3 / 0.3 = 1.0 -> score = 60.0
    assert aggregate_risk(risk) == 60.0


def test_only_context_available():
    risk = NormalizedRisk(deepfake_risk=None, speaker_mismatch_risk=None, context_risk=40.0)
    # Effective weight: 0.2 / 0.2 = 1.0 -> score = 40.0
    assert aggregate_risk(risk) == 40.0


# =============================================================================
# 3. Missing-Channel Renormalization Tests (Two Channels Available)
# =============================================================================
def test_deepfake_and_speaker_available():
    # deepfake = 80.0 (wt 0.5), speaker = 50.0 (wt 0.3), context = None
    # total_weight = 0.8
    # weighted_sum = 40 + 15 = 55
    # score = 55 / 0.8 = 68.75
    risk = NormalizedRisk(deepfake_risk=80.0, speaker_mismatch_risk=50.0, context_risk=None)
    assert aggregate_risk(risk) == 68.75


def test_deepfake_and_context_available():
    # Hand-calculated example from prompt:
    # deepfake = 80.0 (wt 0.5), speaker = None, context = 40.0 (wt 0.2)
    # total_weight = 0.7
    # weighted_sum = 40 + 8 = 48
    # score = 48 / 0.7 = 68.5714... -> 68.57
    risk = NormalizedRisk(deepfake_risk=80.0, speaker_mismatch_risk=None, context_risk=40.0)
    assert aggregate_risk(risk) == 68.57


def test_speaker_and_context_available():
    # speaker = 50.0 (wt 0.3), context = 20.0 (wt 0.2)
    # total_weight = 0.5
    # weighted_sum = 15 + 4 = 19
    # score = 19 / 0.5 = 38.0
    risk = NormalizedRisk(deepfake_risk=None, speaker_mismatch_risk=50.0, context_risk=20.0)
    assert aggregate_risk(risk) == 38.0


# =============================================================================
# 4. Missing-Data Semantics & None Preservation
# =============================================================================
def test_all_channels_none_returns_none():
    risk = NormalizedRisk(deepfake_risk=None, speaker_mismatch_risk=None, context_risk=None)
    score = aggregate_risk(risk)
    assert score is None
    assert score is not 0.0
    assert score is not 0


def test_empty_dict_returns_none():
    assert aggregate_risk({}) is None


# =============================================================================
# 5. Dict Input & Custom Weights Compatibility
# =============================================================================
def test_dict_input_compatibility():
    risk_dict = {
        "deepfake_risk": 80.0,
        "speaker_mismatch_risk": 50.0,
        "context_risk": 20.0,
    }
    assert aggregate_risk(risk_dict) == 59.0


def test_custom_weights_renormalization():
    risk = NormalizedRisk(deepfake_risk=100.0, speaker_mismatch_risk=0.0, context_risk=None)
    custom_weights = {"deepfake_risk": 0.6, "speaker_mismatch_risk": 0.4}
    # 100*0.6 + 0*0.4 / 1.0 = 60.0
    assert aggregate_risk(risk, weights=custom_weights) == 60.0
