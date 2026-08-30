"""
EchoForge — Member 1 Experiment & Validation Suite
Executes baseline evaluation, validation threshold sweep, and controlled robustness tests.
"""

import os
import json
import numpy as np
from config import (
    MODEL_NAME,
    DETECTION_THRESHOLD,
    MIN_RELIABLE_DURATION_SEC,
)
from inference.pipeline import analyze_audio
from evaluation.metrics import compute_classification_metrics
from evaluation.robustness_tests import run_robustness_evaluation


def discover_audio_dataset(audio_dir: str = "audio") -> tuple:
    """
    Discovers available audio files in the project and maps ground truth labels.
    """
    files = []
    labels = []

    if not os.path.exists(audio_dir):
        return files, labels

    for f in sorted(os.listdir(audio_dir)):
        if f.lower().endswith((".wav", ".mp3", ".flac", ".m4a", ".ogg")):
            p = os.path.join(audio_dir, f)
            f_lower = f.lower()
            if "synth" in f_lower or "fake" in f_lower or "spoof" in f_lower:
                labels.append(1)  # Synthetic / Spoof
                files.append(p)
            elif "real" in f_lower or "human" in f_lower or "genuine" in f_lower or "bonafide" in f_lower or "dummy" in f_lower:
                labels.append(0)  # Genuine / Real
                files.append(p)
            else:
                # Default to real if unmarked test file
                labels.append(0)
                files.append(p)

    return files, labels


def run_baseline_evaluation(files: list, true_labels: list, threshold: float = DETECTION_THRESHOLD) -> tuple:
    """Runs single-pass evaluation on clean baseline audio files."""
    results = []
    pred_labels = []
    scores = []

    for path, true_label in zip(files, true_labels):
        res = analyze_audio(path, threshold=threshold, return_details=True)
        raw_score = res["raw_score"]
        classification = res["classification"]
        scores.append(raw_score)

        if classification == "AI-GENERATED":
            pred_labels.append(1)
        elif classification == "GENUINE":
            pred_labels.append(0)
        else:
            pred_labels.append(-1)  # Uncertain

        results.append({
            "file": os.path.basename(path),
            "true_label": "Synthetic (1)" if true_label == 1 else "Genuine (0)",
            "duration_sec": res["duration_sec"],
            "raw_score": raw_score,
            "threshold": threshold,
            "classification": classification,
            "confidence": res["confidence"],
            "snr_db": res.get("extended_diagnostics", {}).get("snr_estimate_db", "N/A"),
        })

    metrics = compute_classification_metrics(true_labels, pred_labels, y_scores=scores)
    return results, metrics


def run_threshold_sweep(files: list, true_labels: list, thresholds: list = None) -> list:
    """
    Sweeps decision threshold on validation set to find the optimal operating point.
    Calculates Precision, Recall, F1, FPR, and FNR for each candidate threshold.
    """
    if thresholds is None:
        thresholds = [round(t, 2) for t in np.arange(0.10, 0.95, 0.05)]

    sweep_results = []

    for th in thresholds:
        preds = []
        scores = []
        for path in files:
            res = analyze_audio(path, threshold=th, return_details=False)
            scores.append(res["raw_score"])
            if res["classification"] == "AI-GENERATED":
                preds.append(1)
            elif res["classification"] == "GENUINE":
                preds.append(0)
            else:
                preds.append(-1)

        m = compute_classification_metrics(true_labels, preds, y_scores=scores)
        sweep_results.append({
            "threshold": th,
            "f1_score": m["f1_score"],
            "precision": m["precision"],
            "recall": m["recall"],
            "fpr": m["fpr"],
            "fnr": m["fnr"],
            "accuracy": m["accuracy"],
            "uncertain_count": m["uncertain_samples"],
        })

    return sweep_results


def print_experiment_report():
    print("=" * 80)
    print("ECHOFORGE MEMBER 1 — AI/DEEPFAKE VOICE DETECTION EVALUATION SUITE")
    print(f"Model: {MODEL_NAME}")
    print(f"Backend: Track A (Gustking Wav2Vec2 XLSR-53)")
    print("=" * 80)

    files, labels = discover_audio_dataset("audio")
    print(f"\nDiscovered {len(files)} test audio samples in 'audio/' directory:")
    for f, l in zip(files, labels):
        print(f" - {os.path.basename(f):32s} [Ground Truth: {'SYNTHETIC' if l==1 else 'GENUINE'}]")

    # 1. Baseline Evaluation
    print("\n" + "-" * 80)
    print("1. BASELINE EVALUATION (Operating Threshold: " + str(DETECTION_THRESHOLD) + ")")
    print("-" * 80)
    baseline_res, metrics = run_baseline_evaluation(files, labels, threshold=DETECTION_THRESHOLD)

    print(f"{'Filename':30s} | {'Ground Truth':13s} | {'Raw Score':9s} | {'Classification':14s} | {'Confidence':10s}")
    print("-" * 80)
    for r in baseline_res:
        print(f"{r['file']:30s} | {r['true_label']:13s} | {r['raw_score']:9.4f} | {r['classification']:14s} | {r['confidence']:10s}")

    print("\nBaseline Metrics:")
    print(f" - Precision: {metrics['precision'] * 100:.1f}%")
    print(f" - Recall:    {metrics['recall'] * 100:.1f}%")
    print(f" - F1-Score:  {metrics['f1_score'] * 100:.1f}%")
    print(f" - FPR:       {metrics['fpr'] * 100:.1f}%")
    print(f" - FNR:       {metrics['fnr'] * 100:.1f}%")
    print(f" - Accuracy:  {metrics['accuracy'] * 100:.1f}%")
    if "eer" in metrics:
        print(f" - EER:       {metrics['eer'] * 100:.1f}%")

    # 2. Threshold Sweep
    print("\n" + "-" * 80)
    print("2. VALIDATION THRESHOLD SWEEP")
    print("-" * 80)
    sweep = run_threshold_sweep(files, labels)
    print(f"{'Threshold':10s} | {'F1-Score':10s} | {'Precision':10s} | {'Recall':10s} | {'FPR':8s} | {'FNR':8s} | {'Accuracy':10s}")
    print("-" * 80)
    best_th = DETECTION_THRESHOLD
    best_f1 = -1.0
    for s in sweep:
        print(f"{s['threshold']:10.2f} | {s['f1_score']*100:9.1f}% | {s['precision']*100:9.1f}% | {s['recall']*100:9.1f}% | {s['fpr']*100:7.1f}% | {s['fnr']*100:7.1f}% | {s['accuracy']*100:9.1f}%")
        if s["f1_score"] > best_f1:
            best_f1 = s["f1_score"]
            best_th = s["threshold"]
    print(f"\nOptimal threshold on validation set based on F1: {best_th:.2f} (F1 = {best_f1*100:.1f}%)")

    # 3. Controlled Robustness Tests
    print("\n" + "-" * 80)
    print("3. CONTROLLED ROBUSTNESS MATRIX (Single-Factor Perturbations)")
    print("-" * 80)
    expected_str_labels = ["fake" if l == 1 else "real" for l in labels]
    robustness_results = run_robustness_evaluation(
        files,
        expected_str_labels,
        threshold=DETECTION_THRESHOLD,
    )

    print(f"{'File':25s} | {'Transform':20s} | {'Score':7s} | {'Result':14s} | {'Status':12s}")
    print("-" * 80)
    for r in robustness_results:
        print(f"{r['file'][:25]:25s} | {r['transformation']:20s} | {r['raw_score']:7.3f} | {r['classification']:14s} | {r['status']:12s}")

    # Summary by transformation
    transforms = sorted(list(set(r["transformation"] for r in robustness_results)))
    print("\nRobustness Performance Summary by Condition:")
    for t in transforms:
        subset = [r for r in robustness_results if r["transformation"] == t]
        correct = sum(1 for r in subset if r["is_correct"])
        uncertain = sum(1 for r in subset if r["status"] == "UNCERTAIN")
        total = len(subset)
        print(f" - {t:22s}: Correct: {correct}/{total} ({correct/total*100:.0f}%) | Uncertain: {uncertain}/{total}")

    print("\n" + "=" * 80)
    print("EVALUATION & EXPERIMENT SUITE FINISHED SUCCESSFULLY")
    print("=" * 80)


if __name__ == "__main__":
    print_experiment_report()
