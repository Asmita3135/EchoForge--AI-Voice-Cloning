"""
Unit tests for core/pipeline.py.
Verifies end-to-end pipeline orchestration using mocks (no heavy ML models loaded).
Covers adapter success, skipped states, failure isolation, None preservation,
low reliability, and determinism.
"""
import pytest
from unittest.mock import patch, MagicMock

from adapters.result import AdapterResult
from core.models import NormalizedRisk, AnalysisResult
from core.pipeline import run_pipeline, analyze


# Helper fixtures for adapter results
def make_ok_m1(raw_score=0.85):
    return AdapterResult(
        status="ok",
        data={
            "raw_score": raw_score,
            "classification": "AI-GENERATED" if raw_score >= 0.5 else "HUMAN",
            "diagnostics": {"audio_valid": True, "sufficient_duration": True, "clipping_detected": False},
        },
    )


def make_ok_m2(similarity=0.50):
    return AdapterResult(status="ok", data={"similarity": similarity, "decision": "DIFFERENT SPEAKER"})


def make_ok_m3(context_score=60.0):
    return AdapterResult(status="ok", data={"context_score": context_score, "reasons": ["Financial content detected"]})


# =============================================================================
# 1. Pipeline Success Scenarios
# =============================================================================
@patch("adapters.member1_adapter.run")
@patch("adapters.member2_adapter.run")
@patch("adapters.member3_adapter.run")
def test_pipeline_all_adapters_succeed(mock_m3, mock_m2, mock_m1):
    mock_m1.return_value = make_ok_m1(0.85)
    mock_m2.return_value = make_ok_m2(0.50)
    mock_m3.return_value = make_ok_m3(60.0)

    result = run_pipeline("test_audio.wav", "ref_audio.wav", request_id="req-123")

    assert isinstance(result, AnalysisResult)
    assert result.request_id == "req-123"
    assert result.decision == "HIGH"
    assert result.risk_score is not None
    assert result.risk_score > 65.0
    assert result.human_review_required is True
    assert result.evidence["member1"].status == "ok"
    assert result.evidence["member2"].status == "ok"
    assert result.evidence["member3"].status == "ok"


@patch("adapters.member1_adapter.run")
@patch("adapters.member2_adapter.run")
@patch("adapters.member3_adapter.run")
def test_pipeline_member2_skipped(mock_m3, mock_m2, mock_m1):
    mock_m1.return_value = make_ok_m1(0.10)
    mock_m2.return_value = AdapterResult(status="skipped")
    mock_m3.return_value = make_ok_m3(0.0)

    result = run_pipeline("test_audio.wav", reference_audio_path=None)

    assert result.evidence["member2"].status == "skipped"
    assert result.risk_breakdown.speaker_mismatch_risk is None
    assert result.decision == "LOW"
    assert "Speaker verification skipped: no reference audio was provided." in result.warnings


# =============================================================================
# 2. Failure Isolation Tests
# =============================================================================
@patch("adapters.member1_adapter.run")
@patch("adapters.member2_adapter.run")
@patch("adapters.member3_adapter.run")
def test_pipeline_member1_fails_isolation(mock_m3, mock_m2, mock_m1):
    mock_m1.return_value = AdapterResult(status="error", error_message="M1 model failure")
    mock_m2.return_value = make_ok_m2(0.90)
    mock_m3.return_value = make_ok_m3(0.0)

    result = run_pipeline("test_audio.wav", "ref_audio.wav")

    assert result.evidence["member1"].status == "error"
    assert result.risk_breakdown.deepfake_risk is None
    # Member 1 unavailable triggers Rule 2 in decision engine -> INCONCLUSIVE
    assert result.decision == "INCONCLUSIVE"
    assert any("One or more analysis modules failed" in w for w in result.warnings)


@patch("adapters.member1_adapter.run")
@patch("adapters.member2_adapter.run")
@patch("adapters.member3_adapter.run")
def test_pipeline_member2_fails_isolation(mock_m3, mock_m2, mock_m1):
    mock_m1.return_value = make_ok_m1(0.10)
    mock_m2.return_value = AdapterResult(status="error", error_message="M2 audio read failure")
    mock_m3.return_value = make_ok_m3(0.0)

    result = run_pipeline("test_audio.wav", "ref_audio.wav")

    assert result.evidence["member2"].status == "error"
    assert result.risk_breakdown.speaker_mismatch_risk is None
    # Pipeline continues with M1 and M3
    assert result.decision == "LOW"


@patch("adapters.member1_adapter.run")
@patch("adapters.member2_adapter.run")
@patch("adapters.member3_adapter.run")
def test_pipeline_member3_fails_isolation(mock_m3, mock_m2, mock_m1):
    mock_m1.return_value = make_ok_m1(0.10)
    mock_m2.return_value = make_ok_m2(0.90)
    mock_m3.return_value = AdapterResult(status="error", error_message="M3 transcribe failure")

    result = run_pipeline("test_audio.wav", "ref_audio.wav")

    assert result.evidence["member3"].status == "error"
    assert result.risk_breakdown.context_risk is None
    assert result.decision == "LOW"


@patch("adapters.member1_adapter.run")
@patch("adapters.member2_adapter.run")
@patch("adapters.member3_adapter.run")
def test_pipeline_multiple_adapters_fail(mock_m3, mock_m2, mock_m1):
    mock_m1.return_value = AdapterResult(status="error", error_message="M1 failure")
    mock_m2.return_value = AdapterResult(status="skipped")
    mock_m3.return_value = AdapterResult(status="error", error_message="M3 failure")

    result = run_pipeline("test_audio.wav")

    assert result.risk_breakdown.deepfake_risk is None
    assert result.risk_breakdown.speaker_mismatch_risk is None
    assert result.risk_breakdown.context_risk is None
    assert result.risk_score is None
    assert result.decision == "INCONCLUSIVE"


@patch("adapters.member1_adapter.run")
@patch("adapters.member2_adapter.run")
@patch("adapters.member3_adapter.run")
def test_pipeline_all_adapters_unavailable(mock_m3, mock_m2, mock_m1):
    mock_m1.return_value = AdapterResult(status="error", error_message="M1 error")
    mock_m2.return_value = AdapterResult(status="error", error_message="M2 error")
    mock_m3.return_value = AdapterResult(status="error", error_message="M3 error")

    result = run_pipeline("test_audio.wav")

    assert result.risk_score is None
    assert result.decision == "INCONCLUSIVE"


# =============================================================================
# 3. Exception & Edge Case Isolation
# =============================================================================
@patch("adapters.member1_adapter.run")
@patch("adapters.member2_adapter.run")
@patch("adapters.member3_adapter.run")
def test_pipeline_unexpected_adapter_exception_handled(mock_m3, mock_m2, mock_m1):
    mock_m1.side_effect = RuntimeError("Unexpected GPU crash")
    mock_m2.return_value = make_ok_m2(0.90)
    mock_m3.return_value = make_ok_m3(0.0)

    result = run_pipeline("test_audio.wav")

    assert result.evidence["member1"].status == "error"
    assert "unexpected exception" in result.evidence["member1"].error_message
    assert result.decision == "INCONCLUSIVE"


@patch("adapters.member1_adapter.run")
@patch("adapters.member2_adapter.run")
@patch("adapters.member3_adapter.run")
def test_pipeline_low_reliability(mock_m3, mock_m2, mock_m1):
    # Member 1 returns short audio diagnostics -> reliability drops below floor 40.0
    mock_m1.return_value = AdapterResult(
        status="ok",
        data={
            "raw_score": 0.90,
            "diagnostics": {"audio_valid": True, "sufficient_duration": False, "mostly_silent": True},
        },
    )
    mock_m2.return_value = AdapterResult(status="skipped")
    mock_m3.return_value = AdapterResult(status="error")

    result = run_pipeline("test_audio.wav")

    assert result.reliability_score < 40.0
    assert result.decision == "INCONCLUSIVE"


# =============================================================================
# 4. None Preservation & Determinism
# =============================================================================
@patch("adapters.member1_adapter.run")
@patch("adapters.member2_adapter.run")
@patch("adapters.member3_adapter.run")
def test_none_preservation_distinct_from_zero(mock_m3, mock_m2, mock_m1):
    mock_m1.return_value = AdapterResult(status="error")
    mock_m2.return_value = make_ok_m2(0.50)  # risk = 85.0
    mock_m3.return_value = AdapterResult(status="error")

    result = run_pipeline("test_audio.wav", "ref.wav")

    assert result.risk_breakdown.deepfake_risk is None
    assert result.risk_breakdown.deepfake_risk is not 0.0
    assert result.risk_breakdown.context_risk is None
    assert result.risk_breakdown.context_risk is not 0.0


@patch("adapters.member1_adapter.run")
@patch("adapters.member2_adapter.run")
@patch("adapters.member3_adapter.run")
def test_pipeline_deterministic_orchestration(mock_m3, mock_m2, mock_m1):
    mock_m1.return_value = make_ok_m1(0.85)
    mock_m2.return_value = make_ok_m2(0.50)
    mock_m3.return_value = make_ok_m3(60.0)

    r1 = run_pipeline("test_audio.wav", "ref_audio.wav", request_id="same-id")
    r2 = run_pipeline("test_audio.wav", "ref_audio.wav", request_id="same-id")

    assert r1.decision == r2.decision
    assert r1.risk_score == r2.risk_score
    assert r1.reliability_score == r2.reliability_score
    assert r1.reasons == r2.reasons
    assert r1.warnings == r2.warnings
