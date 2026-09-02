"""
Real E2E integration tests for core pipeline using real underlying ML models and audio samples.
Marked with @pytest.mark.e2e.
Exercises real Member 1 (wav2vec2), Member 2 (SpeechBrain ECAPA-TDNN), and Member 3 (Whisper tiny).
"""
import os
import pytest
from core.pipeline import run_pipeline
from core.models import AnalysisResult

GENUINE_SAMPLE = "sample_audio/genuine_sample.wav"
SYNTHETIC_SAMPLE = "sample_audio/synthetic_sample.wav"
SAME_SPEAKER_REF = "sample_audio/same_speaker.wav"
DIFF_SPEAKER_REF = "sample_audio/different_speaker.wav"
SHORT_SPEECH_SAMPLE = "sample_audio/test_speech.wav"


@pytest.mark.e2e
def test_real_pipeline_genuine_audio_and_same_speaker():
    """Test 1: Genuine audio with matching speaker reference using real ML models."""
    assert os.path.exists(GENUINE_SAMPLE)
    assert os.path.exists(SAME_SPEAKER_REF)

    result = run_pipeline(
        audio_path=GENUINE_SAMPLE,
        reference_audio_path=SAME_SPEAKER_REF,
        request_id="e2e-genuine-same",
    )

    assert isinstance(result, AnalysisResult)
    assert result.request_id == "e2e-genuine-same"
    assert result.decision in ("LOW", "HIGH", "INCONCLUSIVE")
    assert isinstance(result.reliability_score, float)
    assert result.evidence["member1"].status in ("ok", "error")
    assert result.evidence["member2"].status in ("ok", "error", "skipped")
    assert result.evidence["member3"].status in ("ok", "error")


@pytest.mark.e2e
def test_real_pipeline_synthetic_audio():
    """Test 2: Synthetic deepfake audio without reference speaker."""
    assert os.path.exists(SYNTHETIC_SAMPLE)

    result = run_pipeline(
        audio_path=SYNTHETIC_SAMPLE,
        reference_audio_path=None,
        request_id="e2e-synthetic-noref",
    )

    assert isinstance(result, AnalysisResult)
    assert result.request_id == "e2e-synthetic-noref"
    assert result.evidence["member2"].status == "skipped"
    assert result.risk_breakdown.speaker_mismatch_risk is None

    # Deepfake risk should be present if Member 1 succeeded
    if result.evidence["member1"].status == "ok":
        assert result.risk_breakdown.deepfake_risk is not None


@pytest.mark.e2e
def test_real_pipeline_synthetic_audio_with_different_speaker():
    """Test 3: Synthetic deepfake audio with non-matching speaker reference."""
    assert os.path.exists(SYNTHETIC_SAMPLE)
    assert os.path.exists(DIFF_SPEAKER_REF)

    result = run_pipeline(
        audio_path=SYNTHETIC_SAMPLE,
        reference_audio_path=DIFF_SPEAKER_REF,
        request_id="e2e-synthetic-diff-spk",
    )

    assert isinstance(result, AnalysisResult)
    assert result.request_id == "e2e-synthetic-diff-spk"


@pytest.mark.e2e
def test_real_pipeline_skipped_reference_audio():
    """Test 4: Omitted reference audio produces skipped Member 2 state and preserves None risk."""
    assert os.path.exists(GENUINE_SAMPLE)

    result = run_pipeline(
        audio_path=GENUINE_SAMPLE,
        reference_audio_path=None,
        request_id="e2e-skipped-ref",
    )

    assert isinstance(result, AnalysisResult)
    assert result.evidence["member2"].status == "skipped"
    assert result.risk_breakdown.speaker_mismatch_risk is None
    assert any("speaker verification skipped" in w.lower() for w in result.warnings)


@pytest.mark.e2e
def test_real_pipeline_noisy_or_short_audio():
    """Test 5: Short synthetic sine wave audio file evaluates reliability score without crashing."""
    assert os.path.exists(SHORT_SPEECH_SAMPLE)

    result = run_pipeline(
        audio_path=SHORT_SPEECH_SAMPLE,
        reference_audio_path=None,
        request_id="e2e-short-audio",
    )

    assert isinstance(result, AnalysisResult)
    assert isinstance(result.reliability_score, float)
    assert result.reliability_score >= 0.0 and result.reliability_score <= 100.0
