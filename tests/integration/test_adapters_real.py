"""
Real end-to-end integration tests for Member 1, Member 2, and Member 3 adapters.
Invokes real Member 1-3 modules using sample WAV audio files in sample_audio/.
"""
import os
import pytest
from adapters.result import AdapterResult
from adapters import member1_adapter, member2_adapter, member3_adapter

TEST_SPEECH_WAV = os.path.abspath("sample_audio/test_speech.wav")
REF_SPEAKER_WAV = os.path.abspath("sample_audio/ref_speaker.wav")


def test_real_member1_adapter():
    assert os.path.exists(TEST_SPEECH_WAV), "Sample audio missing"
    res = member1_adapter.run(TEST_SPEECH_WAV, return_details=True)

    assert isinstance(res, AdapterResult)
    assert res.status == "ok", f"Member 1 adapter failed: {res.error_message}"
    assert res.data is not None
    assert "raw_score" in res.data
    assert "classification" in res.data
    assert "diagnostics" in res.data
    assert 0.0 <= res.data["raw_score"] <= 1.0


def test_real_member2_adapter_skipped():
    res = member2_adapter.run(None, TEST_SPEECH_WAV)
    assert isinstance(res, AdapterResult)
    assert res.status == "skipped"
    assert res.data is None


def test_real_member2_adapter_comparison():
    assert os.path.exists(REF_SPEAKER_WAV) and os.path.exists(TEST_SPEECH_WAV)
    res = member2_adapter.run(REF_SPEAKER_WAV, TEST_SPEECH_WAV)

    assert isinstance(res, AdapterResult)
    assert res.status == "ok", f"Member 2 adapter failed: {res.error_message}"
    assert res.data is not None
    assert "similarity" in res.data
    assert "decision" in res.data
    assert res.data["decision"] in ("SAME SPEAKER", "DIFFERENT SPEAKER", "UNCERTAIN")


def test_real_member3_adapter():
    assert os.path.exists(TEST_SPEECH_WAV)
    res = member3_adapter.run(TEST_SPEECH_WAV)

    assert isinstance(res, AdapterResult)
    assert res.status == "ok", f"Member 3 adapter failed: {res.error_message}"
    assert res.data is not None
    assert "transcript" in res.data
    assert "context_score" in res.data
    assert "reasons" in res.data
    assert 0.0 <= res.data["context_score"] <= 100.0
