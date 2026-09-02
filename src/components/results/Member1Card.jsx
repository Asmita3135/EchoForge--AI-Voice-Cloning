import React from 'react';
import { Card } from '../common/Card';
import { Cpu, CheckCircle, AlertTriangle, MinusCircle } from 'lucide-react';
import { formatProbabilityScore, formatDuration } from '../../utils/formatRisk';
import { RawJsonViewer } from './RawJsonViewer';

/**
 * Member 1 Evidence Card — Deepfake & Synthetic Voice Classifier.
 * Renders defensively: only displays keys that actually exist in response.
 */
export function Member1Card({ memberData }) {
  const status = memberData?.status || 'skipped';
  const raw = memberData?.raw || null;

  const renderStatusPill = () => {
    switch (status) {
      case 'ok':
        return <span className="evidence-status-pill ok">OK / Complete</span>;
      case 'error':
        return <span className="evidence-status-pill error">Module Error</span>;
      case 'skipped':
      default:
        return <span className="evidence-status-pill skipped">Skipped</span>;
    }
  };

  return (
    <Card>
      <div className="evidence-card-header">
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Cpu size={16} style={{ color: 'var(--accent-cyan)' }} />
            <span>Member 1: Deepfake Detection</span>
          </h4>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Neural Acoustic Artifact Classifier</div>
        </div>
        {renderStatusPill()}
      </div>

      {status === 'error' && (
        <div style={{ fontSize: '0.85rem', color: 'var(--color-high)', fontStyle: 'italic', padding: '0.5rem 0' }}>
          This module could not produce a result due to an internal processing error.
        </div>
      )}

      {status === 'skipped' && (
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.5rem 0' }}>
          Deepfake detection analysis was skipped.
        </div>
      )}

      {status === 'ok' && raw && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {raw.model && (
            <div className="metric-row">
              <span className="metric-key">Model Architecture</span>
              <span className="metric-val">{raw.model}</span>
            </div>
          )}

          {raw.classification && (
            <div className="metric-row">
              <span className="metric-key">Classification</span>
              <span
                className="metric-val"
                style={{
                  color:
                    raw.classification === 'AI-GENERATED'
                      ? 'var(--color-high)'
                      : raw.classification === 'GENUINE'
                      ? 'var(--color-low)'
                      : 'var(--color-inconclusive)',
                  fontWeight: 700,
                }}
              >
                {raw.classification}
              </span>
            </div>
          )}

          {raw.confidence && (
            <div className="metric-row">
              <span className="metric-key">Confidence</span>
              <span className="metric-val">{raw.confidence}</span>
            </div>
          )}

          {raw.raw_score !== undefined && raw.raw_score !== null && (
            <div className="metric-row">
              <span className="metric-key">Synthetic Probability (P_fake)</span>
              <span className="metric-val">{formatProbabilityScore(raw.raw_score)}</span>
            </div>
          )}

          {raw.duration_sec !== undefined && raw.duration_sec !== null && (
            <div className="metric-row">
              <span className="metric-key">Duration Analyzed</span>
              <span className="metric-val">{formatDuration(raw.duration_sec)}</span>
            </div>
          )}

          {/* Extended Diagnostics summary if available */}
          {raw.extended_diagnostics?.snr_estimate_db !== undefined && (
            <div className="metric-row">
              <span className="metric-key">SNR Estimate</span>
              <span className="metric-val">{raw.extended_diagnostics.snr_estimate_db.toFixed(1)} dB</span>
            </div>
          )}

          {raw.diagnostics && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>Acoustic Diagnostics:</div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {raw.diagnostics.clipping_detected !== undefined && (
                  <span>Clipping: {raw.diagnostics.clipping_detected ? 'Yes ⚠️' : 'No'}</span>
                )}
                {raw.diagnostics.mostly_silent !== undefined && (
                  <span>Silent: {raw.diagnostics.mostly_silent ? 'Yes ⚠️' : 'No'}</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Raw JSON expandable accordion */}
      {raw && <RawJsonViewer data={raw} title="View Raw Member 1 Payload" />}
    </Card>
  );
}
