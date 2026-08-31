"""
Pydantic schemas for API request and response validation.
"""
from typing import Literal, Optional, Any
from pydantic import BaseModel, Field


class EvidenceBlock(BaseModel):
    status: Literal["ok", "error", "skipped"]
    raw: Optional[dict[str, Any]] = None


class RiskBreakdown(BaseModel):
    deepfake_risk: Optional[float] = None
    speaker_mismatch_risk: Optional[float] = None
    context_risk: Optional[float] = None


class AnalyzeResponse(BaseModel):
    request_id: str
    decision: Literal["LOW", "HIGH", "INCONCLUSIVE"]
    risk_score: Optional[float] = None
    reliability_score: float
    human_review_required: bool
    reasons: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    risk_breakdown: RiskBreakdown
    evidence: dict[str, EvidenceBlock]


class HealthResponse(BaseModel):
    status: str = "ok"
    modules: dict[str, str] = Field(default_factory=lambda: {"member1": "ok", "member2": "ok", "member3": "ok"})
