"""
Core pipeline orchestrator module for EchoForge Member 4.
Orchestrates Member 1-3 adapter execution, risk normalization, reliability assessment,
weighted risk aggregation, decision evaluation, and explainability generation.
"""
import uuid
from typing import Optional

from adapters.result import AdapterResult
from adapters import member1_adapter, member2_adapter, member3_adapter
from core.models import NormalizedRisk, AnalysisResult
from core.normalization import normalize_adapter_results
from core.reliability import compute_reliability
from core.risk_engine import aggregate_risk
from core.decision_engine import decide, is_human_review_required
from core.explainability import build_explainability


def run_pipeline(
    audio_path: str,
    reference_audio_path: Optional[str] = None,
    request_id: Optional[str] = None,
) -> AnalysisResult:
    """
    Executes the end-to-end EchoForge Member 4 analysis pipeline.

    Args:
        audio_path: Path to the primary input audio file.
        reference_audio_path: Optional path to claimed speaker reference audio.
        request_id: Optional tracking identifier. Auto-generated if None.

    Returns:
        AnalysisResult: Complete structured analysis output.
    """
    if not request_id:
        request_id = uuid.uuid4().hex

    # =========================================================================
    # 1. ADAPTER EXECUTION WITH EXCEPTION ISOLATION
    # =========================================================================
    try:
        m1_res = member1_adapter.run(audio_path, return_details=True)
    except Exception as e:
        m1_res = AdapterResult(
            status="error",
            error_message=f"Member 1 adapter raised unexpected exception: {e}",
        )

    try:
        m2_res = member2_adapter.run(reference_audio_path, audio_path)
    except Exception as e:
        m2_res = AdapterResult(
            status="error",
            error_message=f"Member 2 adapter raised unexpected exception: {e}",
        )

    try:
        m3_res = member3_adapter.run(audio_path)
    except Exception as e:
        m3_res = AdapterResult(
            status="error",
            error_message=f"Member 3 adapter raised unexpected exception: {e}",
        )

    # =========================================================================
    # 2. RISK NORMALIZATION (0-100 SCALE)
    # =========================================================================
    risks: NormalizedRisk = normalize_adapter_results(m1_res, m2_res, m3_res)

    # =========================================================================
    # 3. RELIABILITY ASSESSMENT (0-100 SCALE)
    # =========================================================================
    reliability_score, _ = compute_reliability(m1_res, m2_res, m3_res)

    # =========================================================================
    # 4. WEIGHTED RISK AGGREGATION
    # =========================================================================
    risk_score: Optional[float] = aggregate_risk(risks)

    # =========================================================================
    # 5. DECISION ENGINE EVALUATION
    # =========================================================================
    decision, decision_note = decide(
        risk_score=risk_score,
        reliability_score=reliability_score,
        member1_status=m1_res.status,
    )
    human_review: bool = is_human_review_required(decision)

    # =========================================================================
    # 6. EXPLAINABILITY GENERATION
    # =========================================================================
    reasons, warnings = build_explainability(
        risks=risks,
        member1_result=m1_res,
        member2_result=m2_res,
        member3_result=m3_res,
        reliability_score=reliability_score,
        decision_note=decision_note,
    )

    # =========================================================================
    # 7. FINAL ANALYSIS RESULT ASSEMBLY
    # =========================================================================
    return AnalysisResult(
        request_id=request_id,
        decision=decision,
        risk_score=risk_score,
        reliability_score=reliability_score,
        human_review_required=human_review,
        reasons=reasons,
        warnings=warnings,
        risk_breakdown=risks,
        evidence={
            "member1": m1_res,
            "member2": m2_res,
            "member3": m3_res,
        },
    )


# Alias for pipeline execution
analyze = run_pipeline
