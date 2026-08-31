"""
Integration tests for FastAPI application endpoints (GET /health, POST /analyze).
Uses FastAPI TestClient to test HTTP transport, request/response validation,
error handling, path traversal prevention, temp file cleanup, and real pipeline integration.
"""
import os
import io
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from api.main import app
from adapters.result import AdapterResult
from core.models import NormalizedRisk, AnalysisResult

client = TestClient(app)


# Helper function to create mock AnalysisResult
def make_mock_analysis_result(request_id="test-req-123"):
    return AnalysisResult(
        request_id=request_id,
        decision="HIGH",
        risk_score=78.5,
        reliability_score=85.0,
        human_review_required=True,
        reasons=["High deepfake risk detected", "Speaker mismatch detected"],
        warnings=["Sample duration is under 5 seconds"],
        risk_breakdown=NormalizedRisk(
            deepfake_risk=90.0,
            speaker_mismatch_risk=70.0,
            context_risk=60.0,
        ),
        evidence={
            "member1": AdapterResult(status="ok", data={"raw_score": 0.90}),
            "member2": AdapterResult(status="ok", data={"similarity": 0.50}),
            "member3": AdapterResult(status="ok", data={"context_score": 60.0}),
        },
    )


# =============================================================================
# 1. GET /health Endpoint Tests
# =============================================================================
def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "modules" in data
    assert data["modules"]["member1"] == "ok"


# =============================================================================
# 2. POST /analyze Endpoint Tests (Isolated Pipeline Mocks)
# =============================================================================
@patch("api.main.run_pipeline")
def test_analyze_with_all_inputs(mock_pipeline):
    mock_pipeline.return_value = make_mock_analysis_result("req-all-inputs")

    fake_audio = ("test.wav", b"RIFF....WAVEfmt ....data....", "audio/wav")
    fake_ref = ("ref.wav", b"RIFF....WAVEfmt ....refdata..", "audio/wav")

    response = client.post(
        "/analyze",
        files={"audio": fake_audio, "reference_audio": fake_ref},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["request_id"] == "req-all-inputs"
    assert data["decision"] == "HIGH"
    assert data["risk_score"] == 78.5
    assert data["reliability_score"] == 85.0
    assert data["human_review_required"] is True
    assert len(data["reasons"]) == 2
    assert data["risk_breakdown"]["deepfake_risk"] == 90.0
    assert data["evidence"]["member1"]["status"] == "ok"

    # Verify run_pipeline was called with non-empty staged paths
    assert mock_pipeline.called
    kwargs = mock_pipeline.call_args.kwargs
    assert kwargs["audio_path"] is not None
    assert kwargs["reference_audio_path"] is not None
    assert os.path.exists(kwargs["audio_path"]) is False  # Staged file cleaned up after request!


@patch("api.main.run_pipeline")
def test_analyze_without_reference_audio(mock_pipeline):
    mock_pipeline.return_value = make_mock_analysis_result("req-no-ref")

    fake_audio = ("test.wav", b"RIFF....WAVEfmt ....data....", "audio/wav")

    response = client.post(
        "/analyze",
        files={"audio": fake_audio},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["request_id"] == "req-no-ref"

    assert mock_pipeline.called
    kwargs = mock_pipeline.call_args.kwargs
    assert kwargs["audio_path"] is not None
    assert kwargs["reference_audio_path"] is None


def test_analyze_missing_audio():
    response = client.post("/analyze", files={})
    assert response.status_code == 422  # Unprocessable Entity for missing required form field


def test_analyze_empty_audio_file():
    empty_file = ("empty.wav", b"", "audio/wav")
    response = client.post("/analyze", files={"audio": empty_file})
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


@patch("api.main.run_pipeline")
def test_analyze_pipeline_exception(mock_pipeline):
    mock_pipeline.side_effect = RuntimeError("Fatal model GPU OOM crash")

    fake_audio = ("test.wav", b"RIFF....WAVEfmt ....data....", "audio/wav")
    response = client.post("/analyze", files={"audio": fake_audio})

    assert response.status_code == 500
    assert "internal server error" in response.json()["detail"].lower()
    assert "GPU OOM" not in response.json()["detail"]  # No stack traces or sensitive errors exposed


# =============================================================================
# 3. Security & Temporary File Cleanup Tests
# =============================================================================
@patch("api.main.run_pipeline")
def test_filename_path_traversal_safety(mock_pipeline):
    staged_path_holder = []

    def capture_path(*args, **kwargs):
        staged_path_holder.append(kwargs["audio_path"])
        return make_mock_analysis_result()

    mock_pipeline.side_effect = capture_path

    malicious_filename = "../../../../../etc/passwd.wav"
    fake_audio = (malicious_filename, b"RIFF....WAVEfmt ....data....", "audio/wav")

    response = client.post("/analyze", files={"audio": fake_audio})
    assert response.status_code == 200

    staged_path = staged_path_holder[0]
    assert ".." not in staged_path
    assert os.path.isabs(staged_path)


@patch("api.main.run_pipeline")
def test_temp_file_cleanup_on_success_and_exception(mock_pipeline):
    staged_paths = []

    def capture_paths_and_raise(*args, **kwargs):
        staged_paths.append(kwargs["audio_path"])
        if kwargs.get("reference_audio_path"):
            staged_paths.append(kwargs["reference_audio_path"])
        raise RuntimeError("Pipeline forced crash")

    mock_pipeline.side_effect = capture_paths_and_raise

    fake_audio = ("test.wav", b"RIFF....WAVEfmt ....data....", "audio/wav")
    fake_ref = ("ref.wav", b"RIFF....WAVEfmt ....refdata..", "audio/wav")

    response = client.post("/analyze", files={"audio": fake_audio, "reference_audio": fake_ref})
    assert response.status_code == 500

    assert len(staged_paths) == 2
    for p in staged_paths:
        assert os.path.exists(p) is False  # Verified temporary files removed after exception!


# =============================================================================
# 4. Unmocked API Happy-Path Test (Real Pipeline Execution)
# =============================================================================
def test_analyze_unmocked_happy_path_real_pipeline():
    """Unmocked API happy-path integration test exercising real pipeline through FastAPI TestClient."""
    sample_path = "sample_audio/genuine_sample.wav"
    ref_path = "sample_audio/same_speaker.wav"
    assert os.path.exists(sample_path)
    assert os.path.exists(ref_path)

    with open(sample_path, "rb") as f_audio, open(ref_path, "rb") as f_ref:
        response = client.post(
            "/analyze",
            files={
                "audio": ("genuine_sample.wav", f_audio, "audio/wav"),
                "reference_audio": ("same_speaker.wav", f_ref, "audio/wav"),
            },
        )

    assert response.status_code == 200
    data = response.json()
    assert "request_id" in data
    assert data["decision"] in ("LOW", "HIGH", "INCONCLUSIVE")
    assert 0.0 <= data["reliability_score"] <= 100.0
    if data["risk_score"] is not None:
        assert 0.0 <= data["risk_score"] <= 100.0
    assert isinstance(data["human_review_required"], bool)
    assert "risk_breakdown" in data
    assert "evidence" in data
    assert data["evidence"]["member1"]["status"] in ("ok", "error")
    assert data["evidence"]["member2"]["status"] in ("ok", "error")
    assert data["evidence"]["member3"]["status"] in ("ok", "error")
