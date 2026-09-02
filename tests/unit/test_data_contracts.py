"""
Unit tests for Member 4 Data Contracts (M4.2).
Verifies dataclasses, Pydantic schemas, enum validation, and None preservation.
"""
import pytest
from pydantic import ValidationError

from adapters.result import AdapterResult
from core.models import NormalizedRisk, AnalysisResult
from api.schemas import EvidenceBlock, RiskBreakdown, AnalyzeResponse, HealthResponse


def test_adapter_result_ok():
    res = AdapterResult(status="ok", data={"raw_score": 0.85})
    assert res.status == "ok"
    assert res.data == {"raw_score": 0.85}
    assert res.error_message is None


def test_adapter_result_error():
    res = AdapterResult(status="error", error_message="File corrupt")
    assert res.status == "error"
    assert res.data is None
    assert res.error_message == "File corrupt"


def test_adapter_result_skipped():
    res = AdapterResult(status="skipped")
    assert res.status == "skipped"
    assert res.data is None
    assert res.error_message is None


def test_normalized_risk_none_preservation():
    risk = NormalizedRisk(deepfake_risk=75.0, speaker_mismatch_risk=None, context_risk=0.0)
    assert risk.deepfake_risk == 75.0
    assert risk.speaker_mismatch_risk is None
    assert risk.context_risk == 0.0
    assert risk.speaker_mismatch_risk is not 0
    assert risk.speaker_mismatch_risk is not 0.0


def test_analysis_result_construction():
    risk_bd = NormalizedRisk(deepfake_risk=80.0, speaker_mismatch_risk=None, context_risk=30.0)
    evidence = {
        "deepfake": AdapterResult(status="ok", data={"raw_score": 0.8}),
        "speaker": AdapterResult(status="skipped"),
        "context": AdapterResult(status="ok", data={"context_score": 30}),
    }
    result = AnalysisResult(
        request_id="req-12345",
        decision="HIGH",
        risk_score=68.5,
        reliability_score=85.0,
        human_review_required=True,
        reasons=["High synthetic score"],
        warnings=["Speaker verification skipped"],
        risk_breakdown=risk_bd,
        evidence=evidence,
    )
    assert result.request_id == "req-12345"
    assert result.decision == "HIGH"
    assert result.risk_score == 68.5
    assert result.reliability_score == 85.0
    assert result.human_review_required is True
    assert len(result.reasons) == 1
    assert len(result.warnings) == 1
    assert result.risk_breakdown.deepfake_risk == 80.0
    assert result.risk_breakdown.speaker_mismatch_risk is None


def test_pydantic_risk_breakdown_none_preservation():
    rb = RiskBreakdown(deepfake_risk=45.0, speaker_mismatch_risk=None)
    assert rb.deepfake_risk == 45.0
    assert rb.speaker_mismatch_risk is None
    assert rb.context_risk is None
    dumped = rb.model_dump()
    assert dumped["speaker_mismatch_risk"] is None
    assert dumped["speaker_mismatch_risk"] != 0.0


def test_pydantic_analyze_response_valid():
    rb = RiskBreakdown(deepfake_risk=90.0, speaker_mismatch_risk=None, context_risk=15.0)
    ev = {
        "deepfake": EvidenceBlock(status="ok", raw={"raw_score": 0.9}),
        "speaker": EvidenceBlock(status="skipped"),
        "context": EvidenceBlock(status="ok", raw={"context_score": 15}),
    }
    resp = AnalyzeResponse(
        request_id="req-999",
        decision="HIGH",
        risk_score=75.0,
        reliability_score=70.0,
        human_review_required=True,
        reasons=["AI voice detected"],
        warnings=["Speaker verification skipped"],
        risk_breakdown=rb,
        evidence=ev,
    )
    assert resp.request_id == "req-999"
    assert resp.decision == "HIGH"
    assert resp.evidence["speaker"].status == "skipped"

    # Test JSON serialization/deserialization
    json_data = resp.model_dump_json()
    reconstructed = AnalyzeResponse.model_validate_json(json_data)
    assert reconstructed.request_id == "req-999"
    assert reconstructed.risk_breakdown.speaker_mismatch_risk is None


def test_pydantic_invalid_decision_raises():
    rb = RiskBreakdown(deepfake_risk=10.0)
    ev = {"deepfake": EvidenceBlock(status="ok")}
    with pytest.raises(ValidationError):
        AnalyzeResponse(
            request_id="req-invalid",
            decision="UNSURE",  # Invalid enum value (must be LOW, HIGH, or INCONCLUSIVE)
            risk_score=10.0,
            reliability_score=90.0,
            human_review_required=False,
            reasons=[],
            warnings=[],
            risk_breakdown=rb,
            evidence=ev,
        )


def test_pydantic_invalid_evidence_status_raises():
    with pytest.raises(ValidationError):
        EvidenceBlock(status="failed")  # Invalid status (must be ok, error, or skipped)


def test_health_response():
    hr = HealthResponse(status="ok", modules={"member1": "loaded", "member2": "loaded", "member3": "loaded"})
    assert hr.status == "ok"
    assert hr.modules["member1"] == "loaded"
