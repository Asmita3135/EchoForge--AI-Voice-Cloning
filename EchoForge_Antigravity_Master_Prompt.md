# EchoForge Frontend — Antigravity Master Prompt

Copy everything inside the fenced block below into Antigravity. Sections A–D above the fence are supporting analysis for your own reference (not meant to be pasted).

---

## A. Backend Analysis (source of truth: uploaded ZIP, verified by reading code + tests)

- **Stack:** FastAPI app (`api/main.py`), two endpoints only: `GET /health`, `POST /analyze`. No auth, no database, no WebSockets, no login system — confirmed absent from the codebase.
- **Pipeline (`core/pipeline.py`):** runs three isolated adapters (Member 1 deepfake detector, Member 2 speaker verification, Member 3 STT+context), each wrapped in its own try/except so one module failing never crashes the request. Results flow through: normalization → reliability scoring → weighted risk aggregation → decision engine → explainability.
- **Null semantics are load-bearing.** `risk_score` and each `risk_breakdown` field are `Optional[float]` and are explicitly never coerced to `0`. `reliability_score` is always a float (never null).
- **Decision thresholds (`config.py` — this is the authoritative source, the README's numbers are stale/wrong):**
  - `HIGH_THRESHOLD = 65.0`, `LOW_THRESHOLD = 35.0`, `BOUNDARY_MARGIN = 5.0`, `RELIABILITY_FLOOR = 40.0`
  - `RISK_WEIGHTS = { deepfake_risk: 0.5, speaker_mismatch_risk: 0.3, context_risk: 0.2 }` (renormalized over whichever channels are available)
- **Evidence payload is intentionally thin.** `EvidenceBlock` only has `status` (`"ok" | "error" | "skipped"`) and `raw` (the untouched dict from the module, or `null`). The adapter's internal `error_message` field is **not** exposed by the API — do not build UI that expects a specific error string from the backend for a failed module; only the status is available.
- **Member 2 (speaker verification) is optional/skippable, not failable-by-default.** If `reference_audio` is omitted, its status is `"skipped"` (not `"error"`), and `speaker_mismatch_risk` is `null`.
- **No CORS middleware is configured anywhere in this backend** (`api/main.py` has no `CORSMiddleware`), even though `.env.example` references a `CORS_ORIGINS` variable that nothing in the code reads. A frontend running on a different origin (e.g. Vite's `localhost:5173` vs the API's `localhost:8000`) **will be blocked by the browser** until CORS middleware is added on the backend. This is a genuine integration gap, not something the frontend can work around — the Antigravity prompt below tells the agent to detect this specific failure mode and surface it clearly rather than silently failing, without modifying the backend.
- **118/118 tests pass** per the README; `tests/integration/test_api.py` and `tests/e2e/test_pipeline_real.py` are the most useful references for real request/response shapes.

## B. Exact API Contract (frontend-relevant)

### `GET /health`
No params. Response:
```json
{ "status": "ok", "modules": { "member1": "ok", "member2": "ok", "member3": "ok" } }
```
This is a static liveness check — it does **not** reflect whether the ML models actually loaded successfully, only that the process is up.

### `POST /analyze`
`multipart/form-data`, fields:
| Field | Required | Type | Notes |
|---|---|---|---|
| `audio` | **Yes** | file | Primary audio under investigation |
| `reference_audio` | No | file | Claimed-speaker reference; omitting it produces `member2.status === "skipped"` |

Response (exact shape, from `api/schemas.py`):
```json
{
  "request_id": "string",
  "decision": "LOW | HIGH | INCONCLUSIVE",
  "risk_score": "number | null",
  "reliability_score": "number",
  "human_review_required": "boolean",
  "reasons": ["string"],
  "warnings": ["string"],
  "risk_breakdown": {
    "deepfake_risk": "number | null",
    "speaker_mismatch_risk": "number | null",
    "context_risk": "number | null"
  },
  "evidence": {
    "member1": { "status": "ok | error | skipped", "raw": "object | null" },
    "member2": { "status": "ok | error | skipped", "raw": "object | null" },
    "member3": { "status": "ok | error | skipped", "raw": "object | null" }
  }
}
```

Typical `evidence.member1.raw` fields when `status === "ok"` (**not schema-guaranteed — render defensively, key-by-key, never assume all are present**):
`model`, `classification` (`GENUINE|AI-GENERATED|UNCERTAIN`), `predicted_label` (`bonafide|spoof|uncertain`), `raw_score` (0–1, P(fake)), `threshold`, `confidence` (`HIGH|MODERATE|LOW`), `sample_rate_used`, `duration_sec`, `diagnostics` (`audio_valid`, `sufficient_duration`, `clipping_detected`, `mostly_silent`), `extended_diagnostics` (`clipping_ratio`, `silence_ratio`, `speech_ratio`, `rms_amplitude`, `noise_floor`, `snr_estimate_db`, `warnings[]`, `uncertainty_reasons[]`).

Typical `evidence.member2.raw` when `status === "ok"`: `similarity` (0–1 cosine similarity), `decision` (`SAME SPEAKER|DIFFERENT SPEAKER|UNCERTAIN`), `threshold` (0.6), `uncertainty_margin` (0.05), `embedding_dim`. When `status === "skipped"`, `raw` is `null`.

Typical `evidence.member3.raw` when `status === "ok"`: `transcript` (string, may be empty), `segments` (array), `context_score` (0–100), `risk_level` (`LOW|MEDIUM|HIGH`), `detected` (object — categories that were matched; note some categories can appear here with **zero** contribution to the score, this is documented upstream behavior, not a bug to "fix"), `reasons` (string array).

### Errors the frontend must handle
| Status | Trigger | Body |
|---|---|---|
| `400` | Missing filename / 0-byte `audio` file | `{"detail": "No audio file provided."}` or `{"detail": "Uploaded audio file is empty (0 bytes)."}` |
| `413` | Upload exceeds 50MB | `{"detail": "Uploaded file exceeds maximum allowed size of 50MB."}` |
| `422` | `audio` field entirely missing from the form | FastAPI's default validation error body |
| `500` | Any internal pipeline exception | `{"detail": "An internal server error occurred while processing the audio analysis."}` — generic by design, never contains internals |
| network / CORS failure | backend down, wrong URL, or CORS misconfigured | no HTTP response reaches the browser — handle via fetch's own rejection |

## C. Recommended Frontend Architecture

```
src/
  components/
    upload/          UploadDropzone, AudioPreviewPlayer, TargetVsReferenceExplainer
    status/          ConnectionStatusBadge, ProcessingState
    results/         DecisionBanner, RiskBreakdownPanel, ReliabilityMeter,
                      EvidenceSection (Member1Card, Member2Card, Member3Card, RawJsonViewer)
    common/          Button, Card, ErrorBanner, Tooltip, ExpandableSection
  pages/
    AnalysisPage.jsx  (orchestrates the whole single-page flow: idle → uploading → processing → result → error)
  services/
    echoforgeApi.js   (centralized fetch wrapper: checkHealth(), analyze(audioFile, referenceFile))
  hooks/
    useHealthCheck.js
    useAnalyze.js
  utils/
    formatRisk.js      (null → "Unavailable", not 0; number → "NN.N")
    fileValidation.js
  assets/
```
All network calls live in `services/echoforgeApi.js` only — no component issues a raw `fetch` directly. Backend base URL comes from `import.meta.env.VITE_API_BASE_URL`, never hardcoded.

## D. Recommended UI/UX Structure

Single-page flow, state machine: `idle → filesReady → analyzing → result | error`. Persistent header shows a live connection badge driven by `GET /health` (checking / connected / unavailable — polled on mount and before each analysis). Upload step distinguishes Target Audio (required, "the audio you want to verify") from Reference Audio (optional, "a known-genuine sample of the claimed speaker, used only for speaker-match comparison") with one short explanatory line, not a wall of text. Result screen leads with a large decision banner (LOW/HIGH/INCONCLUSIVE, distinct icon+treatment+copy, not color alone), then reliability score and human-review flag, then the three-channel risk breakdown (each bar shows "Unavailable" instead of 0 when null), then reasons/warnings as plain lists, then an expandable evidence section per member with human-readable summary first and a raw-JSON toggle last.

---

## E. MASTER PROMPT — copy everything below into Antigravity

```
You are building the frontend for "EchoForge — AI Voice Cloning / Deepfake Detection," an audio forensic analysis tool. The backend is already complete, verified, and out of scope for you to modify. Your only job is the frontend.

============================================================
STEP 0 — INSPECT BEFORE YOU BUILD
============================================================
Before creating any files, inspect the current workspace.
- If a frontend already exists, analyze it against everything below. Preserve any part that already meets these requirements; do not blindly overwrite working code. Only replace what's missing or wrong.
- If the workspace is empty, build the frontend from scratch using the stack specified below.
- Before writing any API-calling code, re-derive the API contract in Section 2 from first principles by treating it as fixed and authoritative — do not invent, guess, or "improve" any field, endpoint, or behavior not listed here.

============================================================
STEP 1 — STACK
============================================================
- React + Vite + JavaScript (not TypeScript)
- Plain CSS (no CSS framework)
- lucide-react for icons where useful
- No state management library, no UI kit, no CSS-in-JS — keep dependencies minimal
- Backend base URL must come from an environment variable: VITE_API_BASE_URL, read via import.meta.env.VITE_API_BASE_URL. Create a `.env` file (or `.env.example`) containing:
    VITE_API_BASE_URL=http://127.0.0.1:8000
  Never hardcode the backend URL anywhere else in the codebase.

============================================================
STEP 2 — EXACT BACKEND API CONTRACT (AUTHORITATIVE — DO NOT DEVIATE)
============================================================
This backend has exactly two endpoints. Nothing else exists. Do not assume authentication, a database, WebSockets, streaming responses, or pagination — none of that is present.

--- GET /health ---
No parameters. Returns:
{ "status": "ok", "modules": { "member1": "ok", "member2": "ok", "member3": "ok" } }
This is a liveness check only — it does not guarantee the ML pipeline itself will succeed on the next /analyze call. Poll this on app load and use it to drive a connection-status indicator with three states: checking, connected, unavailable. Never let the UI look "ready to analyze" while this call has failed or not yet resolved.

--- POST /analyze ---
Content-Type: multipart/form-data
Fields:
  - audio (REQUIRED, file) — the primary audio under investigation
  - reference_audio (OPTIONAL, file) — a reference sample of the claimed speaker, used only for speaker-match verification

Success response (HTTP 200), EXACT shape — treat every field name and nesting level as fixed:
{
  "request_id": "string",
  "decision": "LOW" | "HIGH" | "INCONCLUSIVE",
  "risk_score": number | null,
  "reliability_score": number,               // always present, never null
  "human_review_required": boolean,
  "reasons": [string, ...],
  "warnings": [string, ...],
  "risk_breakdown": {
    "deepfake_risk": number | null,
    "speaker_mismatch_risk": number | null,
    "context_risk": number | null
  },
  "evidence": {
    "member1": { "status": "ok" | "error" | "skipped", "raw": object | null },
    "member2": { "status": "ok" | "error" | "skipped", "raw": object | null },
    "member3": { "status": "ok" | "error" | "skipped", "raw": object | null }
  }
}

CRITICAL NULL-HANDLING RULE (non-negotiable, test explicitly for this):
Wherever a numeric field can be null (risk_score, risk_breakdown.deepfake_risk, risk_breakdown.speaker_mismatch_risk, risk_breakdown.context_risk), a null value MUST be rendered as "Unavailable" (or equivalent explanatory text) — NEVER as 0, NEVER as an empty bar, NEVER silently omitted without explanation. A null speaker_mismatch_risk combined with evidence.member2.status === "skipped" must be explained to the user as: speaker verification was skipped because no reference audio was provided — this is not a failure, it's an expected state when reference_audio was omitted.

evidence[member].raw fields are NOT schema-guaranteed by the backend and must be rendered defensively (check each key exists before displaying it; never crash or blank the whole card if one sub-field is missing). Do not invent fields that aren't in these lists. Typical fields you may see (render only what's actually present in the response, and only in a human-readable way first, with raw JSON available behind an expandable/collapsible toggle, never dumped directly onto the main screen):

  member1 (Deepfake Detection) — when status is "ok", raw MAY include: model, classification ("GENUINE"|"AI-GENERATED"|"UNCERTAIN"), predicted_label ("bonafide"|"spoof"|"uncertain"), raw_score (0–1, probability the audio is fake), threshold, confidence ("HIGH"|"MODERATE"|"LOW"), sample_rate_used, duration_sec, diagnostics { audio_valid, sufficient_duration, clipping_detected, mostly_silent }, extended_diagnostics { clipping_ratio, silence_ratio, speech_ratio, rms_amplitude, noise_floor, snr_estimate_db, warnings[], uncertainty_reasons[] }.

  member2 (Speaker Verification) — when status is "ok", raw MAY include: similarity (0–1 cosine similarity), decision ("SAME SPEAKER"|"DIFFERENT SPEAKER"|"UNCERTAIN"), threshold, uncertainty_margin, embedding_dim. When status is "skipped", raw is null — this means no reference_audio was uploaded, not an error. Display this distinctly from an error state.

  member3 (Context Analysis) — when status is "ok", raw MAY include: transcript (string, can be empty), segments (array), context_score (0–100), risk_level ("LOW"|"MEDIUM"|"HIGH"), detected (object of matched categories — note: a category can appear here even if it didn't move the score; don't claim every entry in `detected` drove the risk, only surface what the backend's own `reasons` array says), reasons (string array).

evidence.status === "error" ONLY tells you the module failed — the API does NOT return a specific error message for a failed module (there is no error string field in the evidence response). Do not fabricate one. Show a generic "this module could not produce a result" state for status "error".

--- Error responses to handle explicitly ---
  400  — missing/empty audio file. Body: {"detail": "..."} — show the detail message in a friendly banner.
  413  — file exceeds 50MB. Show a clear "file too large, max 50MB" message.
  422  — the `audio` form field was omitted entirely (shouldn't normally happen if your upload UI enforces it client-side too, but handle it).
  500  — internal server error. Body: {"detail": "An internal server error occurred while processing the audio analysis."} — this message is intentionally generic; display it as-is, do not try to extract more detail, do not show a stack trace.
  Network / CORS failure — fetch() throws or the request never completes. This backend currently has no CORS middleware configured. If you get a network-level failure (not an HTTP error response) when the frontend and backend are on different origins/ports, detect this and show a distinct message such as: "Could not reach the analysis backend. If you're running the frontend and backend on different ports, the backend needs CORS enabled to allow browser requests — this is a backend-side configuration issue, not something fixable from the frontend." Do not silently retry forever or hang on a spinner.

Never manually compute risk_score, reliability_score, decision, or any risk_breakdown value on the frontend. These come exclusively from the backend response. Do not build a fake progress percentage — while /analyze is in flight, show an indeterminate "processing" state (with rotating stage labels like "Uploading audio…", "Running analysis…" is acceptable copy, but do not imply real progress percentages since the backend gives none).

============================================================
STEP 3 — APPLICATION ARCHITECTURE
============================================================
Use this structure (adapt only if genuinely necessary):
src/
  components/
    upload/        UploadDropzone.jsx, AudioPreviewPlayer.jsx, TargetVsReferenceExplainer.jsx
    status/        ConnectionStatusBadge.jsx, ProcessingState.jsx
    results/       DecisionBanner.jsx, RiskBreakdownPanel.jsx, ReliabilityMeter.jsx,
                    EvidenceSection.jsx, Member1Card.jsx, Member2Card.jsx, Member3Card.jsx, RawJsonViewer.jsx
    common/        Button.jsx, Card.jsx, ErrorBanner.jsx, ExpandableSection.jsx
  pages/
    AnalysisPage.jsx
  services/
    echoforgeApi.js   -- ALL fetch() calls to the backend live here and nowhere else:
                         checkHealth(), analyzeAudio(audioFile, referenceAudioFile)
  hooks/
    useHealthCheck.js
    useAnalyze.js
  utils/
    formatRisk.js     -- central helper: formats a number|null as either "NN.N" or "Unavailable"; used by every place a risk number is rendered so the null rule can never be violated inconsistently
    fileValidation.js -- basic client-side checks (non-empty, reasonable audio type, under 50MB) BEFORE hitting the network, as a UX nicety — the backend remains the source of truth for validation
  assets/

Keep API logic out of components. Components call hooks; hooks call services/echoforgeApi.js.

============================================================
STEP 4 — COMPLETE USER FLOW (single page app, state machine)
============================================================
States: idle -> filesReady -> analyzing -> result -> error (error can return to idle/filesReady)

1. Landing/analysis screen: shows product name/branding, a live connection status badge (checking/connected/unavailable, from GET /health polled on load), and the upload interface.
2. Upload target audio (required): drag-and-drop + file picker, show filename, and an audio preview player once selected. Allow remove/replace.
3. Upload reference audio (optional): same interface, clearly labeled optional, with one short line explaining it enables speaker-match verification and is skipped if omitted — do not overwhelm with detail.
4. Client-side validation: reject obviously invalid files (0 bytes, non-audio extension) before allowing "Start Analysis" to be pressed; this is a UX convenience only, never a substitute for handling the backend's own validation errors.
5. Start analysis button, disabled while backend is "unavailable" or no target audio is selected.
6. Processing state: professional, calm loading UI (no fake percentages, no fake per-module ticking checklist implying real-time module progress you don't actually have — a single honest indeterminate state is correct, since the backend returns one synchronous response).
7. Await the real POST /analyze response.
8. Result screen — decision banner first:
   - LOW: reassuring/trustworthy visual treatment (e.g. calm green-adjacent tone), clear "no significant risk detected" framing
   - HIGH: warning/threat visual treatment (e.g. red/alert tone), clear "high risk of synthetic/manipulated audio" framing
   - INCONCLUSIVE: caution/review visual treatment (distinct from both — e.g. amber/neutral), clear "results require human review, evidence was insufficient or ambiguous" framing
   Never rely on color alone — pair each state with a distinct icon and label text.
9. Below the banner: reliability_score and human_review_required, explained in plain language (reliability is about evidence trustworthiness, not about how risky the audio is — do not conflate the two).
10. Risk breakdown panel: three rows/bars for Deepfake Risk, Speaker Mismatch Risk, Context Risk. Any null value renders as "Unavailable" with a one-line reason (e.g. "Speaker verification skipped — no reference audio provided" for a null speaker_mismatch_risk when member2 was skipped).
11. Reasons and warnings: render both arrays as plain, readable lists (skip rendering an empty array as an empty box — either hide the section or show a neutral "no additional warnings" note).
12. Evidence section: three expandable cards (Member 1 — Deepfake Detection, Member 2 — Speaker Verification, Member 3 — Context Analysis). Each shows a short human-readable summary first (built from the fields listed in Step 2), and a "View raw data" expandable subsection with the raw JSON pretty-printed (never dumped unformatted onto the main screen). Handle each of "ok" / "error" / "skipped" with visually distinct, clearly labeled states.
13. "Analyze another file" action that fully resets state back to step 2/3.

============================================================
STEP 5 — VISUAL DESIGN DIRECTION
============================================================
This must feel like a serious AI security / audio forensics product, not a generic dashboard or student project.
- Think: modern cybersecurity tool, audio-waveform/signal-inspired visual language, strong typographic hierarchy, clean cards, restrained motion.
- A sophisticated dark UI (or a clean light/dark pair) with a small, deliberate accent-color palette works well for this domain. Avoid excessive gradients, excessive glassmorphism, neon colors, oversized decorative elements, and generic admin-dashboard templates.
- Subtle, purposeful animation only (e.g. a waveform-like processing indicator) — never decorative-only motion.
- Maintain strong hierarchy: decision result is always the most visually dominant element on the result screen.

============================================================
STEP 6 — RESPONSIVE & ACCESSIBLE
============================================================
- Must work cleanly on desktop, laptop, tablet, and mobile — no desktop-only layouts, fixed-pixel-width containers, or horizontal scroll traps.
- All interactive elements keyboard-accessible, use semantic HTML buttons/inputs (not divs with onClick), proper form labels, visible focus states, sufficient color contrast, and meaningful aria-labels on icon-only controls (e.g. remove-file buttons).

============================================================
STEP 7 — WHAT NOT TO DO
============================================================
- Do not modify, redesign, or suggest changes to the backend, EXCEPT: if you hit the CORS failure mode described in Step 2, surface it in the UI as instructed — do not attempt to "fix" it by adding a proxy hack that masks the real issue, and do not silently swallow the error.
- Do not add authentication, a database, WebSockets, or any backend feature not present in the actual code.
- Do not invent API fields, endpoints, or response values not listed in Step 2.
- Do not use mock/fake/hardcoded analysis results anywhere, including for "demo mode" — every result on screen must come from a real POST /analyze response.
- Do not coerce any null risk value to 0.
- Do not fabricate progress percentages during analysis.
- Do not expose raw backend error text beyond the `detail` string the API actually returns.

============================================================
STEP 8 — VERIFICATION CHECKLIST (confirm each before considering the task done)
============================================================
1. Frontend builds successfully (production build).
2. Backend health status (checking/connected/unavailable) renders correctly against a real GET /health call.
3. Target audio upload (drag-drop and file picker) works, with preview.
4. Reference audio upload works, with preview, and can be removed to fall back to "skipped" behavior.
5. Analysis with target audio only succeeds and renders correctly (member2 shows "skipped", speaker_mismatch_risk shows "Unavailable").
6. Analysis with target + reference audio succeeds and renders correctly (member2 shows a real similarity/decision).
7. A LOW decision renders with the correct distinct visual treatment.
8. A HIGH decision renders with the correct distinct visual treatment.
9. An INCONCLUSIVE decision renders with the correct distinct visual treatment.
10. A null risk_score renders as "Unavailable", never 0.
11. A null speaker_mismatch_risk renders as "Unavailable" with the skipped-reference explanation, never 0.
12. Member 2 "skipped" state is visually distinct from its "error" state.
13. Backend 400/413/422/500 responses each produce a distinct, user-friendly message (no raw JSON/stack traces shown).
14. Backend-offline / network-failure / CORS-failure state is handled with a clear message, not an infinite spinner.
15. Evidence sections reflect exactly what's in the real backend response for each of the three members — no fields invented.
16. Zero mock/fake data anywhere in the shipped code path.
17. Production build succeeds with the final code.

Build the complete frontend now, following every rule above.
```
