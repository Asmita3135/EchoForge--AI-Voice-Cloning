"""
EchoForge - Audio Deepfake / Manipulation Detection Prototype
Member 1: Audio Deepfake Detection Module

This script loads a WAV audio file, resamples it to 16 kHz mono,
and runs inference using the pretrained Hugging Face model:
'garystafford/wav2vec2-deepfake-voice-detector'.
"""

import sys
import os
import numpy as np
import soundfile as sf
import librosa
from transformers import pipeline

# Pretrained model identifier on Hugging Face Hub
MODEL_NAME = "garystafford/wav2vec2-deepfake-voice-detector"
TARGET_SAMPLE_RATE = 16000  # 16 kHz expected by Wav2Vec2


def load_and_preprocess_audio(audio_path: str):
    """
    Loads an audio file using SoundFile/Librosa, converts multi-channel to mono,
    and resamples to 16 kHz.

    Args:
        audio_path (str): Path to the WAV audio file.

    Returns:
        tuple: (speech_array, original_sample_rate, num_channels)
    """
    # Step 1: Validate file existence
    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Audio file not found: '{audio_path}'")

    # Step 2: Load audio waveform using soundfile
    try:
        data, sample_rate = sf.read(audio_path)
    except Exception as e:
        raise ValueError(f"Could not read or parse audio file '{audio_path}'. Error: {e}")

    # Determine number of channels
    if data.ndim == 1:
        num_channels = 1
        mono_data = data
    else:
        num_channels = data.shape[1]
        # Step 3: Convert stereo / multi-channel to mono by averaging channels
        mono_data = np.mean(data, axis=1)

    # Step 4: Resample audio to 16,000 Hz if necessary using librosa
    if sample_rate != TARGET_SAMPLE_RATE:
        speech_array = librosa.resample(y=mono_data.astype(np.float32), orig_sr=sample_rate, target_sr=TARGET_SAMPLE_RATE)
    else:
        speech_array = mono_data.astype(np.float32)

    return speech_array, sample_rate, num_channels


def run_detection(audio_path: str):
    """
    Runs audio deepfake detection pipeline on the provided audio file.
    """
    print(f"\n[1/3] Loading and preprocessing audio file: '{audio_path}'...", flush=True)
    
    try:
        speech_array, orig_sample_rate, num_channels = load_and_preprocess_audio(audio_path)
    except FileNotFoundError as fnf_err:
        print(f"\n[ERROR] {fnf_err}", flush=True)
        sys.exit(1)
    except ValueError as val_err:
        print(f"\n[ERROR] {val_err}", flush=True)
        sys.exit(1)
    except Exception as err:
        print(f"\n[ERROR] Unexpected error while loading audio: {err}", flush=True)
        sys.exit(1)

    print(f"      - Original Sample Rate : {orig_sample_rate} Hz", flush=True)
    print(f"      - Original Channels    : {num_channels}", flush=True)
    print(f"      - Processed Sample Rate: {TARGET_SAMPLE_RATE} Hz (Mono)", flush=True)

    # Step 5: Load Hugging Face audio classification pipeline
    print(f"\n[2/3] Loading pretrained model '{MODEL_NAME}'...", flush=True)
    try:
        classifier = pipeline("audio-classification", model=MODEL_NAME)
    except Exception as e:
        print(f"\n[ERROR] Failed to load model '{MODEL_NAME}'. Error: {e}", flush=True)
        sys.exit(1)

    # Step 6: Perform model inference
    print("\n[3/3] Running model inference...", flush=True)
    try:
        results = classifier({"raw": speech_array, "sampling_rate": TARGET_SAMPLE_RATE})
    except Exception as e:
        print(f"\n[ERROR] Inference failed. Error: {e}", flush=True)
        sys.exit(1)

    # Step 7: Print raw model output for debugging & label verification
    print("\n------------------------------------------------", flush=True)
    print("DEBUG: Raw Model Output from Hugging Face:", flush=True)
    print(results, flush=True)
    print("------------------------------------------------", flush=True)

    # Step 8: Parse results (top prediction is index 0)
    top_result = results[0]
    model_label = top_result['label'].upper()  # 'REAL' or 'FAKE'
    detection_score = top_result['score']      # Model confidence/detection score

    # Step 9: Format and display result summary
    print("\n================================================", flush=True)
    print("       EchoForge AUDIO DEEPFAKE DETECTION       ", flush=True)
    print("================================================", flush=True)
    print(f"File              : {os.path.basename(audio_path)}", flush=True)
    print(f"Sample Rate       : {TARGET_SAMPLE_RATE} Hz", flush=True)
    print(f"Channels          : 1 (Mono)", flush=True)
    print(f"Model             : Wav2Vec2 Deepfake Voice Detector", flush=True)
    print("------------------------------------------------", flush=True)
    print(f"Detection Score   : {detection_score:.4f} ({detection_score * 100:.2f}%)", flush=True)
    print(f"Model Label       : {model_label}", flush=True)
    print("================================================\n", flush=True)


def main():
    if len(sys.argv) < 2:
        print("\nUsage: python detect.py <path_to_wav_file>", flush=True)
        print("Example: python detect.py test.wav\n", flush=True)
        sys.exit(1)

    audio_file_path = sys.argv[1]
    run_detection(audio_file_path)


if __name__ == "__main__":
    main()
