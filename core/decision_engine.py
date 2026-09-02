"""
Decision engine module.
Maps aggregate risk score, reliability score, and primary channel status into a final decision
(LOW, HIGH, or INCONCLUSIVE) and decision explanation note according to Section J.
"""
from typing import Optional, Tuple

from config import (
    HIGH_THRESHOLD,
    LOW_THRESHOLD,
    BOUNDARY_MARGIN,
    RELIABILITY_FLOOR,
)


def decide(
    risk_score: Optional[float],
    reliability_score: float,
    member1_status: str = "ok",
) -> Tuple[str, Optional[str]]:
    """
    Evaluates final decision (LOW, HIGH, INCONCLUSIVE) and decision note.
    Evaluation order follows Section J strictly.

    Args:
        risk_score: Aggregate risk score (0.0-100.0) or None if no channels available.
        reliability_score: Evidence reliability score (0.0-100.0).
        member1_status: Status string of Member 1 adapter ("ok", "error", etc.).

    Returns:
        Tuple[str, Optional[str]]: (decision, decision_note)
            decision: "LOW" | "HIGH" | "INCONCLUSIVE"
            decision_note: String explaining reason for INCONCLUSIVE, or None for HIGH/LOW.
    """
    # Rule 1: No evidence channels available
    if risk_score is None:
        return "INCONCLUSIVE", "No evidence channels were available."

    # Rule 2: Member 1 (primary evidence channel) unavailable
    if member1_status != "ok":
        return "INCONCLUSIVE", "Deepfake detection (primary evidence channel) unavailable."

    # Rule 3: Reliability score below floor threshold
    if reliability_score < RELIABILITY_FLOOR:
        return "INCONCLUSIVE", "Evidence reliability too low for an automated decision."

    # Rule 4: Boundary margin check (risk near HIGH_THRESHOLD or LOW_THRESHOLD)
    if (
        abs(risk_score - HIGH_THRESHOLD) <= BOUNDARY_MARGIN
        or abs(risk_score - LOW_THRESHOLD) <= BOUNDARY_MARGIN
    ):
        return "INCONCLUSIVE", "Risk score falls within the decision boundary margin."

    # Rule 5: Clear HIGH risk
    if risk_score >= HIGH_THRESHOLD:
        return "HIGH", None

    # Rule 6: Clear LOW risk
    if risk_score <= LOW_THRESHOLD:
        return "LOW", None

    # Rule 7: Ambiguous mid-range
    return "INCONCLUSIVE", "Risk score falls in the ambiguous mid-range."


def is_human_review_required(decision: str) -> bool:
    """
    Determines whether human review is required based on final decision.
    Section J rule: human_review_required is True for HIGH and INCONCLUSIVE, False only for LOW.
    """
    return decision != "LOW"
