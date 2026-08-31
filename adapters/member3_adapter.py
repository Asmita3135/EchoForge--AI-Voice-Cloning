"""
Adapter for Member 3 (STT + Context Analysis Module).
Wraps transcribe_audio() and analyze_context() calls safely.
Solves Member 3's keywords.json path dependency by executing inside Member 3 directory context
without modifying Member 3 source code.
"""
import os
import math
from typing import Tuple, Any, Dict
from adapters.result import AdapterResult


def _run_transcribe_and_context(audio_path: str) -> Tuple[str, Any, Dict[str, Any]]:
    """Executes Member 3 transcribe_audio and analyze_context within Member 3 directory context."""
    from transcribe import transcribe_audio
    from context_analyzer import analyze_context

    transcript, segments = transcribe_audio(audio_path)

    member3_dir = os.path.abspath("C:/Users/ASMITA/OneDrive/Desktop/EchoForge- Member-Repos/EchoForge--AI-Voice-Cloning-context_analysis")
    orig_cwd = os.getcwd()

    try:
        if os.path.exists(member3_dir):
            os.chdir(member3_dir)
        analysis = analyze_context(transcript)
    finally:
        os.chdir(orig_cwd)

    return transcript, segments, analysis


def run(audio_path: str) -> AdapterResult:
    """
    Executes Member 3 audio transcription and context analysis.

    Args:
        audio_path: Path to the input audio file.

    Returns:
        AdapterResult with status "ok" or "error".
    """
    if not audio_path or not os.path.exists(audio_path):
        return AdapterResult(
            status="error",
            error_message=f"Audio file not found: '{audio_path}'",
        )

    try:
        transcript, segments, analysis = _run_transcribe_and_context(audio_path)

        if not isinstance(analysis, dict):
            return AdapterResult(
                status="error",
                error_message="Member 3 analyze_context did not return a dictionary",
            )

        context_score = analysis.get("context_score")
        if not isinstance(context_score, (int, float)) or not math.isfinite(context_score):
            return AdapterResult(
                status="error",
                data=analysis,
                error_message=f"Member 3 returned invalid context_score: {context_score}",
            )

        data = {
            "transcript": transcript,
            "segments": segments,
            "context_score": float(context_score),
            "risk_level": analysis.get("risk_level", "LOW"),
            "detected": analysis.get("detected", {}),
            "reasons": analysis.get("reasons", []),
        }

        return AdapterResult(status="ok", data=data)

    except Exception as e:
        return AdapterResult(
            status="error",
            error_message=f"Member 3 transcription/context analysis failed: {e}",
        )
