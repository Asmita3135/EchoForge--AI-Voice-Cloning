import React from 'react';
import { Card } from '../common/Card';
import { MessageSquareText, FileText } from 'lucide-react';
import { RawJsonViewer } from './RawJsonViewer';
import { ExpandableSection } from '../common/ExpandableSection';

/**
 * Member 3 Evidence Card — Speech-to-Text & Transcript Context Analysis.
 * Safely renders transcript snippet and detected categories.
 */
export function Member3Card({ memberData }) {
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
            <MessageSquareText size={16} style={{ color: 'var(--color-inconclusive)' }} />
            <span>Member 3: Context Analysis</span>
          </h4>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>STT Transcript & Social Engineering Risk</div>
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
          Context analysis was skipped.
        </div>
      )}

      {status === 'ok' && raw && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {raw.risk_level && (
            <div className="metric-row">
              <span className="metric-key">Context Risk Level</span>
              <span
                className="metric-val"
                style={{
                  color:
                    raw.risk_level === 'HIGH'
                      ? 'var(--color-high)'
                      : raw.risk_level === 'MEDIUM'
                      ? 'var(--color-inconclusive)'
                      : 'var(--color-low)',
                  fontWeight: 700,
                }}
              >
                {raw.risk_level}
              </span>
            </div>
          )}

          {raw.context_score !== undefined && raw.context_score !== null && (
            <div className="metric-row">
              <span className="metric-key">Linguistic Risk Score</span>
              <span className="metric-val">{Number(raw.context_score).toFixed(1)} / 100</span>
            </div>
          )}

          {/* Transcript Display */}
          {raw.transcript !== undefined && (
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <FileText size={14} />
                <span>Extracted Audio Transcript:</span>
              </div>
              <div
                style={{
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '0.75rem',
                  fontSize: '0.85rem',
                  color: raw.transcript ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontStyle: raw.transcript ? 'normal' : 'italic',
                  maxHeight: '120px',
                  overflowY: 'auto',
                  lineHeight: '1.4',
                }}
              >
                {raw.transcript ? `"${raw.transcript}"` : '[No intelligible speech detected or transcript empty]'}
              </div>
            </div>
          )}

          {/* Matched Categories */}
          {raw.detected && Object.keys(raw.detected).length > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.3rem' }}>
                Matched Linguistic Patterns:
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {Object.entries(raw.detected).map(([category, details]) => (
                  <span
                    key={category}
                    className="mono-text"
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Raw JSON expandable accordion */}
      {raw && <RawJsonViewer data={raw} title="View Raw Member 3 Payload" />}
    </Card>
  );
}
