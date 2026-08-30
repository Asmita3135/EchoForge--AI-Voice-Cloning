"""
EchoForge - Audio Deepfake Detection (Recording-Level Chunk Analysis)
Member 1: Recording-Level Analysis Module

This script analyzes an input WAV recording by segmenting audio into ~7-second
chunks, running the pretrained Wav2Vec2 detector on each chunk, and aggregating
statistics across the entire recording using the Median Fake Score.
"""

import sys
import os
import torch
import soundfile as sf
import librosa
import numpy as np
from transformers import AutoFeatureExtractor, AutoModelForAudioClassification

# Pretrained Model Configuration
MODEL_NAME = "garystafford/wav2vec2-deepfake-voice-detector"
TARGET_SAMPLE_RATE = 16000
CHUNK_DURATION_SEC = 7.0
MIN_CHUNK_SEC = 2.5

# PROTOTYPE EVIDENCE THRESHOLDS (Heuristic / Prototype Demonstration Only - Not Scientifically Validated)
PROTOTYPE_EVIDENCE_MODERATE = 0.70
PROTOTYPE_EVIDENCE_HIGH = 0.85


def get_evidence_level(median_fake_score: float) -> str:
    """
    Categorizes the recording-level median fake score into a prototype evidence level.
    """
    if median_fake_score >= PROTOTYPE_EVIDENCE_HIGH:
        return "HIGH"
    elif median_fake_score >= PROTOTYPE_EVIDENCE_MODERATE:
        return "MODERATE"
    else:
        return "LOW"


def load_and_preprocess_audio(audio_path: str):
    """
    Loads audio using soundfile, converts to mono, and resamples to 16,000 Hz.
    """
    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Audio file not found: '{audio_path}'")

    data, sample_rate = sf.read(audio_path)

    if data.ndim == 1:
        num_channels = 1
        mono_data = data
    else:
        num_channels = data.shape[1]
        mono_data = np.mean(data, axis=1)

    duration_sec = len(mono_data) / sample_rate

    # Resample to 16 kHz if necessary
    if sample_rate != TARGET_SAMPLE_RATE:
        speech_array = librosa.resample(y=mono_data.astype(np.float32), orig_sr=sample_rate, target_sr=TARGET_SAMPLE_RATE)
    else:
        speech_array = mono_data.astype(np.float32)

    return speech_array, sample_rate, num_channels, duration_sec


def analyze_recording(audio_path: str, feature_extractor, model, verbose: bool = True):
    """
    Splits recording into ~7s chunks, runs inference on each, and computes aggregated recording-level statistics.
    """
    speech_array, orig_sr, num_channels, total_duration = load_and_preprocess_audio(audio_path)

    chunk_samples = int(CHUNK_DURATION_SEC * TARGET_SAMPLE_RATE)
    min_samples = int(MIN_CHUNK_SEC * TARGET_SAMPLE_RATE)
    total_samples = len(speech_array)

    # Segment audio into chunks
    chunks = []
    if total_samples <= chunk_samples:
        chunks.append(speech_array)
    else:
        for start_idx in range(0, total_samples, chunk_samples):
            end_idx = min(start_idx + chunk_samples, total_samples)
            if (end_idx - start_idx) >= min_samples:
                chunks.append(speech_array[start_idx:end_idx])

    if not chunks:
        chunks.append(speech_array)  # Fallback for short clips

    id2label = model.config.id2label

    if verbose:
        print(f"\n==================================================")
        print(f" EchoForge RECORDING-LEVEL AUDIO DEEPFAKE ANALYSIS")
        print(f"==================================================")
        print(f"File              : {os.path.basename(audio_path)}")
        print(f"Total Duration    : {total_duration:.2f} seconds")
        print(f"Original SR / Ch  : {orig_sr} Hz / {num_channels} channel(s)")
        print(f"Total Chunks      : {len(chunks)}")
        print(f"--------------------------------------------------")
        print(f"{'Chunk':<8} | {'Duration':<8} | {'Real Score':<12} | {'Fake Score':<12}")
        print(f"--------------------------------------------------")

    chunk_fake_scores = []
    chunk_real_scores = []

    for idx, chunk in enumerate(chunks, 1):
        chunk_duration = len(chunk) / TARGET_SAMPLE_RATE
        inputs = feature_extractor(chunk, sampling_rate=TARGET_SAMPLE_RATE, return_tensors="pt")

        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits.squeeze()
            probs = torch.softmax(logits, dim=-1)

        real_score = 0.0
        fake_score = 0.0

        for class_idx, prob in enumerate(probs.tolist()):
            lbl = str(id2label.get(class_idx, f"CLASS_{class_idx}")).lower()
            if 'real' in lbl or 'bonafide' in lbl:
                real_score = prob
            elif 'fake' in lbl or 'spoof' in lbl:
                fake_score = prob

        chunk_real_scores.append(real_score)
        chunk_fake_scores.append(fake_score)

        if verbose:
            print(f"Chunk {idx:<3} | {chunk_duration:.2f}s    | {real_score:.4f}       | {fake_score:.4f}")

    # Aggregated Recording-Level Statistics
    min_fake = float(np.min(chunk_fake_scores))
    max_fake = float(np.max(chunk_fake_scores))
    mean_fake = float(np.mean(chunk_fake_scores))
    median_fake = float(np.median(chunk_fake_scores))

    evidence_level = get_evidence_level(median_fake)

    if verbose:
        print(f"--------------------------------------------------")
        print(f"RECORDING-LEVEL STATISTICS:")
        print(f"  - Total Chunks           : {len(chunks)}")
        print(f"  - Minimum Fake Score     : {min_fake:.4f}")
        print(f"  - Maximum Fake Score     : {max_fake:.4f}")
        print(f"  - Mean Fake Score        : {mean_fake:.4f}")
        print(f"  - Median Fake Score      : {median_fake:.4f}")
        print(f"--------------------------------------------------")
        print(f"Recording-level Detection Score (Median): {median_fake:.4f} ({median_fake * 100:.2f}%)")
        print(f"Model Evidence Level                  : {evidence_level}")
        print(f"==================================================\n")

    return {
        "file": os.path.basename(audio_path),
        "duration": f"{total_duration:.2f}s",
        "chunks": len(chunks),
        "min_fake": min_fake,
        "max_fake": max_fake,
        "mean_fake": mean_fake,
        "median_fake": median_fake,
        "evidence": evidence_level
    }


def main():
    if len(sys.argv) < 2:
        print("\nUsage: python recording_detector.py <path_to_wav_file>")
        print("Example: python recording_detector.py test.wav\n")
        sys.exit(1)

    audio_path = sys.argv[1]

    feature_extractor = AutoFeatureExtractor.from_pretrained(MODEL_NAME)
    model = AutoModelForAudioClassification.from_pretrained(MODEL_NAME)

    analyze_recording(audio_path, feature_extractor, model, verbose=True)


if __name__ == "__main__":
    main()
