"""
EchoForge — Member 1 AI/Deepfake Voice Detection Configuration
Centralized configuration parameters for Track A MVP.
"""

import os

# Model Configuration
MODEL_NAME = "Gustking/wav2vec2-large-xlsr-deepfake-audio-classification"
MODEL_BACKEND = "wav2vec2_deepfake"
MODEL_SAMPLE_RATE = 16000

# Decision & Duration Thresholds
# Configurable operating threshold for classifying AI-generated speech (Class 1 / Fake)
DETECTION_THRESHOLD = 0.50

# Minimum duration in seconds required for a confident detection
MIN_RELIABLE_DURATION_SEC = 3.0

# Margin around DETECTION_THRESHOLD where classification is considered UNCERTAIN
# [DETECTION_THRESHOLD - UNCERTAINTY_MARGIN, DETECTION_THRESHOLD + UNCERTAINTY_MARGIN]
UNCERTAINTY_MARGIN = 0.08

# Maximum recommended single-pass duration in seconds for CPU latency considerations
MAX_RECOMMENDED_DURATION_SEC = 60.0

# Label mappings (verified from model.config.id2label)
LABEL_ID_TO_NAME = {
    0: "real",
    1: "fake",
}

# Classification output constants
CLASS_GENUINE = "GENUINE"
CLASS_AI_GENERATED = "AI-GENERATED"
CLASS_UNCERTAIN = "UNCERTAIN"

# Confidence levels
CONF_HIGH = "HIGH"
CONF_MODERATE = "MODERATE"
CONF_LOW = "LOW"
