"""
EchoForge — Member 1 Audio Processor (Compatibility Bridge)
Wraps modular audio preprocessing and diagnostics.
"""

import numpy as np
from audio.preprocessing import load_and_standardize_audio
from audio.diagnostics import compute_audio_diagnostics


def load_audio(audio_path: str, target_sr: int = 16000):
    """Loads audio file and standardizes to target sample rate."""
    audio, sr, _ = load_and_standardize_audio(audio_path, target_sr=target_sr, remove_dc=False)
    return audio, sr


def preprocess_audio(audio: np.ndarray, sr: int = 16000, remove_dc: bool = True):
    """Applies non-destructive standardization."""
    if audio is None or len(audio) == 0:
        return audio
    audio = np.nan_to_num(audio, nan=0.0, posinf=0.0, neginf=0.0)
    if remove_dc:
        audio = audio - np.mean(audio)
    return audio.astype(np.float32)


def compute_audio_quality_metrics(audio: np.ndarray, sr: int = 16000):
    """Computes acoustic quality diagnostics."""
    diag = compute_audio_diagnostics(audio, sr=sr)
    return {
        "snr_estimate": diag["snr_estimate_db"],
        "noise_level": diag["noise_floor"],
        "speech_ratio": diag["speech_ratio"],
        "clipping_ratio": diag["clipping_ratio"],
        "quality_score": 100.0 if diag["audio_valid"] and not diag["clipping_detected"] else 50.0,
    }
