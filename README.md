# EchoForge — Member 4 (Integration, Reliability, Risk Aggregation, & Decision Engine)

Member 4 serves as the integration, reliability engine, risk aggregation, decision engine, and explainability backend for the EchoForge Audio Authenticity Platform.

Primary Specification: [`EchoForge_Member4_Antigravity_Final_Spec.md`](file:///c:/Users/ASMITA/OneDrive/Desktop/EchoForge-%20Backend/EchoForge_Member4_Antigravity_Final_Spec.md)

---

## Architecture & Data Flow Overview

```text
Uploaded Audio (+ optional Reference Audio)
    │
    ▼
Member 4 Integration Adapters (Member 1, Member 2, Member 3)
    │
    ▼
Normalization Engine (0 = Low Risk / Authentic, 100 = High Risk / Deepfake)
    │
    ▼
Reliability Engine (0-100 Evidence Trust Score)
    │
    ▼
Risk Aggregation Engine (Missing-channel Re-normalized Risk Score)
    │
    ▼
Decision Engine (LOW | HIGH | INCONCLUSIVE)
    │
    ▼
Explainability Engine (Evidence-backed Reasons & Warnings)
    │
    ▼
FastAPI Application Layer (/analyze, /health)
```

---

## Project Structure & File Map

```text
EchoForge- Backend/
├── config.py                  # Centralized weights, thresholds, and boundary margins
├── core/                      # Core pipeline logic & deterministic processing engines
│   ├── models.py              # Data contracts (AnalysisResult, NormalizedRisk, etc.)
│   ├── normalization.py       # Normalizes raw module scores to 0-100 risk scale
│   ├── reliability.py         # Computes 0-100 evidence reliability trust score
│   ├── risk_engine.py         # Missing-channel weighted risk aggregation
│   ├── decision_engine.py     # Section J deterministic decision rules (Rules 1-5)
│   ├── explainability.py      # Surfacing human-readable reasons and warnings
│   └── pipeline.py            # Orchestrates full pipeline execution (run_pipeline / analyze)
├── adapters/                  # Non-intrusive adapters wrapping Member 1-3 modules
│   ├── result.py              # AdapterResult unified response contract
│   ├── member1_adapter.py     # Member 1 deepfake detection adapter
│   ├── member2_adapter.py     # Member 2 speaker verification adapter
│   └── member3_adapter.py     # Member 3 context analysis adapter
├── api/                       # FastAPI web application layer
│   ├── main.py                # REST API endpoints (GET /health, POST /analyze)
│   ├── schemas.py             # Pydantic request/response schemas
│   └── file_handling.py       # Audio file staging, security validation, & temp file cleanup
├── sample_audio/              # Deterministic audio fixtures for testing
├── tests/                     # Automated test suites (118 Total Tests)
│   ├── unit/                  # Unit tests for core engines (92 tests)
│   ├── integration/           # Integration tests for API layer & adapters (13 tests)
│   └── e2e/                   # Live ML model end-to-end pipeline tests (5 tests)
├── requirements.txt           # Python dependencies
└── README.md                  # System documentation & quick start guide
```

---

## Setup & Installation

### 1. Create and Activate Virtual Environment
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 2. Install Dependencies
```powershell
pip install -r requirements.txt
```

---

## Running the API Server

Start the FastAPI application with `uvicorn`:

```powershell
.\venv\Scripts\uvicorn.exe api.main:app --reload --port 8000
```

* **Interactive Swagger Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **Health Check**: `GET http://127.0.0.1:8000/health`
* **Analyze Endpoint**: `POST http://127.0.0.1:8000/analyze`

---

## API Usage & Request Examples

### `POST /analyze`

#### Upload Fields
* `audio` *(required)*: Primary test audio file (`.wav`, `.mp3`, `.flac`, `.ogg`, `.m4a`).
* `reference_audio` *(optional)*: Speaker reference audio file for speaker verification.

#### Example Request (PowerShell)
```powershell
$Form = @{
    audio = Get-Item -Path "sample_audio/genuine_sample.wav"
    reference_audio = Get-Item -Path "sample_audio/same_speaker.wav"
}
Invoke-RestMethod -Uri "http://127.0.0.1:8000/analyze" -Method Post -Form $Form
```

#### Example Request (cURL)
```bash
curl -X POST "http://127.0.0.1:8000/analyze" \
  -F "audio=@sample_audio/genuine_sample.wav" \
  -F "reference_audio=@sample_audio/same_speaker.wav"
```

#### Example Response Body
```json
{
  "request_id": "a1b2c3d4-5678-90ef-1234-56789abcdef0",
  "decision": "LOW",
  "risk_score": 12.4,
  "reliability_score": 92.5,
  "human_review_required": false,
  "reasons": [
    "Audio deepfake probability is low (12.4% risk)",
    "Claimed speaker matches reference audio"
  ],
  "warnings": [],
  "risk_breakdown": {
    "deepfake_risk": 12.4,
    "speaker_mismatch_risk": 5.0,
    "context_risk": 20.0
  },
  "evidence": {
    "member1": { "status": "ok", "data": { "raw_score": 0.124 } },
    "member2": { "status": "ok", "data": { "similarity": 0.95 } },
    "member3": { "status": "ok", "data": { "context_score": 20.0 } }
  }
}
```

#### Decision Meanings
* **`LOW`**: Audio is authentic/genuine. Aggregate risk is below the low-risk threshold (`config.LOW_RISK_THRESHOLD = 30.0`).
* **`HIGH`**: Audio is synthetic or deepfake. Aggregate risk exceeds the high-risk threshold (`config.HIGH_RISK_THRESHOLD = 70.0`).
* **`INCONCLUSIVE`**: Audio classification is uncertain. Triggered when risk falls between thresholds (30–70%), evidence reliability is below the floor (`config.RELIABILITY_FLOOR = 40.0`), or primary Member 1 evidence is unavailable.

---

## Error Handling & Security Behavior

* **Missing Required Audio** (`POST /analyze` without `audio` field) → **HTTP 422** (Unprocessable Entity).
* **Empty Audio File** (0-byte file upload) → **HTTP 400** with detail message `"Uploaded audio file is empty"`.
* **Missing Reference Audio** (`reference_audio` omitted) → **HTTP 200** with Member 2 status `"skipped"` and `speaker_mismatch_risk = null`.
* **Internal Pipeline Failure** → **HTTP 500** with sanitized generic message `"Internal server error during analysis"` (no internal stack traces or file paths exposed).
* **Filename Path Traversal Protection** → Sanitizes filenames with `os.path.basename` and stages temporary files in isolated random directories.
* **Automatic Temp File Cleanup** → Guarantees deletion of temporary upload files via context manager on both success and error exceptions.

---

## Automated Test Suite

Execute tests using `pytest` within the virtual environment:

```powershell
# 1. Run Complete Test Suite (118 Total Tests)
.\venv\Scripts\python.exe -m pytest -v

# 2. Run API Integration Suite (9 Tests)
.\venv\Scripts\python.exe -m pytest tests/integration/test_api.py -v

# 3. Run Real E2E Pipeline Suite (5 Tests)
.\venv\Scripts\python.exe -m pytest tests/e2e/test_pipeline_real.py -v
```

### Verified Test Counts
* **Unit Tests (`tests/unit/`)**: **92 PASSED**
* **Mocked Adapter Tests (`tests/integration/test_adapters_mocked.py`)**: **8 PASSED**
* **API Integration Tests (`tests/integration/test_api.py`)**: **9 PASSED**
* **Real Adapter Tests (`tests/integration/test_adapters_real.py`)**: **4 PASSED**
* **Real E2E Tests (`tests/e2e/test_pipeline_real.py`)**: **5 PASSED**
* **TOTAL**: **118 / 118 PASSED (100% PASS RATE)**

---

## Member Integrity & Compatibility Statement
* **Member 1, Member 2, and Member 3 Source Code**: Retained **100% untouched** in their original repositories.
* **Score Semantics**: Missing scores remain `None` and are never coerced to `0` or `0.0`.
* **Reliability Floor**: Enforces Section H evidence trust scoring independently from risk calculation.
