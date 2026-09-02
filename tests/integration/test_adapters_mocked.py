"""
Mocked integration tests for Member 1, Member 2, and Member 3 adapters.
Exercises adapter error handling, skipped states, data extraction, and contract compliance
without loading real heavy ML models.
"""
import os
import pytest
from unittest.mock import patch, MagicMock

from adapters.result import AdapterResult
from adapters import member1_adapter, member2_adapter, member3_adapter


# =============================================================================
# 1. Member 1 Adapter Tests
# =============================================================================
def test_member1_adapter_file_not_found():
    res = member1_adapter.run("non_existent_audio_file.wav")
    assert isinstance(res, AdapterResult)
    assert res.status == "error"
    assert "not found" in res.error_message.lower()


@patch("adapters.member1_adapter._analyze_audio")
def test_member1_adapter_success(mock_analyze, tmp_path):
    fake_audio = tmp_path / "test.wav"
    fake_audio.write_bytes(b"dummy wav data")

    mock_analyze.return_value = {
        "model": "Gustking/wav2vec2-large-xlsr-deepfake-audio-classification",
        "classification": "AI-GENERATED",
        "predicted_label": "spoof",
        "raw_score": 0.85,
        "threshold": 0.50,
        "confidence": "HIGH",
        "sample_rate_used": 16000,
        "duration_sec": 4.5,
        "diagnostics": {
            "audio_valid": True,
            "sufficient_duration": True,
            "clipping_detected": False,
            "mostly_silent": False,
        },
    }

    res = member1_adapter.run(str(fake_audio))
    assert res.status == "ok"
    assert res.data["raw_score"] == 0.85
    assert res.data["classification"] == "AI-GENERATED"
    mock_analyze.assert_called_once_with(str(fake_audio), return_details=True)


@patch("adapters.member1_adapter._analyze_audio")
def test_member1_adapter_error_key_returned(mock_analyze, tmp_path):
    fake_audio = tmp_path / "bad.wav"
    fake_audio.write_bytes(b"bad header")

    mock_analyze.return_value = {
        "classification": "UNCERTAIN",
        "predicted_label": "uncertain",
        "raw_score": 0.0,
        "confidence": "LOW",
        "error": "Corrupt audio format",
    }

    res = member1_adapter.run(str(fake_audio))
    assert res.status == "error"
    assert "Corrupt audio format" in res.error_message


# =============================================================================
# 2. Member 2 Adapter Tests
# =============================================================================
def test_member2_adapter_skipped_when_no_reference():
    res1 = member2_adapter.run(None, "test.wav")
    assert res1.status == "skipped"
    assert res1.data is None

    res2 = member2_adapter.run("", "test.wav")
    assert res2.status == "skipped"

    res3 = member2_adapter.run("skipped", "test.wav")
    assert res3.status == "skipped"


def test_member2_adapter_file_not_found():
    res = member2_adapter.run("missing_ref.wav", "missing_test.wav")
    assert res.status == "error"
    assert "not found" in res.error_message.lower()


# =============================================================================
# 3. Member 3 Adapter Tests
# =============================================================================
def test_member3_adapter_file_not_found():
    res = member3_adapter.run("missing_audio.wav")
    assert res.status == "error"
    assert "not found" in res.error_message.lower()


@patch("adapters.member3_adapter._run_transcribe_and_context")
def test_member3_adapter_success(mock_transcribe_context, tmp_path):
    fake_audio = tmp_path / "speech.wav"
    fake_audio.write_bytes(b"dummy speech wav")

    transcript = "Please transfer money immediately to bank account"
    segments = [{"start": 0.0, "end": 2.5, "text": "Please transfer money immediately"}]
    analysis = {
        "context_score": 50.0,
        "risk_level": "MEDIUM",
        "detected": {"financial": ["bank", "money", "transfer"], "urgency": ["immediately"]},
        "reasons": ["Financial/Bank-related content detected", "Urgency language detected"],
    }
    mock_transcribe_context.return_value = (transcript, segments, analysis)

    res = member3_adapter.run(str(fake_audio))

    assert res.status == "ok"
    assert res.data["transcript"] == "Please transfer money immediately to bank account"
    assert res.data["context_score"] == 50.0
    assert len(res.data["reasons"]) == 2


# =============================================================================
# 4. Cross-Adapter Compliance
# =============================================================================
def test_all_adapters_return_adapter_result_on_failure():
    res1 = member1_adapter.run("invalid.wav")
    res2 = member2_adapter.run("invalid_ref.wav", "invalid_test.wav")
    res3 = member3_adapter.run("invalid.wav")

    assert isinstance(res1, AdapterResult)
    assert isinstance(res2, AdapterResult)
    assert isinstance(res3, AdapterResult)

    assert res1.status == "error"
    assert res2.status == "error"
    assert res3.status == "error"
