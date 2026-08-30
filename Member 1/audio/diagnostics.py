"""
EchoForge — Member 1 Audio Diagnostics
Deterministic, objective quality checks for input audio files.
Diagnostics are strictly INFORMATIONAL and do not artificially alter model scores.
"""

import numpy as np


def compute_audio_diagnostics(
    audio: np.ndarray,
    sr: int = 16000,
    min_reliable_duration_sec: float = 3.0,
) -> dict:
    """
    Computes objective acoustic quality diagnostics:
    - File & buffer validity
    - Duration & sufficient duration check
    - Clipping ratio and clipping flag
    - Silence ratio, speech ratio, and mostly_silent flag
    - RMS amplitude, noise floor, and estimated SNR
    - Informational warnings and hard errors list

    All returned diagnostics are objective and separate from score calculation.
    """
    if audio is None or len(audio) == 0:
        return {
            "audio_valid": False,
            "duration_sec": 0.0,
            "sample_rate": sr,
            "sufficient_duration": False,
            "clipping_detected": False,
            "clipping_ratio": 0.0,
            "mostly_silent": True,
            "silence_ratio": 1.0,
            "speech_ratio": 0.0,
            "rms_amplitude": 0.0,
            "noise_floor": 0.0,
            "snr_estimate_db": 0.0,
            "warnings": ["Audio buffer is empty."],
            "hard_errors": ["Empty or unreadable audio."],
        }

    duration_sec = round(float(len(audio) / sr), 4)
    sufficient_duration = duration_sec >= min_reliable_duration_sec

    # 1. Clipping detection (samples near full scale >= 0.99)
    clipping_count = np.sum(np.abs(audio) >= 0.99)
    clipping_ratio = float(clipping_count / len(audio))
    clipping_detected = clipping_ratio >= 0.005  # More than 0.5% samples clipped

    # 2. Frame-level RMS energy and silence analysis
    frame_len = int(0.03 * sr)  # 30 ms frames
    hop_len = int(0.01 * sr)    # 10 ms hop

    if len(audio) < frame_len:
        rms_vals = np.array([float(np.sqrt(np.mean(audio**2)))])
    else:
        num_frames = 1 + (len(audio) - frame_len) // hop_len
        rms_vals = np.array([
            np.sqrt(np.mean(audio[i * hop_len: i * hop_len + frame_len]**2))
            for i in range(num_frames)
        ])

    overall_rms = float(np.sqrt(np.mean(audio**2)))
    noise_floor = float(np.percentile(rms_vals, 10))
    speech_energy = float(np.percentile(rms_vals, 80))

    # SNR estimate (bounded between 0 dB and 50 dB)
    if noise_floor > 1e-7:
        snr = float(20 * np.log10((speech_energy + 1e-6) / (noise_floor + 1e-6)))
        snr = max(0.0, min(50.0, snr))
    else:
        snr = 40.0 if speech_energy > 0.01 else 0.0

    # Dynamic silence threshold
    silence_thresh = max(0.005, noise_floor * 2.0)
    silent_frames = np.sum(rms_vals < silence_thresh)
    silence_ratio = float(silent_frames / len(rms_vals)) if len(rms_vals) > 0 else 1.0
    speech_ratio = float(1.0 - silence_ratio)
    mostly_silent = silence_ratio >= 0.70 or speech_ratio < 0.15

    warnings = []
    hard_errors = []

    if not sufficient_duration:
        warnings.append(f"Audio duration ({duration_sec:.2f}s) is below recommended minimum ({min_reliable_duration_sec:.1f}s).")
    if clipping_detected:
        warnings.append(f"Significant audio clipping detected ({clipping_ratio * 100:.2f}% of samples).")
    if mostly_silent:
        warnings.append(f"High proportion of silence detected ({silence_ratio * 100:.1f}% silent frames).")
    if overall_rms < 0.005:
        warnings.append(f"Very low overall audio signal level (RMS = {overall_rms:.5f}).")

    return {
        "audio_valid": True,
        "duration_sec": duration_sec,
        "sample_rate": sr,
        "sufficient_duration": sufficient_duration,
        "clipping_detected": clipping_detected,
        "clipping_ratio": round(clipping_ratio, 5),
        "mostly_silent": mostly_silent,
        "silence_ratio": round(silence_ratio, 4),
        "speech_ratio": round(speech_ratio, 4),
        "rms_amplitude": round(overall_rms, 5),
        "noise_floor": round(noise_floor, 5),
        "snr_estimate_db": round(snr, 1),
        "warnings": warnings,
        "hard_errors": hard_errors,
    }
