"""
FastAPI application layer for EchoForge Member 4 Backend.
Exposes /health and /analyze HTTP REST endpoints.
Delegates file staging to api.file_handling and core logic orchestration to core.pipeline.
"""
import uuid
import logging
from typing import Optional
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from api.schemas import HealthResponse, AnalyzeResponse, RiskBreakdown, EvidenceBlock
from api.file_handling import staged_audio_files
from core.pipeline import run_pipeline

logger = logging.getLogger("echoforge.api")

app = FastAPI(
    title="EchoForge Backend API",
    description="Multi-modal Audio Deepfake Detection & Risk Aggregation Engine",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    """Returns application health status."""
    return HealthResponse(
        status="ok",
        modules={
            "member1": "ok",
            "member2": "ok",
            "member3": "ok",
        },
    )


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze_audio(
    audio: UploadFile = File(...),
    reference_audio: Optional[UploadFile] = File(None),
) -> AnalyzeResponse:
    """
    Analyzes primary uploaded audio (and optional speaker reference audio) for synthetic manipulation,
    speaker mismatch, and contextual suspicion risk.
    """
    request_id = uuid.uuid4().hex

    with staged_audio_files(audio, reference_audio) as (staged_audio_path, staged_ref_path):
        try:
            analysis_result = run_pipeline(
                audio_path=staged_audio_path,
                reference_audio_path=staged_ref_path,
                request_id=request_id,
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Pipeline execution failed for request {request_id}: {e}", exc_info=True)
            raise HTTPException(
                status_code=500,
                detail="An internal server error occurred while processing the audio analysis.",
            )

        # Map internal AnalysisResult dataclass to AnalyzeResponse Pydantic schema
        evidence_dict = {}
        if analysis_result.evidence:
            for k, adapter_res in analysis_result.evidence.items():
                evidence_dict[k] = EvidenceBlock(
                    status=adapter_res.status,
                    raw=adapter_res.data,
                )

        return AnalyzeResponse(
            request_id=analysis_result.request_id,
            decision=analysis_result.decision,
            risk_score=analysis_result.risk_score,
            reliability_score=analysis_result.reliability_score,
            human_review_required=analysis_result.human_review_required,
            reasons=analysis_result.reasons,
            warnings=analysis_result.warnings,
            risk_breakdown=RiskBreakdown(
                deepfake_risk=analysis_result.risk_breakdown.deepfake_risk,
                speaker_mismatch_risk=analysis_result.risk_breakdown.speaker_mismatch_risk,
                context_risk=analysis_result.risk_breakdown.context_risk,
            ),
            evidence=evidence_dict,
        )

