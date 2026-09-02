# EchoForge ΓÇö Member 4 Final Antigravity Implementation Specification

**Document status:** Final. Based on a direct source-code audit of the real
Member 1, Member 2, and Member 3 repositories ΓÇö not on assumptions, not on
the conceptual team description alone.

**How to use this document (read this first, Antigravity):**
This is the complete specification for building **Member 4 only**
(backend, reliability, risk aggregation, decision engine, integration,
API). Members 1ΓÇô3 are complete and must not be redesigned. Follow the
milestones in Section Q in order. Do not skip ahead to FastAPI before the
core pipeline works and is tested. Where this document gives a concrete
number, threshold, or file path, that value was taken directly from the
real source code audited in Section B ΓÇö do not substitute a different
value without saying so and explaining why.

---

## THE 20 RULES (apply throughout every milestone)

1. Inspect before editing ΓÇö re-open the actual file before changing it, even if this document already describes it.
2. Never assume an interface ΓÇö if a function's real signature differs from what's written here, trust the code and flag the discrepancy.
3. Never rewrite a completed module unnecessarily.
4. Preserve Member 1ΓÇô3 behavior exactly except where Section D explicitly authorizes a change.
5. Make small, reviewable changes ΓÇö one milestone, one focused diff.
6. Test after every milestone before starting the next one.
7. Show changed files at the end of each milestone.
8. Explain why each change was made, in plain language.
9. Stop and ask/flag when actual code differs from this spec's assumptions ΓÇö do not silently paper over it.
10. Never silently modify model behavior (scoring, thresholds, class labels).
11. Never silently change an existing Member 1/2/3 threshold ΓÇö if a threshold looks wrong (see Section D), surface it, don't quietly "fix" it inside Member 4.
12. Never claim success without actually running the relevant test.
13. Keep Member 4 modular ΓÇö normalization, reliability, risk, decision, and explainability are separate files, each independently testable.
14. Keep the core pipeline runnable and testable without FastAPI.
15. Make uncertainty explicit in the data ΓÇö a missing module output is `None`, never `0`.
16. Prefer `INCONCLUSIVE` over unjustified `LOW`/`HIGH`.
17. Keep all thresholds/weights/margins in one config file ΓÇö no magic numbers inline.
18. Avoid magic numbers ΓÇö every number in code should trace to a named constant with a comment explaining where it comes from.
19. Keep the API response schema stable and documented in this spec.
20. Maintain a short, accurate README describing what Member 4 does and how to run it.

---

## A. Executive Summary

Member 4 is the **integration and decision layer** of EchoForge. It is not
an AI model. It takes the already-complete outputs of Member 1 (deepfake
detection), Member 2 (speaker verification), and Member 3 (transcription +
context analysis), and answers one question:

> Given everything these three modules found, and how much we should trust
> that evidence, is this audio **LOW**, **HIGH**, or **INCONCLUSIVE** risk ΓÇö
> and why?

Member 4's five jobs, in the order they execute:

1. **Integration** ΓÇö call Members 1ΓÇô3 through small adapters, without modifying their internals beyond one minimal, explicitly-scoped change to Member 2 (Section D).
2. **Normalization** ΓÇö convert three differently-scaled, differently-directioned scores into one consistent `0 = low risk, 100 = high risk` convention.
3. **Reliability** ΓÇö separately score how much to trust the evidence (audio quality, module confidence, missing/degraded modules) ΓÇö this is not the same number as risk.
4. **Risk aggregation + decision** ΓÇö combine normalized risk into one score, then apply a decision engine that defaults to `INCONCLUSIVE` whenever risk is high but reliability is low, or the evidence is too close to a boundary.
5. **Explainability + API** ΓÇö return a JSON response, over a FastAPI `POST /analyze` endpoint, whose `reasons` are always derived from real evidence fields, never hardcoded strings.

---

## B. Current Architecture (audit results ΓÇö ground truth)

### B.1 Member 1 ΓÇö Deepfake Voice Detection ΓÇö Γ£à COMPLETE, cleanly importable

- **Entry point:** `inference.pipeline.analyze_audio(audio_path, threshold=0.50, min_duration=3.0, uncertainty_margin=0.08, return_details=False) -> dict`
- This is a real, importable Python function. No CLI wrapper needed to use it.
- **Model:** `Gustking/wav2vec2-large-xlsr-deepfake-audio-classification` (HuggingFace `AutoModelForAudioClassification`), loaded once via `model.detector.get_detector()` (singleton pattern already implemented ΓÇö Member 4 does not need to add its own caching layer for this).
- **Confirmed thresholds (`config.py`):** `DETECTION_THRESHOLD = 0.50`, `MIN_RELIABLE_DURATION_SEC = 3.0`, `UNCERTAINTY_MARGIN = 0.08`.
- **Real return schema (standard mode):**

  ```json
  {
    "model": "Gustking/wav2vec2-large-xlsr-deepfake-audio-classification",
    "classification": "GENUINE | AI-GENERATED | UNCERTAIN",
    "predicted_label": "bonafide | spoof | uncertain",
    "raw_score": 0.0,
    "threshold": 0.50,
    "confidence": "HIGH | MODERATE | LOW",
    "sample_rate_used": 16000,
    "duration_sec": 0.0,
    "diagnostics": {
      "audio_valid": true,
      "sufficient_duration": true,
      "clipping_detected": false,
      "mostly_silent": false
    }
  }
  ```
- **With `return_details=True`** (Member 4 must always pass this), an `extended_diagnostics` block is added:
  `clipping_ratio`, `silence_ratio`, `speech_ratio`, `rms_amplitude`,
  `noise_floor`, `snr_estimate_db`, `warnings[]`, `uncertainty_reasons[]`,
  `original_audio_info`, `logits`. This is the **only** module that gives
  real acoustic-quality metrics, which is why the reliability engine
  (Section H) leans on it heavily.
- **Score direction:** `raw_score` = P(fake), 0ΓÇô1, **higher = more synthetic**. Already risk-aligned; no inversion needed.
- **Failure mode:** does **not** raise on missing/corrupt file ΓÇö returns a valid dict with `classification: "UNCERTAIN"`, `confidence: "LOW"`, plus a top-level `"error"` key. **Member 4's adapter must check for the presence of an `"error"` key**, not rely on a try/except to detect this case.
- **Out of scope, confirmed by Member 1's own README:** speaker verification, STT, content analysis, risk scoring, frontend. Member 4 must not duplicate any of this into Member 1's code.

### B.2 Member 2 ΓÇö Speaker Verification ΓÇö Γ£à COMPLETE logic, ΓÜá∩╕Å CLI-only wrapper

- **As shipped:** `verify_speaker.compare_speakers(reference_input, test_input)` only **prints** a formatted report and calls `sys.exit(1)` on any error path. It has no `return` statement ΓÇö callers get `None`. This is the single biggest integration gap in the project.
- **Model:** SpeechBrain `speechbrain/spkrec-ecapa-voxceleb` (ECAPA-TDNN), 192-dim speaker embeddings, cosine similarity.
- **Confirmed thresholds ΓÇö found in the actual code, `verify_speaker.py`:**
  ```python
  PROTOTYPE_THRESHOLD = 0.6000
  UNCERTAINTY_MARGIN = 0.0500
  # decision bands actually used:
  #   similarity >= 0.65  -> "SAME SPEAKER"
  #   similarity <= 0.55  -> "DIFFERENT SPEAKER"
  #   else                -> "UNCERTAIN"
  ```
  **Discrepancy found:** Member 2's own `README.md` documents `PROTOTYPE_THRESHOLD = 0.5000` and different testing guidance numbers (ΓëÑ0.55 "same", Γëñ0.45 "different"). The README is stale. **Member 4 must use the code's real values (0.60 ┬▒ 0.05), never the README's.** This should be reported back as a documentation bug in Member 2's repo, but Member 4's own config must not inherit the wrong number.
- **Score direction:** cosine similarity, roughly 0ΓÇô1, **higher = more likely genuine/same speaker** ΓÇö opposite of Member 4's risk convention, requires inversion (Section G).
- **Input shape is different from Members 1 and 3:** it needs **two** audio files ΓÇö `reference_input` (claimed speaker) and `test_input` (audio under investigation) ΓÇö not one. Member 4's API must treat reference audio as optional, and speaker verification as skippable, not failable, when it's absent.
- **Format support is broader** than Members 1/3: both audio (`.wav .mp3 .m4a .aac .flac .ogg .wma`) and video (`.mp4 .mkv .avi .mov .webm`) via `audio_converter.py`'s ffmpeg-based `convert_to_wav()`, which returns `(path, is_temp_file: bool)`.
- **No formal reliability signal** beyond a README note that clips under ~1.5s or noisy/reverberant audio reduce trustworthiness ΓÇö Member 4 must derive speaker-channel reliability itself from duration/quality, it cannot read it from Member 2's output.

### B.3 Member 3 ΓÇö STT + Context Analysis ΓÇö Γ£à COMPLETE logic, ΓÜá∩╕Å script-only, one real path bug

- **Transcription:** `transcribe.transcribe_audio(audio_path) -> (transcript: str, segments: list[dict])`. Uses OpenAI Whisper, model size hardcoded to `"tiny"`. **The Whisper model loads at import time** (`model = whisper.load_model("tiny")` runs the moment `transcribe.py` is imported) ΓÇö this means the first import is slow (multi-second) and should happen once, at Member 4's process startup, never per-request.
- **Context analysis:** `context_analyzer.analyze_context(transcript) -> dict`:
  ```json
  {
    "context_score": 0,
    "risk_level": "LOW | MEDIUM | HIGH",
    "detected": {},
    "reasons": []
  }
  ```
  Score is 0ΓÇô100, capped at 100, **higher = more suspicious** ΓÇö already risk-aligned, no inversion needed. `risk_level` bands (from `context_analyzer.py`): `>=60` HIGH, `>=30` MEDIUM, else LOW.
- **Real bug, confirmed in Member 3's own README "Important Implementation Notes":** `keywords.json` defines `credential_request_phrases` and `urgency_phrases` categories, but `SCORES` and `REASONS` dicts in `context_analyzer.py` have no entries for either ΓÇö matches in those two categories land in the returned `detected{}` dict but contribute **0 score and no reason text**. This is existing, documented Member 3 behavior. **Member 4 must not "fix" this** (out of Member 4's ownership per the team boundary rules) ΓÇö but the explainability layer must be aware `detected` can contain categories that did not move the score, so it never misreports them as risk drivers.
- **Path bug Member 4 will hit immediately:** `context_analyzer.load_keywords()` does `open("keywords.json", "r")` ΓÇö a bare relative path. This only works if the process's working directory happens to be Member 3's own folder. **This is the one place a small, safe fix is justified** (Section D) ΓÇö pointing the `open()` call at an absolute path derived from `__file__`, changing zero behavior.
- **No callable end-to-end function** ΓÇö `main.py` and `main_with_conv.py` are scripts with a hardcoded `audio_path` variable at the top and no function boundary; there is no `run(audio_path)` to import. Member 4 needs a thin wrapper (Section D/E).
- **No error handling at all** around Whisper or file access in Member 3's code ΓÇö a bad file raises an uncaught exception. Member 4's adapter must catch this.

### B.4 Cross-cutting findings

- **Three separate, incompatible `audio_converter.py`/loader implementations** exist across the three modules (Member 1's `audio/preprocessing.py`, Member 2's `audio_converter.py` returning `(path, is_temp)` with audio+video support, Member 3's `audio_converter.py` returning a bare path string and writing into its own `audio/` folder with `-y` overwrite). **Member 4 must not try to unify these.** It stages one uploaded file to a temp path and hands that same path to each module's own preferred loading code, unmodified.
- **No module produces a `request_id`, timestamp, or trace token.** Member 4 generates these itself, once, at the top of the pipeline.
- **Only Member 1 has a formal degraded-input signal.** Member 2 and Member 3 will happily produce a confident-looking number on a 1-second clip of static. Member 4's reliability engine cannot assume "no complaint from a module" means "trustworthy input" ΓÇö for the speaker and context channels it must independently check input duration/quality itself, using data from Member 1's diagnostics (they share the same input audio) rather than duplicating audio analysis.

---

## C. Integration Map

```
                         Uploaded audio (+ optional reference audio)
                                        Γöé
                                        Γû╝
                         Member 4: save to temp path(s)
                                        Γöé
        ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓö╝ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ
        Γû╝                               Γû╝                               Γû╝
adapters/member1_adapter.py   adapters/member2_adapter.py     adapters/member3_adapter.py
  calls analyze_audio()          calls compare_speakers()        calls transcribe_audio()
  (unmodified import)            (after minimal return-value       + analyze_context()
                                   fix ΓÇö Section D)                 (via new run() wrapper)
        Γöé                               Γöé                               Γöé
        Γû╝                               Γû╝                               Γû╝
  tagged Result                   tagged Result                   tagged Result
  {status, data, error}           {status, data, error}           {status, data, error}
        ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓö╝ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ
                                        Γû╝
                              normalization.py
                        (deepfake_risk, speaker_mismatch_risk, context_risk)
                                        Γöé
                                        Γû╝
                              reliability.py  ΓåÆ  reliability_score, reliability_reasons[]
                                        Γöé
                                        Γû╝
                              risk_engine.py  ΓåÆ  overall_risk_score
                                        Γöé
                                        Γû╝
                              decision_engine.py  ΓåÆ  LOW | HIGH | INCONCLUSIVE, human_review_required
                                        Γöé
                                        Γû╝
                              explainability.py  ΓåÆ  reasons[], warnings[]
                                        Γöé
                                        Γû╝
                                  JSON response
                                        Γöé
                                        Γû╝
                              api/main.py (FastAPI, thin wrapper only)
```

Each adapter is isolated: a failure in one never prevents the other two
from running, and never crashes the request.

---

## D. Required Changes to Members 1ΓÇô3 (minimal, explicit, nothing else)

### Change 1 ΓÇö Member 2: make `compare_speakers` return data (REQUIRED)

**File:** `verify_speaker.py`
**What changes:** Add a `return {...}` at the end of the success path, and
replace the `sys.exit(1)` calls in the `except` blocks with `raise`
(re-raising the caught exception, or a new lightweight
`SpeakerVerificationError` wrapping it) instead of terminating the
process. **Every existing `print()` statement stays exactly as-is** ΓÇö the
CLI usage (`python verify_speaker.py ref.wav test.wav`) must keep working
unchanged for the Member 2 owner. Do not touch the model-loading code, the
embedding code, the cosine similarity calculation, or the threshold
values.

```python
# at the end of the try block, after the existing print() calls:
return {
    "similarity": raw_similarity_score,
    "decision": decision,
    "threshold": PROTOTYPE_THRESHOLD,
    "uncertainty_margin": UNCERTAINTY_MARGIN,
    "embedding_dim": dim,
}
# in each except block, replace `sys.exit(1)` with, e.g.:
raise RuntimeError(f"Speaker verification failed: {e}") from e
```

If the Member 2 owner is unavailable to approve this change, the fallback
is for Member 4 to **not** modify `verify_speaker.py` at all, and instead
write its own small standalone function in
`adapters/member2_adapter.py` that duplicates only the
load-model ΓåÆ embed ΓåÆ cosine-similarity ΓåÆ threshold steps (using the exact
same SpeechBrain model id and the exact same 0.60/0.05 threshold values),
without calling `compare_speakers()` or touching Member 2's file. This is
the safer option if there's any doubt about permission to edit Member 2's
file, at the cost of a small amount of duplicated logic.

### Change 2 ΓÇö Member 3: fix the relative `keywords.json` path (REQUIRED, trivial, zero behavior change)

**File:** `context_analyzer.py`
**What changes:** `load_keywords()` currently does
`open("keywords.json", "r", ...)`. Change it to resolve relative to the
module's own file location, so it works regardless of the caller's
working directory:

```python
import os
KEYWORDS_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "keywords.json")

def load_keywords():
    with open(KEYWORDS_PATH, "r", encoding="utf-8") as file:
        return json.load(file)
```

This changes zero scoring behavior ΓÇö it only makes the existing behavior
work when called from outside Member 3's own directory.

### Change 3 ΓÇö Member 3: add a callable pipeline wrapper (REQUIRED, additive only)

**New file, not a modification:** `run_pipeline.py` inside Member 3's
folder (or, if the Member 3 owner prefers not to add files to their repo,
this can instead live entirely inside Member 4's adapter ΓÇö see Section
E). Either placement is acceptable; nothing in `main.py`,
`transcribe.py`, or `context_analyzer.py` is touched.

```python
from transcribe import transcribe_audio
from context_analyzer import analyze_context

def run_context_pipeline(audio_path: str) -> dict:
    transcript, segments = transcribe_audio(audio_path)
    analysis = analyze_context(transcript)
    return {"transcript": transcript, "segments": segments, **analysis}
```

### Files that must NOT be modified, under any circumstances

- `Member 1/model/detector.py`, `Member 1/inference/scoring.py`, `Member 1/inference/pipeline.py`, `Member 1/audio/diagnostics.py`, `Member 1/config.py` ΓÇö Member 1 is fully usable as-is.
- `Member 2/`: the model loading block, the embedding extraction, the cosine similarity calculation, and the three threshold constants (`PROTOTYPE_THRESHOLD`, `UNCERTAINTY_MARGIN`) inside `verify_speaker.py`.
- `Member 3/context_analyzer.py`'s `SCORES`, `REASONS`, `get_risk_level()`, and `analyze_context()` scoring logic ΓÇö including the known dead-category behavior described in Section B.3. That belongs to Member 3.
- `Member 3/keywords.json` content.
- Any `requirements.txt` belonging to Members 1ΓÇô3 (Member 4 has its own).

---

## E. Final Project Structure

```
echoforge-member4/
Γö£ΓöÇΓöÇ README.md
Γö£ΓöÇΓöÇ requirements.txt
Γö£ΓöÇΓöÇ .gitignore
Γö£ΓöÇΓöÇ .env.example
Γöé
Γö£ΓöÇΓöÇ config.py                     # ALL thresholds/weights/margins live here
Γöé
Γö£ΓöÇΓöÇ adapters/
Γöé   Γö£ΓöÇΓöÇ __init__.py
Γöé   Γö£ΓöÇΓöÇ result.py                 # shared AdapterResult type
Γöé   Γö£ΓöÇΓöÇ member1_adapter.py        # wraps analyze_audio()
Γöé   Γö£ΓöÇΓöÇ member2_adapter.py        # wraps compare_speakers() (post Change 1)
Γöé   ΓööΓöÇΓöÇ member3_adapter.py        # wraps run_context_pipeline() (post Change 3)
Γöé
Γö£ΓöÇΓöÇ core/
Γöé   Γö£ΓöÇΓöÇ __init__.py
Γöé   Γö£ΓöÇΓöÇ normalization.py          # Section G
Γöé   Γö£ΓöÇΓöÇ reliability.py            # Section H
Γöé   Γö£ΓöÇΓöÇ risk_engine.py            # Section I
Γöé   Γö£ΓöÇΓöÇ decision_engine.py        # Section J
Γöé   Γö£ΓöÇΓöÇ explainability.py         # Section K
Γöé   ΓööΓöÇΓöÇ pipeline.py               # orchestrates all of the above, no FastAPI import here
Γöé
Γö£ΓöÇΓöÇ api/
Γöé   Γö£ΓöÇΓöÇ __init__.py
Γöé   Γö£ΓöÇΓöÇ main.py                   # FastAPI app, startup model preload, /analyze, /health
Γöé   Γö£ΓöÇΓöÇ schemas.py                # Pydantic request/response models
Γöé   ΓööΓöÇΓöÇ file_handling.py          # temp file staging, validation, cleanup (Section L/security)
Γöé
Γö£ΓöÇΓöÇ tests/
Γöé   Γö£ΓöÇΓöÇ unit/
Γöé   Γöé   Γö£ΓöÇΓöÇ test_normalization.py
Γöé   Γöé   Γö£ΓöÇΓöÇ test_reliability.py
Γöé   Γöé   Γö£ΓöÇΓöÇ test_risk_engine.py
Γöé   Γöé   ΓööΓöÇΓöÇ test_decision_engine.py
Γöé   Γö£ΓöÇΓöÇ integration/
Γöé   Γöé   Γö£ΓöÇΓöÇ test_adapters_mocked.py   # Members 1-3 mocked, no real models loaded
Γöé   Γöé   ΓööΓöÇΓöÇ test_pipeline_mocked.py
Γöé   Γö£ΓöÇΓöÇ e2e/
Γöé   Γöé   ΓööΓöÇΓöÇ test_pipeline_real.py     # uses real Member 1-3 modules + sample audio
Γöé   ΓööΓöÇΓöÇ api/
Γöé       ΓööΓöÇΓöÇ test_analyze_endpoint.py  # FastAPI TestClient
Γöé
Γö£ΓöÇΓöÇ sample_audio/                 # small test clips reused from Members 1-3's own /audio folders
ΓööΓöÇΓöÇ external/                     # NOT copied source ΓÇö see note below
```

**Note on `external/`:** Member 4's code imports Members 1ΓÇô3 directly from
their existing repo locations (adjusting `sys.path` or installing them as
local editable packages ΓÇö whichever is simpler on Windows for a beginner;
Section P gives the exact commands). Do not copy-paste Member 1/2/3 source
files into Member 4's repository ΓÇö that creates two diverging copies of
the same code. Import from where they already live.

---

## F. Data Contracts

### F.1 Internal adapter result (used between adapters and the pipeline)

```python
# adapters/result.py
from typing import Literal, Optional, Any
from dataclasses import dataclass

@dataclass
class AdapterResult:
    status: Literal["ok", "error", "skipped"]
    data: Optional[dict[str, Any]]   # raw, untouched module output, only if status == "ok"
    error_message: Optional[str]     # only if status == "error"
```

`"skipped"` is reserved for Member 2 when no reference audio was supplied
ΓÇö it is an expected, non-alarming state, distinct from `"error"`, and the
two must be handled differently downstream (Section H, Section K).

### F.2 Normalized risk (internal)

```python
@dataclass
class NormalizedRisk:
    deepfake_risk: Optional[float]          # 0-100, None if member1 not "ok"
    speaker_mismatch_risk: Optional[float]  # 0-100, None if member2 not "ok"
    context_risk: Optional[float]           # 0-100, None if member3 not "ok"
```

### F.3 Final pipeline result (internal, becomes the API response body)

```python
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
    evidence: dict  # {"deepfake": {...}, "speaker": {...}, "context": {...}}
```

### F.4 FastAPI request/response (Pydantic, `api/schemas.py`)

Request is `multipart/form-data`, not JSON (it carries files), so there is
no request body Pydantic model for `/analyze` itself ΓÇö FastAPI's
`UploadFile` parameters serve that role directly (Section N). The
**response** model:

```python
class EvidenceBlock(BaseModel):
    status: Literal["ok", "error", "skipped"]
    raw: Optional[dict]

class RiskBreakdown(BaseModel):
    deepfake_risk: Optional[float]
    speaker_mismatch_risk: Optional[float]
    context_risk: Optional[float]

class AnalyzeResponse(BaseModel):
    request_id: str
    decision: Literal["LOW", "HIGH", "INCONCLUSIVE"]
    risk_score: Optional[float]
    reliability_score: float
    human_review_required: bool
    reasons: list[str]
    warnings: list[str]
    risk_breakdown: RiskBreakdown
    evidence: dict[str, EvidenceBlock]
```

---

## G. Normalization ΓÇö exact transformations

Internal convention for all three channels: **0 = low risk, 100 = high risk.**

| Channel | Original meaning | Original range | Transformation | Resulting meaning | Limitation |
|---|---|---|---|---|---|
| `deepfake_risk` | P(audio is AI-generated), Member 1 `raw_score` | 0.0ΓÇô1.0, higher = more synthetic | `raw_score * 100` | 0ΓÇô100, higher = more synthetic-risk | None needed ΓÇö already risk-aligned. Directly reflects model confidence, not acoustic quality (quality is handled separately, in reliability). |
| `speaker_mismatch_risk` | Cosine similarity to reference speaker, Member 2 | ~0.0ΓÇô1.0 in practice, higher = more likely same speaker | Piecewise-linear, anchored to Member 2's own real thresholds (0.65 / 0.55) ΓÇö see code below | 0ΓÇô100, higher = more likely different/mismatched speaker | Cosine similarity is not a calibrated probability; the piecewise mapping preserves Member 2's own decision boundaries but the in-between values are a linear approximation, not a learned calibration. |
| `context_risk` | Keyword/phrase-based suspicion score, Member 3 `context_score` | 0ΓÇô100, capped, higher = more suspicious | Identity ΓÇö no transform | 0ΓÇô100, higher = more suspicious | Inherits Member 3's own documented limitation: substring keyword matching, prone to false positives (e.g., the word "bank" alone), and the two "phrases" categories that score 0 due to the Member 3 bug in Section B.3. |

```python
# core/normalization.py

# Member 2's real thresholds (verify_speaker.py), NOT the README's stale values:
SPEAKER_SAME_T = 0.65
SPEAKER_DIFF_T = 0.55

def speaker_similarity_to_risk(similarity: float) -> float:
    """Higher similarity -> lower risk. Anchored to Member 2's own bands
    so Member 4's risk score never disagrees with Member 2's own
    SAME/DIFFERENT/UNCERTAIN call at the boundaries."""
    if similarity >= SPEAKER_SAME_T:
        frac = (similarity - SPEAKER_SAME_T) / (1.0 - SPEAKER_SAME_T)
        return max(0.0, 20.0 - 20.0 * frac)
    if similarity <= SPEAKER_DIFF_T:
        frac = similarity / SPEAKER_DIFF_T if SPEAKER_DIFF_T > 0 else 0.0
        return 100.0 - 30.0 * frac
    frac = (similarity - SPEAKER_DIFF_T) / (SPEAKER_SAME_T - SPEAKER_DIFF_T)
    return 60.0 - 40.0 * frac

def deepfake_score_to_risk(raw_score: float) -> float:
    return raw_score * 100.0

def context_score_to_risk(context_score: float) -> float:
    return float(context_score)  # already 0-100, higher = more suspicious
```

If an adapter's status is `"error"` or `"skipped"`, its corresponding
normalized risk is `None`. **`None` must never be coerced to `0`** ΓÇö a
missing channel is not evidence of safety, and treating it as `0` would
silently drag the aggregate risk down (Section I handles this correctly
by excluding `None` channels from the weighted average, not by zero-filling
them).

---

## H. Reliability Engine

Reliability is independent of risk direction ΓÇö it answers "how much
should we trust this risk number," not "is it risky." 0ΓÇô100 scale,
built entirely from real, already-available fields (no new ML model):

**Availability ΓÇö 40 points max**
- Member 1 available and `diagnostics.audio_valid == True`: **+15**
- Member 3 available (non-empty transcript returned): **+10**
- Member 2 available (reference audio was supplied and the adapter status is `"ok"`): **+15**
- If Member 2 was `"skipped"` (no reference provided), the ceiling for this section is capped at **25** instead of 40 ΓÇö it's an expected gap, not a fault, but it still limits how much can be known.

**Audio quality ΓÇö 35 points max** (sourced entirely from Member 1's `extended_diagnostics`, the only module with real acoustic metrics, since all three channels share the same input audio)
- `diagnostics.sufficient_duration == True`: **+10**
- `diagnostics.clipping_detected == False`: **+8**
- `diagnostics.mostly_silent == False`: **+7**
- `extended_diagnostics.snr_estimate_db`: linear scale from 0 pts at 0 dB to **+10** at 15 dB and above

**Decision confidence ΓÇö 25 points max**
- Member 1's own `confidence` field: `HIGH` ΓåÆ **+10**, `MODERATE` ΓåÆ **+5**, `LOW` ΓåÆ **+0**
- Penalty (not bonus) when a module's own uncertainty logic fired: **ΓêÆ10** per flagged channel (Member 1 landed inside its own `UNCERTAINTY_MARGIN`; Member 2 landed inside its own 0.55ΓÇô0.65 band), capped at **ΓêÆ25** total. This penalty is separate from, and stacks with, the availability/quality points above ΓÇö it specifically penalizes "the module ran fine but told us it wasn't sure," which availability/quality checks don't capture.

```python
# core/reliability.py ΓÇö signature
def compute_reliability(
    member1_result: AdapterResult,
    member2_result: AdapterResult,
    member3_result: AdapterResult,
) -> tuple[float, list[str]]:
    """Returns (reliability_score 0-100, reliability_reasons[])."""
```

Every point in this formula traces to a specific field name from a
specific module's real output ΓÇö this must remain true; if a future
change needs a new signal, add it as a named, commented constant in
`config.py`, never inline.

---

## I. Risk Engine

Weighted average over **only the channels currently available**:

```python
# config.py
RISK_WEIGHTS = {
    "deepfake_risk": 0.5,
    "speaker_mismatch_risk": 0.3,
    "context_risk": 0.2,
}
```

**Rationale for these MVP defaults** (explicitly not a claim of
correctness ΓÇö configurable and revisitable):
- `deepfake_risk` gets the most weight (0.5) because Member 1 is the only
  channel backed by a purpose-trained classifier plus real acoustic
  diagnostics ΓÇö it's the most directly relevant to "is this audio itself
  synthetic," which is EchoForge's core question.
- `context_risk` gets the least weight (0.2) because Member 3's own README
  explicitly documents its keyword-substring approach as prone to false
  positives on ordinary words.
- `speaker_mismatch_risk` sits in between (0.3): strong evidence when
  available, but frequently unavailable (requires reference audio) and,
  per Member 2's own README, sensitive to short/noisy clips.
- If the project later collects labeled evaluation data, these weights
  should be re-derived empirically rather than kept as this justified but
  provisional starting point.

```python
# core/risk_engine.py
def aggregate_risk(risks: dict[str, float | None], weights: dict[str, float]) -> float | None:
    available = {k: v for k, v in risks.items() if v is not None}
    if not available:
        return None
    total_weight = sum(weights[k] for k in available)
    return sum(weights[k] * v for k, v in available.items()) / total_weight
```

`None` (not `0`) is returned when no channel is available, and the
decision engine (Section J) treats that explicitly as a forcing condition
for `INCONCLUSIVE` ΓÇö never as "risk score of zero."

---

## J. Decision Engine

```python
# config.py
HIGH_THRESHOLD = 65
LOW_THRESHOLD = 35
BOUNDARY_MARGIN = 5
RELIABILITY_FLOOR = 40
```

```python
# core/decision_engine.py
def decide(risk_score, reliability_score, member1_status) -> tuple[str, Optional[str]]:
    if risk_score is None:
        return "INCONCLUSIVE", "No evidence channels were available."
    if member1_status != "ok":
        return "INCONCLUSIVE", "Deepfake detection (primary evidence channel) unavailable."
    if reliability_score < RELIABILITY_FLOOR:
        return "INCONCLUSIVE", "Evidence reliability too low for an automated decision."
    if abs(risk_score - HIGH_THRESHOLD) <= BOUNDARY_MARGIN or \
       abs(risk_score - LOW_THRESHOLD) <= BOUNDARY_MARGIN:
        return "INCONCLUSIVE", "Risk score falls within the decision boundary margin."
    if risk_score >= HIGH_THRESHOLD:
        return "HIGH", None
    if risk_score <= LOW_THRESHOLD:
        return "LOW", None
    return "INCONCLUSIVE", "Risk score falls in the ambiguous mid-range."
```

`human_review_required` is `True` for `HIGH` and `INCONCLUSIVE`, `False`
only for `LOW` ΓÇö matching the pipeline diagram's human-review step, which
sits downstream of every non-LOW outcome.

Member 1 is treated as the one channel whose absence forces
`INCONCLUSIVE` outright, because it's EchoForge's core, purpose-built
signal ΓÇö Member 2 and Member 3 being absent lowers reliability (Section
H) and may still push the decision to `INCONCLUSIVE` through the
reliability floor, but doesn't hard-force it the way losing Member 1 does.

---

## K. Explainability

`reasons[]` (things that actively support the decision) and `warnings[]`
(things that reduce confidence but aren't themselves risk evidence) are
built from a small rule table, entirely conditional on real fields:

```python
# core/explainability.py ΓÇö behavior, not exact code
if risks.deepfake_risk is not None and risks.deepfake_risk >= 65:
    reasons.append(f"High synthetic-voice probability ({member1_data['raw_score']:.2f}).")
if risks.speaker_mismatch_risk is not None and risks.speaker_mismatch_risk >= 65:
    reasons.append("Voice does not match the claimed reference speaker.")
if risks.context_risk is not None and risks.context_risk >= 30:
    reasons.extend(member3_data.get("reasons", []))   # reuse Member 3's own text, don't re-derive

if member2_status == "skipped":
    warnings.append("Speaker verification skipped: no reference audio was provided.")
if member1_status == "error" or member3_status == "error":
    warnings.append("One or more analysis modules failed; result is based on partial evidence.")
if reliability_score < RELIABILITY_FLOOR:
    warnings.append("Overall evidence reliability is low; treat this result as provisional.")
```

Reusing Member 3's own `reasons[]` text directly (instead of writing new
strings) keeps Member 4 from re-deriving logic it doesn't own, consistent
with the team boundary rules. No reason or warning string is ever emitted
unconditionally ΓÇö every one is gated on a real field crossing a real,
configured threshold.

---

## L. Error Handling

| Situation | Category | Member 4 behavior |
|---|---|---|
| No file uploaded / empty file | Invalid user input | HTTP 400, clear message, no module is called |
| Unsupported file extension | Invalid user input | HTTP 400, list supported extensions |
| File exceeds size limit | Invalid user input | HTTP 413 |
| Corrupted/unreadable audio | Invalid user input, caught early if possible, otherwise surfaces as Member 1's own `"error"` key | HTTP 400 if caught before any module call; otherwise treated as Member 1 `status: "error"` and flows through the pipeline as evidence uncertainty |
| Audio shorter than `MIN_RELIABLE_DURATION_SEC` | Analysis uncertainty | Not a hard rejection ΓÇö Member 1 itself already returns `classification: "UNCERTAIN"` for this; Member 4 passes it through and lets reliability/decision handle it |
| No reference audio provided | Expected, not a failure | Member 2 adapter returns `status: "skipped"`; reliability ceiling reduced (Section H); decision engine unaffected beyond reliability |
| Member 1 raises unexpectedly | Module failure | Adapter catches, `status: "error"`, decision forced toward `INCONCLUSIVE` (Section J) |
| Member 2 raises (model load failure, bad audio) | Module failure | Adapter catches, `status: "error"`, `speaker_mismatch_risk = None` |
| Member 3 raises (Whisper failure, bad audio) | Module failure | Adapter catches, `status: "error"`, `context_risk = None` |
| Member 3 returns malformed data (missing key) | Module failure | Adapter validates expected keys are present before returning `"ok"`; missing keys ΓåÆ `status: "error"` with a specific message, never a `KeyError` propagating upward |
| A score is `NaN` or `Inf` | Invalid module output | Adapter treats this the same as `status: "error"` for that channel ΓÇö `math.isfinite()` check before accepting any numeric score from any module |
| Model loading failure at startup | Server fault | FastAPI startup fails loudly with a clear log message ΓÇö do not start serving `/analyze` requests with a partially-loaded model set |
| Any other unexpected exception inside `/analyze` | Server fault | Caught by a single top-level handler in `api/main.py`, logged with the `request_id`, returns HTTP 500 with a generic message ΓÇö **never** a raw Python traceback in the response body |

The dividing line, restated: if the problem is about what the user sent
(bad file, wrong format, missing required field), it's an API error with
a 4xx status and a clear message before any model runs. If the problem is
about a module misbehaving on valid input, it's evidence uncertainty ΓÇö
the request still returns HTTP 200 with a decision, most likely
`INCONCLUSIVE`, and the reason is explained in the response body, not
hidden.

---

## M. Pipeline (execution sequence)

```python
# core/pipeline.py ΓÇö no FastAPI import anywhere in this file
def run_analysis(audio_path: str, reference_audio_path: Optional[str]) -> AnalysisResult:
    request_id = generate_request_id()

    m1 = member1_adapter.run(audio_path)
    m2 = member2_adapter.run(reference_audio_path, audio_path) if reference_audio_path else AdapterResult(status="skipped", data=None, error_message=None)
    m3 = member3_adapter.run(audio_path)
    # m1/m2/m3 calls can run concurrently (asyncio.gather + run_in_threadpool
    # at the API layer, or a simple ThreadPoolExecutor here) ΓÇö they are
    # independent and each involves a slow model call.

    risks = normalization.build(m1, m2, m3)
    reliability_score, reliability_reasons = reliability.compute_reliability(m1, m2, m3)
    risk_score = risk_engine.aggregate_risk(risks, config.RISK_WEIGHTS)
    decision, decision_note = decision_engine.decide(risk_score, reliability_score, m1.status)
    reasons, warnings = explainability.build(risks, m1, m2, m3, reliability_score, decision_note)

    return AnalysisResult(
        request_id=request_id,
        decision=decision,
        risk_score=risk_score,
        reliability_score=reliability_score,
        human_review_required=(decision != "LOW"),
        reasons=reasons,
        warnings=warnings + reliability_reasons,
        risk_breakdown=risks,
        evidence={"deepfake": m1, "speaker": m2, "context": m3},
    )
```

This function must be fully callable and testable from a plain Python
script or `pytest`, with zero dependency on FastAPI, Starlette, or
`uvicorn` being installed. That's what makes Milestones M4.9ΓÇôM4.11
(Section Q) possible before FastAPI is ever introduced.

---

## N. FastAPI

FastAPI is a thin transport wrapper around `core/pipeline.run_analysis()`
ΓÇö it does not contain any decision logic itself.

```
POST /analyze
  Content-Type: multipart/form-data
  Fields:
    audio            : file, required   ΓÇö the suspicious/test audio
    reference_audio  : file, optional   ΓÇö claimed-speaker reference; enables speaker verification
  ΓåÆ 200 OK  ΓåÆ AnalyzeResponse (Section F.4), always returned when the
              request itself was valid, even if one or more modules failed
              internally (that's evidence uncertainty, not an API error)
  ΓåÆ 400 Bad Request ΓåÆ { "detail": "..." }  (invalid/missing file, bad format, too large)
  ΓåÆ 500 Internal Server Error ΓåÆ { "detail": "An unexpected error occurred." }
              (never a traceback ΓÇö logged server-side with request_id)

GET /health
  ΓåÆ 200 OK ΓåÆ { "status": "ok", "modules": { "member1": "loaded", "member2": "loaded", "member3": "loaded" } }
```

Model loading (Member 1's wav2vec2, Member 2's ECAPA-TDNN, Member 3's
Whisper tiny) happens **once**, in a FastAPI `lifespan` context manager at
startup ΓÇö all three underlying modules already default to
lazy/singleton loading internally (Member 1 via `get_detector()`; Member
3 at import time), so startup just needs to trigger that import/load path
once, so the first real request isn't slow.

CORS: allow the frontend's origin only (configurable via `.env`, default
`http://localhost:3000` or whatever Member 5 ends up using) ΓÇö not `"*"`,
even for an MVP, since this API accepts file uploads.

---

## O. Testing Strategy

| # | Scenario | Layer | How it's run |
|---|---|---|---|
| 1 | Clearly genuine voice + correct speaker | E2E | Real Member 1-3, real sample audio, expect `LOW` |
| 2 | Clearly synthetic voice | E2E | Real modules, expect `HIGH` (or `INCONCLUSIVE` if reliability is low on the sample) |
| 3 | Synthetic voice + wrong speaker | E2E | Real modules, expect `HIGH`, both `deepfake_risk` and `speaker_mismatch_risk` elevated |
| 4 | Genuine voice + wrong speaker | E2E | Real modules ΓÇö tests that Member 4 doesn't just parrot Member 1's GENUINE call; speaker mismatch should still surface in `reasons` |
| 5 | Suspicious context (credential/financial/urgency keywords) | Integration (mocked M1/M2, real M3) | Feed a scripted transcript through the real `context_analyzer`, mock the other two |
| 6 | Poor/noisy audio | E2E or integration | Use a short/clipped/noisy sample from Members 1-3's own test audio folders; expect low `reliability_score` and likely `INCONCLUSIVE` even if `risk_score` looks high |
| 7 | Conflicting module outputs (e.g., Member 1 confident GENUINE, Member 2 confident DIFFERENT SPEAKER) | Integration, mocked | Construct mocked `AdapterResult`s directly; assert the conflict appears in `reasons`/`warnings`, not silently averaged away |
| 8 | Member 1 unavailable (adapter raises / model fails to load) | Integration, mocked | Mock `member1_adapter.run` to return `status: "error"`; assert decision is `INCONCLUSIVE` per Section J's hard rule |
| 9 | Member 2 unavailable (no reference audio) | Integration, mocked | Omit `reference_audio`; assert `status: "skipped"` (not `"error"`) and reliability ceiling reduced, not a hard `INCONCLUSIVE` |
| 10 | Member 3 unavailable (Whisper failure) | Integration, mocked | Mock `member3_adapter.run` to return `status: "error"`; assert `context_risk is None` and it's excluded from the weighted average, not zero-filled |
| 11 | Invalid audio (wrong file type, corrupted, empty) | API | `TestClient` posts a `.txt` file or a truncated audio file; assert HTTP 400, not a 500 or traceback |
| 12 | Successful API request end-to-end | API + E2E | `TestClient` posts real audio + reference audio to `/analyze`; assert 200, schema matches `AnalyzeResponse`, `request_id` present |

**Unit tests** (`tests/unit/`) cover `normalization.py`,
`reliability.py`, `risk_engine.py`, `decision_engine.py` in complete
isolation ΓÇö pure functions, plain input dicts/dataclasses in, expected
values out. No audio files, no models, run in well under a second.

**Mocked integration tests** (`tests/integration/`) exercise
`core/pipeline.run_analysis()` with the three adapters monkeypatched/mocked
to return canned `AdapterResult`s ΓÇö this is how tests 5, 7, 8, 9, 10 above
run without needing to load three large models on every test run.

**Real E2E tests** (`tests/e2e/`) run the actual pipeline against actual
sample audio pulled from the `audio/` folders that already exist inside
Members 1, 2, and 3's own repos (reuse those files ΓÇö don't record new
ones). These are slow (multi-second per test, due to real model
inference) and should be marked (e.g. `@pytest.mark.e2e`) so they can be
skipped during fast iteration and run before milestones that matter
(Section Q).

**API tests** (`tests/api/`) use FastAPI's `TestClient`, which doesn't
require a running server ΓÇö good for a beginner on Windows, no separate
terminal needed to test the API layer.

---

## P. VS Code Setup (Windows, beginner-friendly)

```powershell
# 1. Open the Member 4 folder in VS Code, then open a terminal (Ctrl+`)

# 2. Create and activate a virtual environment (keeps Member 4's packages
#    separate from Members 1-3's own environments)
python -m venv venv
.\venv\Scripts\Activate.ps1
# If PowerShell blocks this with an execution-policy error, run once:
#   Set-ExecutionPolicy -Scope CurrentUser RemoteSigned

# 3. Install Member 4's own dependencies
pip install -r requirements.txt

# 4. Make Members 1-3 importable without copying their files.
#    Simplest beginner-friendly approach: a .pth file or PYTHONPATH entry
#    pointing at their folders, OR install each as an editable local package
#    if they have a setup.py/pyproject.toml (they currently don't, so the
#    .pth/PYTHONPATH route is simpler for now):
#    Create venv\Lib\site-packages\echoforge_paths.pth containing the
#    absolute paths to "Member 1", the speaker_verification folder, and the
#    context_analysis folder, one per line.

# 5. Run unit tests only (fast, no models, do this constantly while coding)
pytest tests/unit -v

# 6. Run mocked integration tests (still fast, no real models)
pytest tests/integration -v

# 7. Run the real end-to-end tests (slow ΓÇö loads all three real models)
pytest tests/e2e -v -m e2e

# 8. Run the API tests
pytest tests/api -v

# 9. Start the API server for manual testing
uvicorn api.main:app --reload --port 8000
#    Then open http://127.0.0.1:8000/docs for FastAPI's built-in interactive
#    test page (Swagger UI) ΓÇö upload a file there directly, no curl needed.
```

**Common errors and what they mean:**
- `ModuleNotFoundError: No module named 'inference'` (or similar) ΓåÆ
  Members 1ΓÇô3 aren't on the Python path yet ΓÇö redo step 4.
- `ModuleNotFoundError: No module named 'speechbrain'` (or `whisper`,
  `transformers`) ΓåÆ that specific member's own `requirements.txt` hasn't
  been installed into this venv. Member 4's venv needs Members 1ΓÇô3's
  dependencies too, since it imports their code directly (not over a
  network call) ΓÇö install each member's `requirements.txt` into the same
  venv, in addition to Member 4's own.
- First real test/API call is very slow ΓåÆ expected, this is model loading
  (wav2vec2 + ECAPA-TDNN + Whisper); subsequent calls in the same process
  are fast because of the singleton/import-time caching Members 1 and 3
  already implement.
- `ffmpeg not found` errors from Member 2 or Member 3's converters ΓåÆ
  ffmpeg needs to be installed system-wide and on `PATH`, same as
  documented in Member 2's own README (`winget install --id Gyan.FFmpeg`
  on Windows) ΓÇö this is a Member 2/3 dependency, not something Member 4
  needs to reimplement.

---

## Q. Implementation Milestones

For each milestone: **Goal ┬╖ Files ┬╖ Why ┬╖ What the code should do ┬╖ Command ┬╖ Expected output ┬╖ How to verify ┬╖ Common errors ┬╖ What NOT to change.**

### M4.0 ΓÇö Repository audit
- **Goal:** Confirm the findings in Section B against the actual files, before writing anything.
- **Files:** none created/changed ΓÇö read-only pass over Member 1/2/3 folders.
- **Why:** every downstream milestone depends on these interfaces being right; catching a wrong assumption now is cheap, catching it in M4.9 is not.
- **What to do:** open `inference/pipeline.py`, `verify_speaker.py`, `context_analyzer.py`, `transcribe.py`, and each `config.py`/threshold constant referenced in Section B; confirm signatures and threshold values match.
- **Command:** none (manual read, or `grep`/`Select-String` for the constant names).
- **Expected output:** a short confirmation note, or a list of discrepancies from this document if any are found.
- **Verify success:** every function signature and threshold number in Section B has been checked against the live file, not assumed from this document.
- **Common errors:** trusting this document over the code ΓÇö don't; if they disagree, the code wins and Section B needs a correction note.
- **Do NOT change:** anything ΓÇö this is read-only.

### M4.1 ΓÇö Project skeleton
- **Goal:** Create the folder/file structure from Section E, empty but importable.
- **Files:** all folders and empty `__init__.py`/module files from Section E; `requirements.txt`; `.gitignore`; `README.md` stub.
- **Why:** establishes the module boundaries (Rule 13) before any logic exists, so nothing gets tangled together later.
- **What to do:** create the tree; each `.py` file gets a docstring saying what will live there and nothing else yet.
- **Command:** `pip install fastapi uvicorn python-multipart pydantic pytest` (add to `requirements.txt`).
- **Expected output:** `python -c "import core.pipeline"` runs without error (even though the module is empty).
- **Verify success:** the folder tree matches Section E exactly; venv activates; imports resolve.
- **Common errors:** missing `__init__.py` in a folder that needs to be an importable package.
- **Do NOT change:** any Member 1/2/3 file.

### M4.2 ΓÇö Data contracts
- **Goal:** Implement `AdapterResult`, `NormalizedRisk`, `AnalysisResult` from Section F.
- **Files:** `adapters/result.py`, additions to `core/pipeline.py` (dataclass definitions can live there or in a `core/models.py` ΓÇö either is fine, keep it consistent).
- **Why:** every other milestone imports these types; getting the shape right first avoids rework.
- **What to do:** implement exactly the dataclasses in Section F.1ΓÇôF.3.
- **Command:** `python -c "from adapters.result import AdapterResult; print(AdapterResult('ok', {}, None))"`
- **Expected output:** prints the constructed object with no error.
- **Verify success:** `mypy` or basic manual review confirms fields match Section F.
- **Common errors:** using `None` and `0`/`""` inconsistently as "missing" ΓÇö always `None`.
- **Do NOT change:** the field names in Section F once other milestones start depending on them, without updating every consumer.

### M4.3 ΓÇö Config centralization
- **Goal:** All thresholds/weights/margins from Sections GΓÇôJ live in `config.py`.
- **Files:** `config.py`.
- **Why:** Rule 17/18 ΓÇö no magic numbers scattered through the codebase.
- **What to do:** define `SPEAKER_SAME_T`, `SPEAKER_DIFF_T`, `RISK_WEIGHTS`, `HIGH_THRESHOLD`, `LOW_THRESHOLD`, `BOUNDARY_MARGIN`, `RELIABILITY_FLOOR`, each with a one-line comment citing which section/source justified the value.
- **Command:** `python -c "import config; print(config.RISK_WEIGHTS)"`
- **Expected output:** prints `{'deepfake_risk': 0.5, 'speaker_mismatch_risk': 0.3, 'context_risk': 0.2}`.
- **Verify success:** grep the rest of the (not-yet-written) codebase later, in M4.11, for any bare numeric literal that should have come from here.
- **Common errors:** none yet ΓÇö this file has no logic to break.
- **Do NOT change:** Member 1's `DETECTION_THRESHOLD`/`MIN_RELIABLE_DURATION_SEC`/`UNCERTAINTY_MARGIN` or Member 2's `PROTOTYPE_THRESHOLD`/`UNCERTAINTY_MARGIN` ΓÇö those stay in their own files; Member 4's `config.py` only holds Member-4-owned values (it may *read* the others by importing them, but does not redefine them).

### M4.4 ΓÇö Normalization (unit-tested, no I/O)
- **Goal:** Implement Section G's three transform functions.
- **Files:** `core/normalization.py`, `tests/unit/test_normalization.py`.
- **Why:** this is pure, easily-testable logic ΓÇö get it right in isolation before it's wired into anything real.
- **What to do:** implement `deepfake_score_to_risk`, `speaker_similarity_to_risk`, `context_score_to_risk` exactly as in Section G; write unit tests covering the boundary values (0.65, 0.55, 0.0, 1.0 for speaker; 0.0, 0.5, 1.0 for deepfake; 0, 60, 100 for context).
- **Command:** `pytest tests/unit/test_normalization.py -v`
- **Expected output:** all tests pass; e.g. `speaker_similarity_to_risk(0.65) == 20.0`, `speaker_similarity_to_risk(0.55) == 70.0`.
- **Verify success:** test output shows green/passed for every boundary case.
- **Common errors:** off-by-direction bugs (forgetting speaker similarity inverts while the other two don't) ΓÇö the unit tests exist specifically to catch this.
- **Do NOT change:** the 0.65/0.55 anchor values without re-confirming them against Member 2's actual `verify_speaker.py` (Section B.2) first.

### M4.5 ΓÇö Reliability engine (unit-tested)
- **Goal:** Implement Section H's scoring formula.
- **Files:** `core/reliability.py`, `tests/unit/test_reliability.py`.
- **Why:** must exist and be correct before risk/decision can be tested meaningfully.
- **What to do:** implement `compute_reliability()` taking three `AdapterResult`s, returning `(score, reasons[])`; unit test with hand-constructed `AdapterResult`s covering: all three modules `"ok"` with clean diagnostics (expect near-100); Member 2 `"skipped"` (expect capped ceiling); Member 1 `"error"` (expect large reduction); noisy/short audio diagnostics (expect quality-section points lost).
- **Command:** `pytest tests/unit/test_reliability.py -v`
- **Expected output:** all constructed scenarios produce scores in the expected range/order (e.g., all-clean > Member2-skipped > Member1-error).
- **Verify success:** relative ordering of test scenarios matches intuition, not just absolute numbers.
- **Common errors:** double-penalizing the same signal in two different sections of the formula (e.g., letting "insufficient duration" hit both the availability section and the quality section inconsistently) ΓÇö keep each signal's contribution in exactly one place.
- **Do NOT change:** Member 1's diagnostic field names ΓÇö reliability reads them, it doesn't define them.

### M4.6 ΓÇö Risk engine (unit-tested)
- **Goal:** Implement Section I's weighted aggregation.
- **Files:** `core/risk_engine.py`, `tests/unit/test_risk_engine.py`.
- **What to do:** implement `aggregate_risk()`; unit test: all three channels present; one missing (weights renormalize correctly); all three missing (returns `None`, not `0`).
- **Command:** `pytest tests/unit/test_risk_engine.py -v`
- **Expected output:** all pass, including the explicit `assert aggregate_risk({}, weights) is None` case.
- **Verify success:** weighted average with a missing channel matches a hand-calculated value.
- **Common errors:** dividing by the full weight sum instead of the *available* weight sum when a channel is missing ΓÇö this silently deflates the score.
- **Do NOT change:** `config.RISK_WEIGHTS` casually ΓÇö any change here is a real product decision, log why.

### M4.7 ΓÇö Decision engine (unit-tested)
- **Goal:** Implement Section J.
- **Files:** `core/decision_engine.py`, `tests/unit/test_decision_engine.py`.
- **What to do:** implement `decide()`; unit test every branch: `risk_score=None`, `member1_status != "ok"`, `reliability_score` below floor, risk exactly at each boundary margin edge, clear `HIGH`, clear `LOW`, ambiguous mid-range.
- **Command:** `pytest tests/unit/test_decision_engine.py -v`
- **Expected output:** every branch covered and passing.
- **Verify success:** a risk score of exactly `HIGH_THRESHOLD` (65) returns `INCONCLUSIVE` due to the boundary margin, not `HIGH` ΓÇö confirms the margin logic actually engages.
- **Common errors:** off-by-one on `<=` vs `<` at boundary checks ΓÇö test the exact edges, not just interior values.
- **Do NOT change:** which check runs first (the ordering in Section J's `decide()` is deliberate ΓÇö Member-1-missing and reliability-floor checks must happen before the boundary-margin check).

### M4.8 ΓÇö Explainability (unit-tested)
- **Goal:** Implement Section K.
- **Files:** `core/explainability.py`, add to relevant unit tests.
- **What to do:** implement `build()` producing `reasons[]`/`warnings[]`, gated strictly on real evidence fields as shown in Section K.
- **Command:** `pytest tests/unit -v` (whole unit suite by now).
- **Expected output:** for a scenario with no elevated risk, `reasons == []`; for elevated `deepfake_risk`, the specific reason string appears with the real score interpolated in.
- **Verify success:** no reason string appears when its triggering condition is false ΓÇö write a test that asserts absence, not just presence.
- **Common errors:** appending a reason unconditionally "just in case" ΓÇö every append must be inside an `if` tied to a real field.
- **Do NOT change:** Member 3's own `reasons[]` text when reusing it ΓÇö pass it through verbatim.

### M4.9 ΓÇö Integration adapters
- **Goal:** Implement the three adapters, including Change 1 and Change 2 from Section D.
- **Files:** `adapters/member1_adapter.py`, `adapters/member2_adapter.py`, `adapters/member3_adapter.py`; the two Section D changes to Member 2's and Member 3's own files (or Member 3's new additive `run_pipeline.py`).
- **Why:** this is where Member 4 first touches real external code ΓÇö do it carefully, in its own milestone, separate from the pure-logic milestones above.
- **What to do:** each adapter calls the real module function inside a `try/except`, checks for Member 1's `"error"` key explicitly, validates numeric fields with `math.isfinite()`, and always returns an `AdapterResult` ΓÇö never lets an exception escape.
- **Command:** `pytest tests/integration/test_adapters_mocked.py -v` (mocked ΓÇö doesn't need real models yet) then a manual real call: `python -c "from adapters import member1_adapter; print(member1_adapter.run('sample_audio/some_file.wav'))"`.
- **Expected output:** mocked tests pass; the manual real call prints a populated `AdapterResult(status='ok', ...)`.
- **Verify success:** deliberately pass a missing file path and confirm `status == "error"` with a readable message, not a crash.
- **Common errors:** forgetting Member 2 needs *two* file paths, not one; forgetting Whisper's import-time model load makes the first adapter call slow (expected, not a bug).
- **Do NOT change:** anything in Member 1's files; only the two explicitly-scoped changes in Member 2/3 files from Section D ΓÇö show the diff for review before considering this milestone done.

### M4.10 ΓÇö Core pipeline + mocked integration tests
- **Goal:** Wire M4.4ΓÇôM4.9 together into `core/pipeline.run_analysis()`, fully testable without FastAPI.
- **Files:** `core/pipeline.py`; `tests/integration/test_pipeline_mocked.py`.
- **What to do:** implement exactly the flow in Section M; write mocked-adapter tests covering scenarios 5, 7, 8, 9, 10 from Section O's test table.
- **Command:** `pytest tests/integration -v`
- **Expected output:** all mocked integration tests pass, running in well under a few seconds total (no real models loaded).
- **Verify success:** the "Member 1 unavailable" test asserts `decision == "INCONCLUSIVE"` specifically, not just "not HIGH."
- **Common errors:** accidentally importing a real model at module load time inside `pipeline.py` (breaks the "mockable without loading models" property) ΓÇö real module calls must only happen inside the adapters, which is what gets mocked.
- **Do NOT change:** the milestone order ΓÇö do not start FastAPI before this passes.

### M4.11 ΓÇö End-to-end pipeline with real modules
- **Goal:** Run the full pipeline against real Member 1ΓÇô3 code and real sample audio, no mocks.
- **Files:** `tests/e2e/test_pipeline_real.py`; copy a handful of small sample files from Members 1/2/3's existing `audio/`/test folders into `sample_audio/` (reuse, don't record new).
- **What to do:** implement Section O's test scenarios 1ΓÇô4 and 6 as real E2E tests.
- **Command:** `pytest tests/e2e -v -m e2e`
- **Expected output:** all pass; note actual runtime (multiple seconds per test is expected and fine).
- **Verify success:** manually eyeball at least one full `AnalysisResult` for a known-genuine sample and confirm the `reasons`/`risk_breakdown` make sense given what's in the audio.
- **Common errors:** the various `ModuleNotFoundError`s and `ffmpeg not found` issues listed in Section P ΓÇö resolve the environment, not the code, when these appear.
- **Do NOT change:** any threshold to "make the test pass" ΓÇö if a real sample produces a surprising result, investigate whether the *test sample* or the *pipeline* is at fault before touching Section G/I/J constants.

### M4.12 ΓÇö FastAPI layer
- **Goal:** Wrap the already-tested `run_analysis()` in a FastAPI app.
- **Files:** `api/main.py`, `api/schemas.py`, `api/file_handling.py`.
- **What to do:** implement `/analyze` and `/health` per Section N; implement temp-file staging/validation/cleanup per Section L and the security notes below; add the lifespan startup hook to preload models.
- **Command:** `uvicorn api.main:app --reload --port 8000`
- **Expected output:** server starts, logs show model preloading happening once at startup (not per request); `http://127.0.0.1:8000/docs` loads.
- **Verify success:** using the Swagger UI, upload a real audio file to `/analyze` and get back a 200 with a well-formed `AnalyzeResponse`.
- **Common errors:** forgetting `python-multipart` (required by FastAPI for file uploads) in `requirements.txt`; CORS errors once Member 5 tries to call this from a browser (fix by setting the actual frontend origin, not `*`).
- **Do NOT change:** any decision/risk/reliability logic inside `api/main.py` ΓÇö if you find yourself writing an `if` about risk scores here, it belongs in `core/`, move it.

### M4.13 ΓÇö API tests
- **Goal:** Automated tests for the FastAPI layer using `TestClient`.
- **Files:** `tests/api/test_analyze_endpoint.py`.
- **What to do:** implement Section O's scenarios 11 and 12.
- **Command:** `pytest tests/api -v`
- **Expected output:** both pass; invalid-file test confirms HTTP 400 with a clean `detail` message, not a stack trace.
- **Verify success:** deliberately POST a `.txt` file and eyeball the actual response body to confirm no traceback leaked.
- **Common errors:** `TestClient` needing the app's lifespan events triggered explicitly depending on FastAPI/Starlette version ΓÇö check the installed version's docs if startup-loaded models aren't available in tests.
- **Do NOT change:** response schema field names at this stage without updating Section F.4 and flagging it as a breaking change for Member 5.

### M4.14 ΓÇö Final integration, docs, cleanup
- **Goal:** Everything from M4.1ΓÇôM4.13 runs cleanly together; README is accurate; no dead code or stray print-debugging left in `core/`/`adapters/`/`api/`.
- **Files:** `README.md` (final pass), minor cleanup across all files.
- **What to do:** run the full test suite (`pytest -v`, including `-m e2e`), fix anything red, write the README covering: what Member 4 does, how to set up the venv, how to run tests, how to start the API, and a link back to this specification document.
- **Command:** `pytest -v -m "e2e or not e2e"` (i.e., the whole suite) then `uvicorn api.main:app --reload`.
- **Expected output:** full green test suite; server runs; manual Swagger UI test succeeds.
- **Verify success:** a fresh clone of the repo, following only the README, gets from zero to a working `/analyze` call.
- **Common errors:** README drifting from what the code actually does ΓÇö read it back against the real files one more time (echoing M4.0).
- **Do NOT change:** scope ΓÇö this milestone is cleanup and documentation, not new features; anything Member 5/Member 6 will need later stays as a note for future work, not something built now.
