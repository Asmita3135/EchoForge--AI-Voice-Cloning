import React from 'react';
import { Card } from '../common/Card';
import { UserCheck, Info } from 'lucide-react';
import { formatProbabilityScore } from '../../utils/formatRisk';
import { RawJsonViewer } from './RawJsonViewer';

/**
 * Member 2 Evidence Card — Speaker Match Verification.
 * Visually distinguishes 'skipped' (no reference audio) from 'error' or 'ok'.
 */
export function Member2Card({ memberData }) {
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
            <UserCheck size={16} style={{ color: 'var(--accent-blue)' }} />
            <span>Member 2: Speaker Verification</span>
          </h4>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vocal Biometric Embedding Similarity</div>
        </div>
        {renderStatusPill()}
      </div>

      {status === 'skipped' && (
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '6px',
            padding: '0.85rem',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
          }}
        >
          <Info size={16} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Speaker verification skipped — no reference audio provided.</strong>
            <p style={{ marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Upload an authentic speaker reference audio file to enable vocal biometric comparison between target and claimed speaker.
            </p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div style={{ fontSize: '0.85rem', color: 'var(--color-high)', fontStyle: 'italic', padding: '0.5rem 0' }}>
          This module could not produce a result due to an internal processing error.
        </div>
      )}

      {status === 'ok' && raw && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {raw.decision && (
            <div className="metric-row">
              <span className="metric-key">Speaker Match Decision</span>
              <span
                className="metric-val"
                style={{
                  color:
                    raw.decision === 'SAME SPEAKER'
                      ? 'var(--color-low)'
                      : raw.decision === 'DIFFERENT SPEAKER'
                      ? 'var(--color-high)'
                      : 'var(--color-inconclusive)',
                  fontWeight: 700,
                }}
              >
                {raw.decision}
              </span>
            </div>
          )}

          {raw.similarity !== undefined && raw.similarity !== null && (
            <div className="metric-row">
              <span className="metric-key">Embedding Cosine Similarity</span>
              <span className="metric-val">{formatProbabilityScore(raw.similarity)}</span>
            </div>
          )}

          {raw.threshold !== undefined && raw.threshold !== null && (
            <div className="metric-row">
              <span className="metric-key">Decision Threshold</span>
              <span className="metric-val">{raw.threshold}</span>
            </div>
          )}

          {raw.embedding_dim !== undefined && raw.embedding_dim !== null && (
            <div className="metric-row">
              <span className="metric-key">Embedding Dimension</span>
              <span className="metric-val">{raw.embedding_dim}-D</span>
            </div>
          )}
        </div>
      )}

      {/* Raw JSON expandable accordion */}
      {raw && <RawJsonViewer data={raw} title="View Raw Member 2 Payload" />}
    </Card>
  );
}
