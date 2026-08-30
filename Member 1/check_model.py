"""
EchoForge — Member 1 Verification & Sanity Check Script
Tests environment, Track A model, label mappings, whole-audio inference, and JSON schema.
"""

import sys
import os
import json
import torch
import numpy as np

print("=" * 75)
print("1. ENVIRONMENT & DEPENDENCY VALIDATION:")
print(f"   Python:          {sys.version.split()[0]} ({sys.platform})")
print(f"   torch:           {torch.__version__} (CUDA available: {torch.cuda.is_available()})")

import torchaudio
import soundfile as sf
import librosa
import transformers

print(f"   torchaudio:      {torchaudio.__version__}")
print(f"   transformers:    {transformers.__version__}")
print(f"   soundfile:       {sf.__version__}")
print(f"   librosa:         {librosa.__version__}")

print("\n2. MODULE IMPORT VALIDATION:")
import config
from audio.preprocessing import load_and_standardize_audio
from audio.diagnostics import compute_audio_diagnostics
from model.detector import Wav2Vec2DeepfakeDetector, get_detector
from inference.pipeline import analyze_audio
from inference.scoring import evaluate_decision
from evaluation.metrics import compute_classification_metrics
from evaluation.robustness_tests import generate_perturbations, run_robustness_evaluation
print("   All EchoForge Member 1 modular packages imported successfully.")

print("\n3. TRACK A MODEL & ARCHITECTURE VALIDATION:")
detector = get_detector(config.MODEL_NAME)
total_params = sum(p.numel() for p in detector.model.parameters())
trainable_params = sum(p.numel() for p in detector.model.parameters() if p.requires_grad)

print(f"   Model Name:          {detector.model_name}")
print(f"   Model Class:         {detector.model.__class__.__name__}")
print(f"   Total Parameters:    {total_params:,}")
print(f"   Trainable Params:    {trainable_params:,}")
print(f"   Device Placement:    {detector.device}")
print(f"   Eval Mode:           {not detector.model.training}")
print(f"   id2label:            {detector.id2label}")
print(f"   label2id:            {detector.label2id}")
print(f"   Real Class ID:       {detector.real_class_id} ({detector.id2label.get(detector.real_class_id, 'N/A')})")
print(f"   Fake Class ID:       {detector.fake_class_id} ({detector.id2label.get(detector.fake_class_id, 'N/A')})")

print("\n4. WHOLE-AUDIO INFERENCE & REPRESENTATION EXTRACTION TEST:")
dummy_wav = np.random.randn(16000 * 4).astype(np.float32)  # 4 seconds
out = detector.forward(dummy_wav, return_representations=True)

print(f"   - Logits:                    {out['logits']}")
print(f"   - Raw Score (Fake Prob):     {out['raw_score']}")
print(f"   - Real Score (Real Prob):    {out['real_score']}")
print(f"   - Frame Representation:      {out['representations']['frame_representation_shape']}")
print(f"   - Pooled Representation Dim: {out['representations']['pooled_representation_dim']}")

print("\n5. END-TO-END JSON SCHEMA VALIDATION:")
test_file = "audio/synthetic_tts_1.wav" if os.path.exists("audio/synthetic_tts_1.wav") else "audio/dummy_test.wav"
res = analyze_audio(test_file, return_details=False)
print("   Generated JSON Output:")
print(json.dumps(res, indent=2))

# Verify schema keys
expected_keys = ["model", "classification", "predicted_label", "raw_score", "threshold", "confidence", "sample_rate_used", "duration_sec", "diagnostics"]
missing = [k for k in expected_keys if k not in res]
assert len(missing) == 0, f"Missing JSON keys: {missing}"
assert res["classification"] in ["GENUINE", "AI-GENERATED", "UNCERTAIN"]
assert res["confidence"] in ["HIGH", "MODERATE", "LOW"]
print("   JSON Schema Verification: PASSED [OK]")

print("\n6. SHORT DURATION (<3s) UNCERTAINTY GATE TEST:")
short_wav = np.random.randn(16000 * 2).astype(np.float32)  # 2.0s < 3.0s threshold
temp_short = "output/temp_short.wav"
os.makedirs("output", exist_ok=True)
sf.write(temp_short, short_wav, 16000)
short_res = analyze_audio(temp_short, min_duration=3.0)
print(f"   Short audio (2.0s) classification: {short_res['classification']} (Sufficient duration: {short_res['diagnostics']['sufficient_duration']})")
assert short_res["classification"] == "UNCERTAIN", "Short audio did not trigger UNCERTAIN classification!"
print("   Duration Policy Verification: PASSED [OK]")
if os.path.exists(temp_short):
    os.remove(temp_short)

print("\n" + "=" * 75)
print("ALL ECHOFORGE MEMBER 1 SANITY CHECKS PASSED SUCCESSFULLY! [OK]")
print("=" * 75)
