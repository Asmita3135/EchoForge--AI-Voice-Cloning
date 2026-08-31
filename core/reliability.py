"""
Reliability engine module.
Computes an independent 0-100 evidence trust score and reliability reasons based on Section H.
Does not measure risk direction — measures evidence quality, completeness, and confidence.
"""
import math

from config import (
    RELIABILITY_MEMBER1_AVAIL,
    RELIABILITY_MEMBER3_AVAIL,
    RELIABILITY_MEMBER2_AVAIL,
    RELIABILITY_MEMBER2_SKIPPED_CAP,
    RELIABILITY_DURATION_PTS,
    RELIABILITY_NO_CLIPPING_PTS,
    RELIABILITY_NOT_SILENT_PTS,
    RELIABILITY_SNR_MAX_PTS,
    RELIABILITY_SNR_THRESHOLD_DB,
    RELIABILITY_M1_CONF_HIGH_PTS,
    RELIABILITY_M1_CONF_MOD_PTS,
    RELIABILITY_M1_CONF_LOW_PTS,
    RELIABILITY_UNCERTAINTY_FLAG_PENALTY,
    RELIABILITY_MAX_UNCERTAINTY_PENALTY,
)
from adapters.result import AdapterResult


def compute_reliability(
    member1_result: AdapterResult,
    member2_result: AdapterResult,
    member3_result: AdapterResult,
) -> tuple[float, list[str]]:
    """
    Computes evidence reliability score (0-100) and reliability reasons/warnings.

    Args:
        member1_result: AdapterResult from Member 1 (deepfake detector)
        member2_result: AdapterResult from Member 2 (speaker verification)
        member3_result: AdapterResult from Member 3 (context analyzer)

    Returns:
        tuple[float, list[str]]: (reliability_score, reliability_reasons)
    """
    reasons: list[str] = []

    # =========================================================================
    # 1. AVAILABILITY SECTION (40 points max)
    # =========================================================================
    avail_score = 0.0

    # Member 1 availability check
    m1_available = False
    if member1_result.status == "ok" and member1_result.data and "error" not in member1_result.data:
        diag = member1_result.data.get("diagnostics", {})
        if diag.get("audio_valid", True):
            avail_score += RELIABILITY_MEMBER1_AVAIL
            m1_available = True
    if not m1_available:
        reasons.append("Primary deepfake detection evidence unavailable or audio invalid.")

    # Member 3 availability check
    m3_available = False
    if member3_result.status == "ok" and member3_result.data and "error" not in member3_result.data:
        transcript = member3_result.data.get("transcript", "")
        if isinstance(transcript, str) and transcript.strip():
            avail_score += RELIABILITY_MEMBER3_AVAIL
            m3_available = True
        elif "context_score" in member3_result.data:
            # Valid result returned even if empty transcript
            avail_score += RELIABILITY_MEMBER3_AVAIL
            m3_available = True
    if not m3_available:
        reasons.append("Transcription and context analysis evidence unavailable.")

    # Member 2 availability check
    m2_available = False
    if member2_result.status == "ok" and member2_result.data and "error" not in member2_result.data:
        avail_score += RELIABILITY_MEMBER2_AVAIL
        m2_available = True
    elif member2_result.status == "skipped":
        # Member 2 skipped cap applies to availability ceiling
        avail_score = min(avail_score, RELIABILITY_MEMBER2_SKIPPED_CAP)
        reasons.append("Speaker verification skipped (no reference audio provided).")
    else:
        reasons.append("Speaker verification module unavailable or failed.")

    avail_score = min(40.0, avail_score)

    # =========================================================================
    # 2. AUDIO QUALITY SECTION (35 points max)
    # =========================================================================
    quality_score = 0.0

    if m1_available and member1_result.data:
        diag = member1_result.data.get("diagnostics", {})
        ext_diag = member1_result.data.get("extended_diagnostics", {})

        # Sufficient duration check (+10)
        if diag.get("sufficient_duration", False):
            quality_score += RELIABILITY_DURATION_PTS
        else:
            reasons.append("Audio duration is below minimum reliable threshold.")

        # Clipping check (+8)
        if not diag.get("clipping_detected", True):
            quality_score += RELIABILITY_NO_CLIPPING_PTS
        else:
            reasons.append("Audio clipping/distortion detected.")

        # Silence check (+7)
        if not diag.get("mostly_silent", True):
            quality_score += RELIABILITY_NOT_SILENT_PTS
        else:
            reasons.append("Audio input is mostly silent.")

        # SNR estimate check (+10 max)
        snr_val = ext_diag.get("snr_estimate_db") if ext_diag else diag.get("snr_estimate_db")
        if isinstance(snr_val, (int, float)) and math.isfinite(snr_val):
            snr_float = float(snr_val)
            if snr_float > 0:
                snr_ratio = min(1.0, snr_float / RELIABILITY_SNR_THRESHOLD_DB)
                snr_pts = snr_ratio * RELIABILITY_SNR_MAX_PTS
                quality_score += snr_pts
            if snr_float < 5.0:
                reasons.append(f"Low signal-to-noise ratio ({snr_float:.1f} dB).")
    else:
        reasons.append("Audio quality diagnostics unavailable.")

    quality_score = min(35.0, quality_score)

    # =========================================================================
    # 3. DECISION CONFIDENCE & UNCERTAINTY SECTION (25 points max base, penalties apply)
    # =========================================================================
    confidence_score = 0.0

    if m1_available and member1_result.data:
        conf_str = str(member1_result.data.get("confidence", "")).upper()
        if conf_str == "HIGH":
            confidence_score += RELIABILITY_M1_CONF_HIGH_PTS
        elif conf_str == "MODERATE":
            confidence_score += RELIABILITY_M1_CONF_MOD_PTS
        else:
            confidence_score += RELIABILITY_M1_CONF_LOW_PTS

    # Uncertainty penalties (-10 per flagged channel, max -25)
    uncertainty_count = 0

    # Member 1 uncertainty flag check
    if m1_available and member1_result.data:
        classification = str(member1_result.data.get("classification", "")).upper()
        predicted_label = str(member1_result.data.get("predicted_label", "")).lower()
        if classification == "UNCERTAIN" or predicted_label == "uncertain":
            uncertainty_count += 1
            reasons.append("Deepfake detector score fell within uncertainty boundary.")

    # Member 2 uncertainty flag check
    if m2_available and member2_result.data:
        m2_decision = str(member2_result.data.get("decision", "")).upper()
        if m2_decision == "UNCERTAIN":
            uncertainty_count += 1
            reasons.append("Speaker verification score fell within uncertainty boundary.")

    uncertainty_penalty = max(
        RELIABILITY_MAX_UNCERTAINTY_PENALTY,
        uncertainty_count * RELIABILITY_UNCERTAINTY_FLAG_PENALTY,
    )

    total_confidence = confidence_score + uncertainty_penalty

    # =========================================================================
    # 4. AGGREGATE SCORE & BOUNDING (0 <= score <= 100)
    # =========================================================================
    raw_total = avail_score + quality_score + total_confidence
    final_score = round(max(0.0, min(100.0, raw_total)), 2)

    return final_score, reasons
