"""
EchoForge — Member 1 Track A Model Backend
Encapsulates Gustking/wav2vec2-large-xlsr-deepfake-audio-classification
Provides whole-audio inference, logit extraction, and representation inspection.
"""

import os
import torch
import numpy as np
from transformers import AutoModelForAudioClassification, AutoFeatureExtractor
from config import MODEL_NAME, MODEL_SAMPLE_RATE


class Wav2Vec2DeepfakeDetector:
    """
    Track A Pretrained Deepfake Audio Detector Backend.
    Uses Gustking/wav2vec2-large-xlsr-deepfake-audio-classification.
    Processes audio as a whole without chunk segmentation.
    """

    def __init__(self, model_name: str = MODEL_NAME, device: str = None):
        self.model_name = model_name
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")

        # Load Feature Extractor and Pretrained Sequence Classification Model
        self.feature_extractor = AutoFeatureExtractor.from_pretrained(self.model_name)
        self.model = AutoModelForAudioClassification.from_pretrained(self.model_name)
        self.model.to(self.device)
        self.model.eval()

        # Verify and record label mapping programmatically from model config
        self.id2label = self.model.config.id2label or {0: "real", 1: "fake"}
        self.label2id = self.model.config.label2id or {"real": 0, "fake": 1}

        # Identify fake class index (supports 'fake', 'spoof', 'synthetic')
        self.fake_class_id = 1
        for idx, label in self.id2label.items():
            if str(label).lower() in ["fake", "spoof", "synthetic", "1"]:
                self.fake_class_id = int(idx)
                break

        # Identify real class index (supports 'real', 'bonafide', 'authentic')
        self.real_class_id = 0
        for idx, label in self.id2label.items():
            if str(label).lower() in ["real", "bonafide", "authentic", "0"]:
                self.real_class_id = int(idx)
                break

        # Record internal architectural properties for explainability / diagnostics
        self.hidden_size = self.model.config.hidden_size  # 1024
        self.projector_dim = getattr(self.model.config, "classifier_proj_size", 256)

    def forward(self, audio_waveform: np.ndarray, return_representations: bool = False) -> dict:
        """
        Executes a single whole-audio forward pass through the model.

        Args:
            audio_waveform: 1D numpy array of 16kHz float32 audio samples.
            return_representations: whether to return internal hidden representations.

        Returns:
            dict containing:
                - logits: list of 2 float logits [real_logit, fake_logit]
                - raw_score: float in [0.0, 1.0], softmax probability of class 1 (fake/spoof)
                - real_score: float in [0.0, 1.0], softmax probability of class 0 (real/bonafide)
                - representation: dict with pooled & frame representations (if return_representations=True)
        """
        if isinstance(audio_waveform, torch.Tensor):
            audio_np = audio_waveform.cpu().numpy()
        else:
            audio_np = audio_waveform

        # Prepare inputs via HuggingFace feature extractor (applies proper layer-norm)
        inputs = self.feature_extractor(
            audio_np,
            sampling_rate=MODEL_SAMPLE_RATE,
            return_tensors="pt",
        )

        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        with torch.no_grad():
            outputs = self.model(**inputs, output_hidden_states=return_representations)
            logits = outputs.logits  # shape [1, 2]
            probs = torch.softmax(logits, dim=-1)[0]

            fake_score = float(probs[self.fake_class_id].item())
            real_score = float(probs[self.real_class_id].item())

        result = {
            "logits": [float(l) for l in logits[0].cpu().numpy()],
            "raw_score": round(fake_score, 4),
            "real_score": round(real_score, 4),
            "fake_class_id": self.fake_class_id,
            "real_class_id": self.real_class_id,
        }

        if return_representations:
            # Extract internal learned representations exposed by the model architecture:
            # 1. outputs.hidden_states[-1]: frame-level transformer representations [1, T, 1024]
            # 2. Pooled representation passing through projector [1, 256]
            with torch.no_grad():
                last_hidden = outputs.hidden_states[-1]  # [1, T, 1024]
                projected = self.model.projector(last_hidden)  # [1, T, 256]
                pooled = projected.mean(dim=1)  # [1, 256]

            result["representations"] = {
                "frame_representation_shape": list(last_hidden.shape),
                "pooled_representation_dim": pooled.shape[-1],
                "pooled_representation_vector": [round(float(v), 5) for v in pooled[0].cpu().numpy()[:16]],  # first 16 for inspection
            }

        return result


# Singleton detector instance for efficient reuse across calls
_detector_instance = None


def get_detector(model_name: str = MODEL_NAME) -> Wav2Vec2DeepfakeDetector:
    """Returns the singleton instance of Wav2Vec2DeepfakeDetector."""
    global _detector_instance
    if _detector_instance is None or _detector_instance.model_name != model_name:
        _detector_instance = Wav2Vec2DeepfakeDetector(model_name=model_name)
    return _detector_instance
