"""
Explainability engine module.
Generates human-readable evidence-backed reasons and warnings according to Section K.
Reuses existing calculated values, thresholds, and Member 3 output strings.
"""
from typing import Optional, Tuple, List
from config import HIGH_THRESHOLD, LOW_THRESHOLD, RELIABILITY_FLOOR
from adapters.result import AdapterResult
from core.models import NormalizedRisk


def build_explainability(
    risks: NormalizedRisk,
    member1_result: AdapterResult,
    member2_result: AdapterResult,
    member3_result: AdapterResult,
    reliability_score: float,
    decision_note: Optional[str] = None,
) -> Tuple[List[str], List[str]]:
    """
    Generates evidence-backed reasons and warnings for the pipeline decision.

    Args:
        risks: NormalizedRisk object with deepfake_risk, speaker_mismatch_risk, context_risk.
        member1_result: AdapterResult from Member 1.
        member2_result: AdapterResult from Member 2.
        member3_result: AdapterResult from Member 3.
        reliability_score: Overall evidence reliability score (0-100).
        decision_note: Optional decision explanation note from Decision Engine.

    Returns:
        Tuple[List[str], List[str]]: (reasons[], warnings[])
    """
    reasons: List[str] = []
    warnings: List[str] = []

    # =========================================================================
    # 1. DECISION NOTE & CORE WARNINGS
    # =========================================================================
    if decision_note:
        warnings.append(decision_note)

    if member2_result.status == "skipped":
        warnings.append("Speaker verification skipped: no reference audio was provided.")

    if (
        member1_result.status == "error"
        or member2_result.status == "error"
        or member3_result.status == "error"
    ):
        warnings.append("One or more analysis modules failed; result is based on partial evidence.")

    if reliability_score < RELIABILITY_FLOOR:
        warnings.append("Overall evidence reliability is low; treat this result as provisional.")

    # Audio quality warnings from Member 1 diagnostics
    if member1_result.status == "ok" and member1_result.data:
        diag = member1_result.data.get("diagnostics", {})
        if diag.get("clipping_detected", False):
            warnings.append("Audio clipping detected in primary input.")
        if not diag.get("sufficient_duration", True):
            warnings.append("Audio duration is below minimum recommended length.")

    # =========================================================================
    # 2. EVIDENCE REASONS
    # =========================================================================
    # Member 1 — Deepfake risk reasons
    if risks.deepfake_risk is not None:
        m1_raw_score = None
        if member1_result.data and "raw_score" in member1_result.data:
            m1_raw_score = member1_result.data["raw_score"]

        if risks.deepfake_risk >= HIGH_THRESHOLD:
            if m1_raw_score is not None:
                reasons.append(f"High synthetic-voice probability ({m1_raw_score:.2f}).")
            else:
                reasons.append("High synthetic-voice probability.")
        elif risks.deepfake_risk <= LOW_THRESHOLD:
            if m1_raw_score is not None:
                reasons.append(f"High genuine-voice probability (raw score {m1_raw_score:.2f}).")
            else:
                reasons.append("High genuine-voice probability.")

    # Member 2 — Speaker mismatch risk reasons
    if risks.speaker_mismatch_risk is not None:
        if risks.speaker_mismatch_risk >= HIGH_THRESHOLD:
            reasons.append("Voice does not match the claimed reference speaker.")
        elif risks.speaker_mismatch_risk <= LOW_THRESHOLD:
            reasons.append("Voice matches the claimed reference speaker.")

    # Member 3 — Context risk reasons (reuses Member 3's own reasons)
    if risks.context_risk is not None:
        if risks.context_risk >= 30.0:
            m3_reasons = []
            if member3_result.data and "reasons" in member3_result.data:
                m3_reasons = member3_result.data["reasons"]

            if m3_reasons:
                for r in m3_reasons:
                    if r not in reasons:
                        reasons.append(r)
            else:
                reasons.append("Suspicious language or context phrases detected.")
        elif risks.context_risk == 0.0:
            reasons.append("No suspicious context or keywords detected.")

    # =========================================================================
    # 3. CONFLICTING EVIDENCE DETECTION
    # =========================================================================
    if (
        risks.deepfake_risk is not None
        and risks.speaker_mismatch_risk is not None
    ):
        if risks.deepfake_risk <= LOW_THRESHOLD and risks.speaker_mismatch_risk >= HIGH_THRESHOLD:
            reasons.append(
                "Conflicting evidence: Voice appears genuine but does not match the reference speaker."
            )
        elif risks.deepfake_risk >= HIGH_THRESHOLD and risks.speaker_mismatch_risk <= LOW_THRESHOLD:
            reasons.append(
                "Conflicting evidence: High synthetic voice probability despite speaker verification match."
            )

    return reasons, warnings


# Alias for pipeline usage
build = build_explainability
generate_explanation = build_explainability
