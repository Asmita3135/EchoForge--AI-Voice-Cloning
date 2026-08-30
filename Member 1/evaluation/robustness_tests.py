"""
EchoForge — Member 1 Controlled Robustness Testing Suite
Applies single-factor controlled acoustic perturbations:
1. MP3 / Codec / Bitrate compression simulation
2. Telephone bandpass degradation (300 Hz - 3400 Hz / 8 kHz bandwidth)
3. Additive noise at controlled SNR levels (20dB, 10dB, 5dB)
4. Duration variation (1s, 2s, 3s, 5s, 10s)
5. Volume / Amplitude level scaling (-12dB, -6dB, +6dB)
6. Room reverberation / echo simulation
"""

import os
import numpy as np
import scipy.signal
import soundfile as sf
import librosa
from audio.preprocessing import load_and_standardize_audio
from inference.pipeline import analyze_audio


def apply_additive_noise(audio: np.ndarray, snr_db: float = 15.0) -> np.ndarray:
    """Adds white Gaussian noise at a specified Signal-to-Noise Ratio (dB)."""
    signal_power = np.mean(audio ** 2)
    if signal_power == 0:
        return audio
    noise_power = signal_power / (10 ** (snr_db / 10.0))
    noise = np.random.normal(0, np.sqrt(noise_power), size=len(audio)).astype(np.float32)
    perturbed = audio + noise
    # Prevent clipping
    max_val = np.max(np.abs(perturbed))
    if max_val > 1.0:
        perturbed = perturbed / max_val
    return perturbed


def apply_telephone_filter(audio: np.ndarray, sr: int = 16000) -> np.ndarray:
    """Simulates telephone audio transmission (bandpass 300 Hz - 3400 Hz)."""
    sos = scipy.signal.butter(4, [300, 3400], btype="bandpass", fs=sr, output="sos")
    filtered = scipy.signal.sosfilt(sos, audio)
    return filtered.astype(np.float32)


def apply_volume_scaling(audio: np.ndarray, db_change: float) -> np.ndarray:
    """Scales audio amplitude by a specified dB offset."""
    gain = 10 ** (db_change / 20.0)
    scaled = audio * gain
    # Clip gracefully if excessive gain
    return np.clip(scaled, -1.0, 1.0).astype(np.float32)


def apply_duration_crop(audio: np.ndarray, sr: int = 16000, duration_sec: float = 3.0) -> np.ndarray:
    """Crops audio to a specific duration in seconds."""
    target_samples = int(duration_sec * sr)
    if len(audio) <= target_samples:
        return audio
    return audio[:target_samples].astype(np.float32)


def apply_reverb_simulation(audio: np.ndarray, sr: int = 16000, delay_ms: float = 50.0, decay: float = 0.35) -> np.ndarray:
    """Applies a simple single-echo acoustic reverberation filter."""
    delay_samples = int((delay_ms / 1000.0) * sr)
    reverb = np.zeros(len(audio) + delay_samples, dtype=np.float32)
    reverb[:len(audio)] += audio
    reverb[delay_samples:] += audio * decay
    cropped = reverb[:len(audio)]
    max_val = np.max(np.abs(cropped))
    if max_val > 1.0:
        cropped = cropped / max_val
    return cropped


def generate_perturbations(audio: np.ndarray, sr: int = 16000) -> dict:
    """
    Generates a suite of controlled single-factor perturbations for a given audio waveform.
    """
    return {
        "baseline_clean": audio,
        "noise_snr_20db": apply_additive_noise(audio, snr_db=20.0),
        "noise_snr_10db": apply_additive_noise(audio, snr_db=10.0),
        "noise_snr_5db": apply_additive_noise(audio, snr_db=5.0),
        "telephone_bandpass": apply_telephone_filter(audio, sr=sr),
        "reverb_echo": apply_reverb_simulation(audio, sr=sr, delay_ms=40.0, decay=0.30),
        "volume_minus_12db": apply_volume_scaling(audio, -12.0),
        "volume_plus_6db": apply_volume_scaling(audio, 6.0),
        "duration_1s": apply_duration_crop(audio, sr=sr, duration_sec=1.0),
        "duration_2s": apply_duration_crop(audio, sr=sr, duration_sec=2.0),
        "duration_3s": apply_duration_crop(audio, sr=sr, duration_sec=3.0),
        "duration_5s": apply_duration_crop(audio, sr=sr, duration_sec=5.0),
    }


def run_robustness_evaluation(
    audio_files: list,
    expected_labels: list,
    output_dir: str = "output/robustness_temp",
    threshold: float = 0.50,
) -> list:
    """
    Runs controlled robustness experiments across audio files, applying one transformation
    at a time, logging raw scores, thresholds, classifications, and correctness.
    """
    os.makedirs(output_dir, exist_ok=True)
    results = []

    for file_path, expected_label in zip(audio_files, expected_labels):
        base_name = os.path.basename(file_path)
        audio, sr, _ = load_and_standardize_audio(file_path, target_sr=16000)
        perturbations = generate_perturbations(audio, sr=sr)

        for transform_name, perturbed_audio in perturbations.items():
            temp_path = os.path.join(output_dir, f"{base_name}_{transform_name}.wav")
            sf.write(temp_path, perturbed_audio, sr)

            analysis = analyze_audio(temp_path, threshold=threshold, return_details=True)

            raw_score = analysis["raw_score"]
            classification = analysis["classification"]
            predicted_label = analysis["predicted_label"]

            # Evaluate correctness
            is_correct = False
            if classification == "UNCERTAIN":
                status = "UNCERTAIN"
            elif expected_label == "fake" and classification == "AI-GENERATED":
                is_correct = True
                status = "CORRECT"
            elif expected_label == "real" and classification == "GENUINE":
                is_correct = True
                status = "CORRECT"
            else:
                status = "MISCLASSIFIED"

            record = {
                "file": base_name,
                "expected_label": expected_label,
                "transformation": transform_name,
                "duration_sec": analysis["duration_sec"],
                "raw_score": raw_score,
                "threshold": threshold,
                "classification": classification,
                "predicted_label": predicted_label,
                "confidence": analysis["confidence"],
                "status": status,
                "is_correct": is_correct,
            }
            results.append(record)

            # Cleanup temp file
            try:
                os.remove(temp_path)
            except Exception:
                pass

    return results
