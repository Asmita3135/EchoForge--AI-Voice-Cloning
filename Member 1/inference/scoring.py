"""
EchoForge — Member 1 Decision & Scoring Logic
Translates raw model scores and objective diagnostics into grounded classifications.
Supports GENUINE, AI-GENERATED, and UNCERTAIN decisions.
"""

from config import (
    DETECTION_THRESHOLD,
    MIN_RELIABLE_DURATION_SEC,
    UNCERTAINTY_MARGIN,
    CLASS_GENUINE,
    CLASS_AI_GENERATED,
    CLASS_UNCERTAIN,
    CONF_HIGH,
    CONF_MODERATE,
    CONF_LOW,
)


def evaluate_decision(
    raw_score: float,
    diagnostics: dict,
    threshold: float = DETECTION_THRESHOLD,
    min_duration: float = MIN_RELIABLE_DURATION_SEC,
    uncertainty_margin: float = UNCERTAINTY_MARGIN,
) -> dict:
    """
    Evaluates classification decision based on raw model score, threshold, and quality diagnostics.

    Decision Rules:
    1. If audio is invalid/empty -> UNCERTAIN (Low confidence)
    2. If duration < min_duration -> UNCERTAIN (Insufficient evidence)
    3. If |raw_score - threshold| <= uncertainty_margin -> UNCERTAIN (Boundary decision)
    4. If raw_score >= threshold -> AI-GENERATED (Predicted label: spoof)
    5. Else -> GENUINE (Predicted label: bonafide)

    Confidence Estimation:
    - HIGH: Clear margin from threshold (|score - threshold| >= 0.25) + clean diagnostics
    - MODERATE: Moderate margin (0.10 <= |score - threshold| < 0.25) or minor warnings
    - LOW: Near decision boundary or UNCERTAIN decision
    """
    duration_sec = diagnostics.get("duration_sec", 0.0)
    audio_valid = diagnostics.get("audio_valid", True)
    sufficient_duration = duration_sec >= min_duration
    clipping_detected = diagnostics.get("clipping_detected", False)
    mostly_silent = diagnostics.get("mostly_silent", False)

    uncertainty_reasons = []

    # Hard uncertainty gating
    if not audio_valid:
        classification = CLASS_UNCERTAIN
        predicted_label = "uncertain"
        confidence = CONF_LOW
        uncertainty_reasons.append("Audio is invalid or could not be processed.")
    elif not sufficient_duration:
        classification = CLASS_UNCERTAIN
        predicted_label = "uncertain"
        confidence = CONF_LOW
        uncertainty_reasons.append(f"Audio duration ({duration_sec:.2f}s) is below minimum reliable threshold ({min_duration:.1f}s).")
    elif mostly_silent:
        classification = CLASS_UNCERTAIN
        predicted_label = "uncertain"
        confidence = CONF_LOW
        uncertainty_reasons.append("Audio contains excessive silence / insufficient usable speech energy.")
    else:
        score_margin = abs(raw_score - threshold)

        if score_margin <= uncertainty_margin:
            classification = CLASS_UNCERTAIN
            predicted_label = "uncertain"
            confidence = CONF_LOW
            uncertainty_reasons.append(f"Model raw score ({raw_score:.3f}) falls within the uncertainty margin ({threshold:.2f} ± {uncertainty_margin:.2f}).")
        elif raw_score >= threshold:
            classification = CLASS_AI_GENERATED
            predicted_label = "spoof"
            confidence = CONF_HIGH if (score_margin >= 0.25 and not clipping_detected) else CONF_MODERATE
        else:
            classification = CLASS_GENUINE
            predicted_label = "bonafide"
            confidence = CONF_HIGH if (score_margin >= 0.25 and not clipping_detected) else CONF_MODERATE

    return {
        "classification": classification,
        "predicted_label": predicted_label,
        "confidence": confidence,
        "uncertainty_reasons": uncertainty_reasons,
    }
