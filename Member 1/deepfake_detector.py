"""
EchoForge — Member 1 Deepfake Detector (Compatibility Bridge)
Wraps Track A whole-audio inference and returns compliant results.
"""

from inference.pipeline import analyze_audio
from model.detector import get_detector
from config import MODEL_NAME


def detect_deepfake(audio_path: str, return_details: bool = False) -> dict:
    """
    Backward-compatible wrapper for analyze_audio.
    Executes Track A whole-audio inference without chunk segmentation.
    """
    res = analyze_audio(audio_path, return_details=True)

    raw_score = res["raw_score"]
    ext = res.get("extended_diagnostics", {})

    legacy_result = {
        "synthetic_score": round(raw_score * 100.0, 2),
        "authentic_score": round((1.0 - raw_score) * 100.0, 2),
        "prediction": "synthetic" if res["classification"] == "AI-GENERATED" else ("authentic" if res["classification"] == "GENUINE" else "uncertain"),
        "confidence": round(res["raw_score"] * 100.0 if res["classification"] == "AI-GENERATED" else (1.0 - res["raw_score"]) * 100.0, 2),
        "classification": res["classification"],
        "raw_score": res["raw_score"],
        "threshold": res["threshold"],
        "duration_sec": res["duration_sec"],
        "quality_score": 100.0 if not res["diagnostics"]["clipping_detected"] else 60.0,
        "snr_estimate": ext.get("snr_estimate_db", 30.0),
        "noise_level": ext.get("noise_floor", 0.001),
        "speech_ratio": ext.get("speech_ratio", 0.9),
        "clipping_ratio": ext.get("clipping_ratio", 0.0),
        "embedding_dim": 256,
        "diagnostics": res["diagnostics"],
    }

    if return_details and "representations" in res:
        legacy_result["representations"] = res["representations"]

    return legacy_result


if __name__ == "__main__":
    import sys
    test_file = sys.argv[1] if len(sys.argv) > 1 else "audio/synthetic_tts_1.wav"
    print(f"Testing detect_deepfake on {test_file}:")
    out = detect_deepfake(test_file, return_details=True)
    print(out)