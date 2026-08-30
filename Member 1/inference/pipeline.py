"""
EchoForge — Member 1 Inference Pipeline
Main end-to-end audio analysis function: analyze_audio(path) -> dict.
Guarantees stable JSON schema matching EchoForge specification.
"""

import os
from config import (
    MODEL_NAME,
    MODEL_SAMPLE_RATE,
    DETECTION_THRESHOLD,
    MIN_RELIABLE_DURATION_SEC,
    UNCERTAINTY_MARGIN,
)
from audio.preprocessing import load_and_standardize_audio
from audio.diagnostics import compute_audio_diagnostics
from model.detector import get_detector
from inference.scoring import evaluate_decision


def analyze_audio(
    audio_path: str,
    threshold: float = DETECTION_THRESHOLD,
    min_duration: float = MIN_RELIABLE_DURATION_SEC,
    uncertainty_margin: float = UNCERTAINTY_MARGIN,
    return_details: bool = False,
) -> dict:
    """
    Analyzes an input audio file to estimate if it is genuine human speech or AI-generated.

    Args:
        audio_path: Path to the input audio file (WAV, MP3, M4A, AAC, OGG, FLAC).
        threshold: Operating detection threshold for spoof detection.
        min_duration: Minimum duration in seconds required for reliable classification.
        uncertainty_margin: Score boundary range around threshold resulting in UNCERTAIN.
        return_details: If True, attaches extended diagnostic fields and representation shapes.

    Returns:
        dict matching the EchoForge Member 1 JSON Specification:
        {
            "model": str,
            "classification": "GENUINE" | "AI-GENERATED" | "UNCERTAIN",
            "predicted_label": "bonafide" | "spoof" | "uncertain",
            "raw_score": float,
            "threshold": float,
            "confidence": "HIGH" | "MODERATE" | "LOW",
            "sample_rate_used": int,
            "duration_sec": float,
            "diagnostics": {
                "audio_valid": bool,
                "sufficient_duration": bool,
                "clipping_detected": bool,
                "mostly_silent": bool
            }
        }
    """
    if not os.path.exists(audio_path):
        return {
            "model": MODEL_NAME,
            "classification": "UNCERTAIN",
            "predicted_label": "uncertain",
            "raw_score": 0.0,
            "threshold": threshold,
            "confidence": "LOW",
            "sample_rate_used": MODEL_SAMPLE_RATE,
            "duration_sec": 0.0,
            "diagnostics": {
                "audio_valid": False,
                "sufficient_duration": False,
                "clipping_detected": False,
                "mostly_silent": True,
            },
            "error": f"Audio file not found: {audio_path}",
        }

    # 1. Load and standardize audio conservatively
    try:
        audio_data, sr, original_info = load_and_standardize_audio(
            audio_path,
            target_sr=MODEL_SAMPLE_RATE,
            remove_dc=True,
        )
    except Exception as e:
        return {
            "model": MODEL_NAME,
            "classification": "UNCERTAIN",
            "predicted_label": "uncertain",
            "raw_score": 0.0,
            "threshold": threshold,
            "confidence": "LOW",
            "sample_rate_used": MODEL_SAMPLE_RATE,
            "duration_sec": 0.0,
            "diagnostics": {
                "audio_valid": False,
                "sufficient_duration": False,
                "clipping_detected": False,
                "mostly_silent": True,
            },
            "error": f"Failed to load/standardize audio: {e}",
        }

    # 2. Compute deterministic audio diagnostics
    diag = compute_audio_diagnostics(
        audio=audio_data,
        sr=sr,
        min_reliable_duration_sec=min_duration,
    )

    # 3. Execute whole-audio inference via Track A model
    detector = get_detector(MODEL_NAME)
    model_output = detector.forward(audio_data, return_representations=return_details)

    raw_score = model_output["raw_score"]

    # 4. Evaluate decision and uncertainty logic
    decision = evaluate_decision(
        raw_score=raw_score,
        diagnostics=diag,
        threshold=threshold,
        min_duration=min_duration,
        uncertainty_margin=uncertainty_margin,
    )

    # 5. Construct compliant standard JSON output
    result = {
        "model": MODEL_NAME,
        "classification": decision["classification"],
        "predicted_label": decision["predicted_label"],
        "raw_score": raw_score,
        "threshold": threshold,
        "confidence": decision["confidence"],
        "sample_rate_used": sr,
        "duration_sec": diag["duration_sec"],
        "diagnostics": {
            "audio_valid": diag["audio_valid"],
            "sufficient_duration": diag["sufficient_duration"],
            "clipping_detected": diag["clipping_detected"],
            "mostly_silent": diag["mostly_silent"],
        },
    }

    # Extended details for debugging / research if requested
    if return_details:
        result["extended_diagnostics"] = {
            "clipping_ratio": diag["clipping_ratio"],
            "silence_ratio": diag["silence_ratio"],
            "speech_ratio": diag["speech_ratio"],
            "rms_amplitude": diag["rms_amplitude"],
            "noise_floor": diag["noise_floor"],
            "snr_estimate_db": diag["snr_estimate_db"],
            "warnings": diag["warnings"],
            "uncertainty_reasons": decision["uncertainty_reasons"],
            "original_audio_info": original_info,
            "logits": model_output["logits"],
        }
        if "representations" in model_output:
            result["representations"] = model_output["representations"]

    return result
