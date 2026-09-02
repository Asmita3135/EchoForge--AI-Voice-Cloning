"""
Adapter for Member 1 (Deepfake Detection Module).
Wraps analyze_audio() call and handles errors.
Does NOT modify Member 1 source code.
Safely isolates Member 1's config.py module during import execution.
"""
import os
import sys
import math
import importlib.util
from adapters.result import AdapterResult


def _analyze_audio(audio_path: str, return_details: bool = True) -> dict:
    """Executes Member 1 analyze_audio within an isolated config context."""
    member1_dir = os.path.abspath("C:/Users/ASMITA/OneDrive/Desktop/EchoForge- Member-Repos/EchoForge--AI-Voice-Cloning-deepfake-voice-detection/Member 1")
    orig_config = sys.modules.get("config")

    try:
        if os.path.exists(member1_dir):
            if member1_dir not in sys.path:
                sys.path.insert(0, member1_dir)
            m1_config_path = os.path.join(member1_dir, "config.py")
            if os.path.exists(m1_config_path):
                spec = importlib.util.spec_from_file_location("config", m1_config_path)
                m1_config = importlib.util.module_from_spec(spec)
                if spec and spec.loader:
                    spec.loader.exec_module(m1_config)
                    sys.modules["config"] = m1_config

        from inference.pipeline import analyze_audio
        return analyze_audio(audio_path, return_details=return_details)
    finally:
        if orig_config:
            sys.modules["config"] = orig_config


def run(audio_path: str, return_details: bool = True) -> AdapterResult:
    """
    Executes Member 1 audio deepfake detection.

    Args:
        audio_path: Path to the input audio file.
        return_details: Passed as True to request extended diagnostics.

    Returns:
        AdapterResult with status "ok" or "error".
    """
    if not audio_path or not os.path.exists(audio_path):
        return AdapterResult(
            status="error",
            error_message=f"Audio file not found: '{audio_path}'",
        )

    try:
        result_dict = _analyze_audio(audio_path, return_details=return_details)
    except Exception as e:
        return AdapterResult(
            status="error",
            error_message=f"Member 1 analyze_audio failed: {e}",
        )

    # Check for top-level error key returned by analyze_audio()
    if isinstance(result_dict, dict) and "error" in result_dict:
        return AdapterResult(
            status="error",
            data=result_dict,
            error_message=str(result_dict["error"]),
        )

    # Validate raw_score presence and finiteness
    if isinstance(result_dict, dict) and "raw_score" in result_dict:
        raw_score = result_dict["raw_score"]
        if isinstance(raw_score, (int, float)) and math.isfinite(raw_score):
            return AdapterResult(status="ok", data=result_dict)

    return AdapterResult(
        status="error",
        data=result_dict if isinstance(result_dict, dict) else None,
        error_message="Member 1 returned malformed output or non-finite raw_score",
    )
