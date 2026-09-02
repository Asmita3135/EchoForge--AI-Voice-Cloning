import React from 'react';
import { useHealthCheck } from '../hooks/useHealthCheck';
import { useAnalyze } from '../hooks/useAnalyze';
import { ConnectionStatusBadge } from '../components/status/ConnectionStatusBadge';
import { ProcessingState } from '../components/status/ProcessingState';
import { UploadDropzone } from '../components/upload/UploadDropzone';
import { TargetVsReferenceExplainer } from '../components/upload/TargetVsReferenceExplainer';
import { DecisionBanner } from '../components/results/DecisionBanner';
import { ReliabilityMeter } from '../components/results/ReliabilityMeter';
import { RiskBreakdownPanel } from '../components/results/RiskBreakdownPanel';
import { EvidenceSection } from '../components/results/EvidenceSection';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { Play, RotateCcw, Activity, ShieldAlert, Sparkles } from 'lucide-react';

export function AnalysisPage() {
  const { healthStatus, errorMessage: healthError, refetchHealth } = useHealthCheck();
  const {
    targetFile,
    setTargetFile,
    referenceFile,
    setReferenceFile,
    status,
    result,
    error,
    fileValidationError,
    runAnalysis,
    resetAnalysis,
  } = useAnalyze();

  const isBackendReady = healthStatus === 'connected';
  const canAnalyze = isBackendReady && targetFile && status !== 'analyzing';

  return (
    <div className="app-container">
      {/* Navbar / Header */}
      <header className="app-header">
        <div className="brand-logo">
          <div className="brand-icon-wrapper">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="brand-title">
              EchoForge
              <span className="mono-text" style={{ fontSize: '0.7rem', opacity: 0.6, letterSpacing: '0.1em' }}>
                v1.0 FORENSIC
              </span>
            </h1>
            <span className="brand-subtitle">AI Voice Cloning & Deepfake Detection Suite</span>
          </div>
        </div>

        {/* Live Liveness Status Badge */}
        <ConnectionStatusBadge status={healthStatus} onRetry={refetchHealth} />
      </header>

      {/* Backend Offline / Liveness Warning Banner */}
      {healthStatus === 'unavailable' && (
        <ErrorBanner
          title="Backend Service Unavailable"
          error={healthError || 'The analysis backend could not be reached.'}
        />
      )}

      {/* Client-Side File Validation Banner */}
      {fileValidationError && (
        <ErrorBanner
          title="File Upload Notice"
          error={fileValidationError}
        />
      )}

      {/* API Execution Error Banner */}
      {status === 'error' && error && (
        <ErrorBanner
          title="Analysis Failed"
          error={error}
          onDismiss={() => {}}
        />
      )}

      {/* MAIN CONTENT AREA */}

      {/* STATE 1: IDLE / FILES READY -> SHOW UPLOAD INTERFACE */}
      {(status === 'idle' || status === 'filesReady' || status === 'error') && (
        <main style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <TargetVsReferenceExplainer />

          <Card>
            <div className="upload-grid">
              {/* Target Audio Upload (Required) */}
              <UploadDropzone
                id="target-audio-input"
                title="Target Audio File"
                subtitle="Upload the suspect audio file under investigation"
                file={targetFile}
                onFileSelect={setTargetFile}
                onFileRemove={() => setTargetFile(null)}
                isRequired={true}
                badgeText="PRIMARY TARGET"
              />

              {/* Reference Audio Upload (Optional) */}
              <UploadDropzone
                id="reference-audio-input"
                title="Speaker Reference Audio"
                subtitle="Upload authentic voice sample for speaker comparison"
                file={referenceFile}
                onFileSelect={setReferenceFile}
                onFileRemove={() => setReferenceFile(null)}
                isRequired={false}
                badgeText="BIOMETRIC COMPARISON"
              />
            </div>

            {/* Action Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '2rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--border-subtle)',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {!targetFile ? (
                  <span>Select a primary target audio file to enable forensic analysis.</span>
                ) : !isBackendReady ? (
                  <span style={{ color: 'var(--color-high)' }}>
                    Analysis disabled while backend is offline or checking connection status.
                  </span>
                ) : (
                  <span style={{ color: 'var(--color-low)' }}>
                    Target audio ready. {referenceFile ? 'Speaker reference attached.' : 'Reference audio omitted (Member 2 will be skipped).'}
                  </span>
                )}
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={runAnalysis}
                disabled={!canAnalyze}
                icon={Sparkles}
              >
                Start Forensic Analysis
              </Button>
            </div>
          </Card>
        </main>
      )}

      {/* STATE 2: ANALYZING -> SHOW FORENSIC PROCESSING LOADER */}
      {status === 'analyzing' && (
        <main>
          <ProcessingState />
        </main>
      )}

      {/* STATE 3: RESULT -> SHOW DASHBOARD RESULTS */}
      {status === 'result' && result && (
        <main style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top Reset Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="mono-text" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              ANALYSIS RESULT DASHBOARD
            </span>
            <Button variant="secondary" size="sm" onClick={resetAnalysis} icon={RotateCcw}>
              Analyze Another File
            </Button>
          </div>

          {/* 1. Visually Dominant Decision Banner */}
          <DecisionBanner
            decision={result.decision}
            riskScore={result.risk_score}
            requestId={result.request_id}
          />

          {/* 2. Secondary Metrics Grid */}
          <div className="results-grid">
            {/* Reliability & Review Status */}
            <ReliabilityMeter
              reliabilityScore={result.reliability_score}
              humanReviewRequired={result.human_review_required}
            />

            {/* Risk Breakdown Panel with Strict Null Handling */}
            <RiskBreakdownPanel
              riskBreakdown={result.risk_breakdown}
              evidence={result.evidence}
            />
          </div>

          {/* 3. Evidence Matrix, Reasons, Warnings, Raw JSON */}
          <EvidenceSection
            evidence={result.evidence}
            reasons={result.reasons}
            warnings={result.warnings}
          />

          {/* Bottom Reset Button */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
            <Button variant="primary" size="lg" onClick={resetAnalysis} icon={RotateCcw}>
              Analyze Another Audio File
            </Button>
          </div>
        </main>
      )}
    </div>
  );
}
