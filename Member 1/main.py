"""
EchoForge — Member 1 AI/Deepfake Voice Detection
Main CLI Entrypoint and Public Interface.

Usage:
    python main.py <path_to_audio_file>
    python main.py <path_to_audio_file> --json
    python main.py --run-eval
"""

import os
import sys
import json
import argparse
from config import (
    MODEL_NAME,
    DETECTION_THRESHOLD,
    MIN_RELIABLE_DURATION_SEC,
    CLASS_GENUINE,
    CLASS_AI_GENERATED,
    CLASS_UNCERTAIN,
)
from inference.pipeline import analyze_audio


def resolve_audio_path(given_path: str = None) -> str:
    """Resolves the audio file path from arguments or default candidates."""
    if given_path and os.path.exists(given_path):
        return given_path

    # Check default test audio files
    candidates = [
        "audio/synthetic_tts_1.wav",
        "audio/real_audio_test (1).wav",
        "audio/dummy_test.wav",
    ]
    for c in candidates:
        if os.path.exists(c):
            return c

    # Search in audio directory
    if os.path.exists("audio"):
        for f in os.listdir("audio"):
            if f.lower().endswith((".wav", ".mp3", ".flac", ".m4a", ".ogg")):
                return os.path.join("audio", f)

    return None


def print_cli_report(res: dict, audio_path: str):
    """Prints a clear, explainable diagnostic report matching EchoForge specifications."""
    diag = res.get("diagnostics", {})
    ext_diag = res.get("extended_diagnostics", {})

    print("\n" + "=" * 60)
    print("ECHOFORGE -- AI VOICE AUTHENTICITY SCREENING (MEMBER 1)")
    print("=" * 60)
    print(f"Target Audio File:    {audio_path}")
    print(f"Detection Model:      {res['model']}")
    print(f"Sample Rate:          {res['sample_rate_used']} Hz")
    print(f"Duration:             {res['duration_sec']:.2f} s")
    print("-" * 60)
    print(f"Prediction:           {res['classification']}")
    print(f"Raw Spoof Score:      {res['raw_score']:.4f}")
    print(f"Decision Threshold:   {res['threshold']:.2f}")
    print(f"Evidence / Confidence: {res['confidence']}")
    print("-" * 60)
    print("Objective Audio Diagnostics:")
    
    # Valid audio
    if diag.get("audio_valid", True):
        print("  [OK] Valid audio format & finite waveform")
    else:
        print("  [FAIL] Invalid or corrupted audio")

    # Duration
    if diag.get("sufficient_duration", True):
        print(f"  [OK] Sufficient duration (>= {MIN_RELIABLE_DURATION_SEC}s)")
    else:
        print(f"  [WARN] Insufficient duration (< {MIN_RELIABLE_DURATION_SEC}s - evidence limited)")

    # Clipping
    if not diag.get("clipping_detected", False):
        print("  [OK] No significant clipping detected")
    else:
        clip_r = ext_diag.get("clipping_ratio", 0.0)
        print(f"  [WARN] Significant clipping detected ({clip_r*100:.2f}% samples)")

    # Silence
    if not diag.get("mostly_silent", False):
        print("  [OK] Usable speech energy present")
    else:
        print("  [WARN] High proportion of silence / low speech energy")

    # SNR / Noise Level if available
    if "snr_estimate_db" in ext_diag:
        print(f"  * Estimated SNR:       {ext_diag['snr_estimate_db']} dB")
    if "rms_amplitude" in ext_diag:
        print(f"  * RMS Amplitude:       {ext_diag['rms_amplitude']:.5f}")

    # Display warnings / uncertainty reasons if present
    uncertainty_reasons = ext_diag.get("uncertainty_reasons", [])
    if uncertainty_reasons:
        print("-" * 60)
        print("Uncertainty Notes:")
        for r in uncertainty_reasons:
            print(f"  * {r}")

    print("=" * 60 + "\n")


def main():
    parser = argparse.ArgumentParser(description="EchoForge Member 1 — AI/Deepfake Voice Detection")
    parser.add_argument("audio_file", nargs="?", default=None, help="Path to audio file (WAV, MP3, etc.)")
    parser.add_argument("--json", action="store_true", help="Output pure JSON format")
    parser.add_argument("--threshold", type=float, default=DETECTION_THRESHOLD, help="Operating detection threshold")
    parser.add_argument("--min-duration", type=float, default=MIN_RELIABLE_DURATION_SEC, help="Minimum reliable duration in sec")
    parser.add_argument("--run-eval", action="store_true", help="Run full evaluation and robustness experiment suite")

    args = parser.parse_args()

    if args.run_eval:
        from evaluation.run_experiments import print_experiment_report
        print_experiment_report()
        return

    audio_path = resolve_audio_path(args.audio_file)
    if not audio_path:
        if args.json:
            print(json.dumps({"error": "No audio file provided or found."}))
        else:
            print("Error: No audio file found or provided.")
            print("Usage: python main.py <path_to_audio_file>")
        sys.exit(1)

    result = analyze_audio(
        audio_path,
        threshold=args.threshold,
        min_duration=args.min_duration,
        return_details=True,
    )

    if args.json:
        # Standard JSON output without non-essential extended keys if strict
        standard_keys = [
            "model", "classification", "predicted_label",
            "raw_score", "threshold", "confidence",
            "sample_rate_used", "duration_sec", "diagnostics"
        ]
        clean_json = {k: result[k] for k in standard_keys if k in result}
        print(json.dumps(clean_json, indent=2))
    else:
        print_cli_report(result, audio_path)


if __name__ == "__main__":
    main()