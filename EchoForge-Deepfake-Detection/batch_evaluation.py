"""
EchoForge - Batch Audio Deepfake Evaluation Script
Member 1: Prototype Validation Module

This script automatically scans 'samples/real/' and 'samples/ai/' directories,
runs the recording-level Wav2Vec2 detector on each audio file, aggregates
chunk statistics, computes accuracy, and prints a prototype validation summary.

NOTE: This is a SMALL PROTOTYPE VALIDATION for demonstration purposes only.
It is NOT a comprehensive scientific benchmark or formal accuracy evaluation.
"""

import os
import sys
import glob
import numpy as np
from transformers import AutoFeatureExtractor, AutoModelForAudioClassification
from recording_detector import analyze_recording, MODEL_NAME

# Folders for batch evaluation
REAL_SAMPLES_DIR = os.path.join("samples", "real")
AI_SAMPLES_DIR = os.path.join("samples", "ai")


def ensure_directories_exist():
    """
    Creates the required sample directories if they do not already exist.
    """
    os.makedirs(REAL_SAMPLES_DIR, exist_ok=True)
    os.makedirs(AI_SAMPLES_DIR, exist_ok=True)


def get_wav_files(directory_path: str):
    """
    Finds all WAV audio files in the specified directory.
    """
    if not os.path.exists(directory_path):
        return []
    # Match .wav files (case-insensitive extension check)
    files = glob.glob(os.path.join(directory_path, "*.wav")) + glob.glob(os.path.join(directory_path, "*.WAV"))
    return sorted(list(set(files)))


def evaluate_batch():
    ensure_directories_exist()

    real_files = get_wav_files(REAL_SAMPLES_DIR)
    ai_files = get_wav_files(AI_SAMPLES_DIR)

    print("=" * 85, flush=True)
    print("           EchoForge AUDIO DEEPFAKE BATCH EVALUATION STUDY           ", flush=True)
    print("=====================================================================", flush=True)
    print(f"Scanning directory: '{REAL_SAMPLES_DIR}' -> Found {len(real_files)} WAV file(s)", flush=True)
    print(f"Scanning directory: '{AI_SAMPLES_DIR}'   -> Found {len(ai_files)} WAV file(s)", flush=True)
    print("=====================================================================\n", flush=True)

    # Check for empty directories
    if len(real_files) == 0:
        print(f"[NOTICE] No WAV files found in '{REAL_SAMPLES_DIR}'. Please add real human speech WAV samples.", flush=True)
    if len(ai_files) == 0:
        print(f"[NOTICE] No WAV files found in '{AI_SAMPLES_DIR}'. Please add AI-generated speech WAV samples.", flush=True)

    if len(real_files) == 0 and len(ai_files) == 0:
        print("\n[ERROR] Both sample directories are empty. Cannot perform batch evaluation.", flush=True)
        return

    # Load model once for batch efficiency
    print("Loading pretrained Wav2Vec2 detector model...\n", flush=True)
    feature_extractor = AutoFeatureExtractor.from_pretrained(MODEL_NAME)
    model = AutoModelForAudioClassification.from_pretrained(MODEL_NAME)

    evaluation_results = []
    correct_count = 0
    total_count = 0

    # 1. Process Genuine (Real) Samples
    for file_path in real_files:
        res = analyze_recording(file_path, feature_extractor, model, verbose=False)
        filename = os.path.basename(file_path)
        actual_type = "Genuine (Real)"
        
        # Prediction based on evidence / median fake score
        prediction = "FAKE" if res['median_fake'] >= 0.70 else "REAL"
        is_correct = (prediction == "REAL")
        
        if is_correct:
            correct_count += 1
        total_count += 1

        evaluation_results.append({
            "filename": filename,
            "actual_type": actual_type,
            "chunks": res['chunks'],
            "median_fake": res['median_fake'],
            "mean_fake": res['mean_fake'],
            "evidence": res['evidence'],
            "prediction": prediction,
            "is_correct": is_correct
        })

    # 2. Process Synthetic (AI) Samples
    for file_path in ai_files:
        res = analyze_recording(file_path, feature_extractor, model, verbose=False)
        filename = os.path.basename(file_path)
        actual_type = "AI-Generated"
        
        prediction = "FAKE" if res['median_fake'] >= 0.70 else "REAL"
        is_correct = (prediction == "FAKE")
        
        if is_correct:
            correct_count += 1
        total_count += 1

        evaluation_results.append({
            "filename": filename,
            "actual_type": actual_type,
            "chunks": res['chunks'],
            "median_fake": res['median_fake'],
            "mean_fake": res['mean_fake'],
            "evidence": res['evidence'],
            "prediction": prediction,
            "is_correct": is_correct
        })

    # 3. Print Results Table
    print("=" * 110, flush=True)
    print(f"{'File':<20} | {'Actual Type':<16} | {'Chunks':<6} | {'Median Fake':<12} | {'Mean Fake':<12} | {'Evidence':<10} | {'Prediction':<10}", flush=True)
    print("-" * 110, flush=True)

    for item in evaluation_results:
        print(f"{item['filename']:<20} | {item['actual_type']:<16} | {item['chunks']:<6} | {item['median_fake']:.4f}       | {item['mean_fake']:.4f}       | {item['evidence']:<10} | {item['prediction']:<10}", flush=True)

    print("=" * 110, flush=True)

    # 4. Summary Validation Statistics
    incorrect_count = total_count - correct_count
    accuracy_pct = (correct_count / total_count * 100.0) if total_count > 0 else 0.0

    print("\n" + "=" * 65, flush=True)
    print("            PROTOTYPE VALIDATION SUMMARY STATISTICS             ", flush=True)
    print("=================================================================", flush=True)
    print(f"  - Total Real Samples Evaluated : {len(real_files)}", flush=True)
    print(f"  - Total AI Samples Evaluated   : {len(ai_files)}", flush=True)
    print(f"  - Total Samples Tested         : {total_count}", flush=True)
    print(f"  - Correct Predictions          : {correct_count}", flush=True)
    print(f"  - Incorrect Predictions        : {incorrect_count}", flush=True)
    print(f"  - Prototype Accuracy           : {accuracy_pct:.2f}%", flush=True)
    print("=================================================================", flush=True)
    print(" [NOTE] DISCLAIMER: This evaluation is a SMALL PROTOTYPE VALIDATION", flush=True)
    print("        for demonstration purposes. It is NOT a formal benchmark or", flush=True)
    print("        scientifically validated accuracy result.", flush=True)
    print("=================================================================\n", flush=True)


if __name__ == "__main__":
    evaluate_batch()
