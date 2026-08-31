"""
Risk aggregation engine module.
Aggregates normalized channel risk scores using weighted averaging over available channels.
Missing channels (None) are excluded and remaining weights are renormalized.
If all channels are None, returns None.
"""
from typing import Optional, Union
from config import RISK_WEIGHTS
from core.models import NormalizedRisk


def aggregate_risk(
    risks: Union[NormalizedRisk, dict[str, Optional[float]]],
    weights: dict[str, float] = RISK_WEIGHTS,
) -> Optional[float]:
    """
    Calculates weighted average risk score (0-100) over available non-None channels.

    Args:
        risks: NormalizedRisk object or dictionary mapping channel names to float/None.
        weights: Dictionary mapping channel names to float weights (default: config.RISK_WEIGHTS).

    Returns:
        Optional[float]: Aggregate risk score (0.0 - 100.0), or None if no channels are available.
    """
    if isinstance(risks, NormalizedRisk):
        risk_dict = {
            "deepfake_risk": risks.deepfake_risk,
            "speaker_mismatch_risk": risks.speaker_mismatch_risk,
            "context_risk": risks.context_risk,
        }
    else:
        risk_dict = risks

    # Filter available (non-None) channels only
    available = {k: v for k, v in risk_dict.items() if v is not None and k in weights}

    if not available:
        return None

    total_weight = sum(weights[k] for k in available)
    if total_weight <= 0:
        return None

    weighted_sum = sum(weights[k] * float(v) for k, v in available.items()) # type: ignore
    raw_aggregate = weighted_sum / total_weight
    return round(max(0.0, min(100.0, raw_aggregate)), 2)
