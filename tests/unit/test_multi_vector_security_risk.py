"""
Unit tests for Multi-Vector Security Risk Policy (EchoForge Member 4).
Verifies that independent threat vectors (deepfake authenticity vs. context/social-engineering scam risk)
are aggregated securely so strong scam signals or deepfakes trigger appropriate HIGH or INCONCLUSIVE decisions
without being diluted into LOW risk by low scores in other channels.
"""
import pytest
from core.models import NormalizedRisk
from core.risk_engine import aggregate_risk
from core.decision_engine import decide
from core.explainability import build_explainability
from adapters.result import AdapterResult


# =============================================================================
# Scenario A: Genuine Voice + Harmless Context (No Reference)
# =============================================================================
def test_scenario_a_genuine_voice_harmless_context():
    # deepfake_risk = 6.0 (low), context_risk = 10.0 (low), reference = None
    risks = NormalizedRisk(deepfake_risk=6.0, speaker_mismatch_risk=None, context_risk=10.0)
    risk_score = aggregate_risk(risks)
    decision, note = decide(risk_score=risk_score, reliability_score=80.0, member1_status="ok")

    assert risk_score == 7.14
    assert decision == "LOW"
    assert note is None


# =============================================================================
# Scenario B: Genuine Voice + Highly Suspicious Scam Context (No Reference)
# =============================================================================
def test_scenario_b_genuine_voice_suspicious_scam_context():
    # Real human voice (deepfake_risk = 6.0) speaking scam message (context_risk = 85.0)
    risks = NormalizedRisk(deepfake_risk=6.0, speaker_mismatch_risk=None, context_risk=85.0)
    risk_score = aggregate_risk(risks)
    decision, note = decide(risk_score=risk_score, reliability_score=80.0, member1_status="ok")

    assert risk_score >= 65.0
    assert decision == "HIGH"
    assert note is None

    # Test explainability generation for Scenario B
    m1_res = AdapterResult(status="ok", data={"raw_score": 0.06})
    m2_res = AdapterResult(status="skipped")
    m3_res = AdapterResult(status="ok", data={"context_score": 85.0, "reasons": ["Account suspension threat detected"]})

    reasons, warnings = build_explainability(
        risks=risks,
        member1_result=m1_res,
        member2_result=m2_res,
        member3_result=m3_res,
        reliability_score=80.0,
        decision_note=note,
    )

    # Must explain that high context risk exists despite genuine voice
    assert any("High genuine-voice probability" in r for r in reasons)
    assert any("High contextual/social-engineering risk detected" in r for r in reasons)
    assert "Speaker verification skipped: no reference audio was provided." in warnings


# =============================================================================
# Scenario C: Deepfake Voice + Harmless Context
# =============================================================================
def test_scenario_c_deepfake_voice_harmless_context():
    # High synthetic voice (deepfake_risk = 90.0), harmless content (context_risk = 10.0)
    risks = NormalizedRisk(deepfake_risk=90.0, speaker_mismatch_risk=None, context_risk=10.0)
    risk_score = aggregate_risk(risks)
    decision, note = decide(risk_score=risk_score, reliability_score=80.0, member1_status="ok")

    assert risk_score == 90.0
    assert decision == "HIGH"


# =============================================================================
# Scenario D: High Deepfake + High Context
# =============================================================================
def test_scenario_d_high_deepfake_high_context():
    risks = NormalizedRisk(deepfake_risk=90.0, speaker_mismatch_risk=None, context_risk=85.0)
    risk_score = aggregate_risk(risks)
    decision, note = decide(risk_score=risk_score, reliability_score=80.0, member1_status="ok")

    assert risk_score == 90.0
    assert decision == "HIGH"


# =============================================================================
# Scenario E: Moderate / Conflicting Evidence (Mid-range Risk -> INCONCLUSIVE)
# =============================================================================
def test_scenario_e_moderate_conflicting_evidence():
    # Moderate risk signals (deepfake_risk = 40.0, context_risk = 50.0)
    risks = NormalizedRisk(deepfake_risk=40.0, speaker_mismatch_risk=None, context_risk=50.0)
    risk_score = aggregate_risk(risks)
    decision, note = decide(risk_score=risk_score, reliability_score=80.0, member1_status="ok")

    assert 35.0 < risk_score < 65.0
    assert decision == "INCONCLUSIVE"
    assert "ambiguous mid-range" in note


# =============================================================================
# Scenario F: Reference Audio Omitted (Preserves None and Skipped Status)
# =============================================================================
def test_scenario_f_reference_audio_omitted():
    risks = NormalizedRisk(deepfake_risk=6.0, speaker_mismatch_risk=None, context_risk=10.0)
    assert risks.speaker_mismatch_risk is None

    m2_res = AdapterResult(status="skipped")
    assert m2_res.status == "skipped"
    assert m2_res.data is None
