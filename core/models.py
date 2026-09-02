"""
Data contracts for internal pipeline execution.
"""
from typing import Literal, Optional, Any
from dataclasses import dataclass
from adapters.result import AdapterResult


@dataclass
class NormalizedRisk:
    deepfake_risk: Optional[float] = None          # 0-100, None if member1 not "ok"
    speaker_mismatch_risk: Optional[float] = None  # 0-100, None if member2 not "ok"
    context_risk: Optional[float] = None           # 0-100, None if member3 not "ok"


@dataclass
class AnalysisResult:
    request_id: str
    decision: Literal["LOW", "HIGH", "INCONCLUSIVE"]
    risk_score: Optional[float]
    reliability_score: float
    human_review_required: bool
    reasons: list[str]
    warnings: list[str]
    risk_breakdown: NormalizedRisk
    evidence: dict[str, AdapterResult]
