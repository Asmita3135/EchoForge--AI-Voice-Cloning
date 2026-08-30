# EchoForge — Member 1: AI / Deepfake Voice Detection

## Overview

**EchoForge** is a cybersecurity-focused AI voice authenticity screening system.

This branch implements **Member 1's responsibility**:

> Detect whether a supplied audio recording is consistent with genuine human speech or AI-generated / synthetic / cloned speech.

The detector produces one of three outcomes:

- `GENUINE`
- `AI-GENERATED`
- `UNCERTAIN`

The system is designed for **screening and risk-aware detection**, not forensic proof of authenticity.

---

## Member 1 Scope

### Included

- AI-generated / synthetic speech detection
- Whole-audio inference
- Pretrained Wav2Vec2 deepfake detection model
- Conservative audio standardization
- Deterministic audio quality diagnostics
- Configurable detection threshold
- Minimum-duration policy
- Uncertainty handling
- Stable JSON output
- Validation metrics
- Robustness experiments
- Failure analysis and logging

### Explicitly Out of Scope

- Speaker verification
- Speaker identification
- Speaker identity embeddings
- Cosine similarity
- Speech-to-text
- Grammar checking
- Content analysis
- Risk scoring
- Frontend redesign
- Custom deepfake model training
- Model ensembles
- NII AntiDeepfake / Track B
- Chunk-based detection
- VAD-based segmentation

---

# Architecture

The active MVP uses a **Track-A-only whole-audio architecture**.

```text
Audio Input
     ↓
Input Validation
     ↓
Conservative Audio Standardization
     ↓
Basic Audio Diagnostics
     ↓
Duration / Sufficiency Check
     ↓
Wav2Vec2 XLS-R Encoder
     ↓
Learned Audio Representation
     ↓
Projection Layer
     ↓
Time-Mean Pooling
     ↓
256-D Internal Representation
     ↓
Classification Head
     ↓
Real / Fake Logits
     ↓
Fake-Class Raw Score
     ↓
Threshold + Uncertainty Logic
     ↓
GENUINE / AI-GENERATED / UNCERTAIN
     ↓
JSON Result