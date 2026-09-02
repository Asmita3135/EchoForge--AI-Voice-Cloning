"""
Normalization module.
Transforms raw module scores into uniform 0-100 risk scores (0 = low risk, 100 = high risk).
Preserves missing/unavailable evidence channels as None (never coercing to 0.0).
"""
import math
from typing import Optional

from config import SPEAKER_SAME_T, SPEAKER_DIFF_T
from adapters.result import AdapterResult
from core.models import NormalizedRisk


def deepfake_score_to_risk(raw_score: float) -> float:
    """
    Converts Member 1 raw_score (P(fake), 0.0-1.0) to 0-100 deepfake risk.
    Higher raw_score -> higher risk (already risk-aligned).
    """
    if not isinstance(raw_score, (int, float)) or not math.isfinite(raw_score):
        raise ValueError(f"Invalid raw_score: {raw_score}")
    score = float(raw_score)
    score = max(0.0, min(1.0, score))
    return score * 100.0


def speaker_similarity_to_risk(similarity: float) -> float:
    """
    Converts Member 2 cosine similarity (~0.0-1.0) to 0-100 speaker mismatch risk.
    Higher similarity -> lower risk (requires inversion).
    Anchored to Member 2's actual code thresholds:
      similarity >= 0.65 -> SAME SPEAKER (risk <= 20.0)
      similarity <= 0.55 -> DIFFERENT SPEAKER (risk >= 70.0)
      0.55 < similarity < 0.65 -> UNCERTAIN (risk 20.0 to 60.0)
    """
    if not isinstance(similarity, (int, float)) or not math.isfinite(similarity):
        raise ValueError(f"Invalid similarity: {similarity}")

    sim = float(similarity)

    if sim >= SPEAKER_SAME_T:
        frac = (sim - SPEAKER_SAME_T) / (1.0 - SPEAKER_SAME_T) if SPEAKER_SAME_T < 1.0 else 0.0
        return max(0.0, 20.0 - 20.0 * frac)
    if sim <= SPEAKER_DIFF_T:
        frac = sim / SPEAKER_DIFF_T if SPEAKER_DIFF_T > 0 else 0.0
        return max(70.0, min(100.0, 100.0 - 30.0 * frac))

    frac = (sim - SPEAKER_DIFF_T) / (SPEAKER_SAME_T - SPEAKER_DIFF_T)
    return 60.0 - 40.0 * frac


def context_score_to_risk(context_score: float) -> float:
    """
    Converts Member 3 context_score (0-100) to 0-100 context risk.
    Identity transform: score is already 0-100, higher = more suspicious.
    """
    if not isinstance(context_score, (int, float)) or not math.isfinite(context_score):
        raise ValueError(f"Invalid context_score: {context_score}")
    score = float(context_score)
    return max(0.0, min(100.0, score))


def normalize_adapter_results(
    m1: AdapterResult,
    m2: AdapterResult,
    m3: AdapterResult,
) -> NormalizedRisk:
    """
    Normalizes outputs from all 3 member adapters into a NormalizedRisk object.
    Preserves missing/unavailable evidence as None (never coercing to 0.0).
    """
    deepfake_risk: Optional[float] = None
    speaker_mismatch_risk: Optional[float] = None
    context_risk: Optional[float] = None

    if m1.status == "ok" and m1.data and "raw_score" in m1.data and "error" not in m1.data:
        try:
            deepfake_risk = deepfake_score_to_risk(m1.data["raw_score"])
        except ValueError:
            deepfake_risk = None

    if m2.status == "ok" and m2.data and "similarity" in m2.data:
        try:
            speaker_mismatch_risk = speaker_similarity_to_risk(m2.data["similarity"])
        except ValueError:
            speaker_mismatch_risk = None

    if m3.status == "ok" and m3.data and "context_score" in m3.data:
        try:
            context_risk = context_score_to_risk(m3.data["context_score"])
        except ValueError:
            context_risk = None

    return NormalizedRisk(
        deepfake_risk=deepfake_risk,
        speaker_mismatch_risk=speaker_mismatch_risk,
        context_risk=context_risk,
    )


# Alias for pipeline usage
build = normalize_adapter_results
