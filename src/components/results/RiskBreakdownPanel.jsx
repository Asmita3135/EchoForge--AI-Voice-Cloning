import React from 'react';
import { Card } from '../common/Card';
import { BarChart3, HelpCircle } from 'lucide-react';
import { formatRiskScore, getNullRiskExplanation } from '../../utils/formatRisk';

/**
 * Renders the three risk breakdown rows (deepfake_risk, speaker_mismatch_risk, context_risk).
 * Strictly enforces null rendering as "Unavailable" with explanatory context.
 */
export function RiskBreakdownPanel({ riskBreakdown = {}, evidence = {} }) {
  const items = [
    {
      key: 'deepfake_risk',
      label: 'Deepfake & Synthetic Risk',
      value: riskBreakdown?.deepfake_risk,
      fillClass: 'meter-fill-red',
    },
    {
      key: 'speaker_mismatch_risk',
      label: 'Speaker Mismatch Risk',
      value: riskBreakdown?.speaker_mismatch_risk,
      fillClass: 'meter-fill-amber',
    },
    {
      key: 'context_risk',
      label: 'Context & Linguistic Risk',
      value: riskBreakdown?.context_risk,
      fillClass: 'meter-fill-cyan',
    },
  ];

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 size={18} style={{ color: 'var(--accent-cyan)' }} />
          <span>Risk Factor Breakdown</span>
        </h3>
        <span className="mono-text" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Weighted Multi-Vector Channels
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {items.map((item) => {
          const isNull = item.value === null || item.value === undefined;
          const formattedVal = formatRiskScore(item.value);
          const numericVal = !isNull && typeof item.value === 'number' ? Math.min(100, Math.max(0, item.value)) : 0;
          const explanation = isNull ? getNullRiskExplanation(item.key, evidence) : null;

          return (
            <div key={item.key} style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="meter-header">
                <span className="meter-label">{item.label}</span>
                <span
                  className="meter-value"
                  style={{
                    color: isNull ? 'var(--text-muted)' : 'var(--text-primary)',
                    fontStyle: isNull ? 'italic' : 'normal',
                  }}
                >
                  {formattedVal}
                </span>
              </div>

              {isNull ? (
                <div
                  style={{
                    height: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    borderRadius: '5px',
                    border: '1px stroke var(--border-subtle)',
                    marginBottom: '0.3rem',
                  }}
                />
              ) : (
                <div
                  className="meter-track"
                  role="progressbar"
                  aria-valuenow={numericVal}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={item.label}
                >
                  <div className={`meter-fill ${item.fillClass}`} style={{ width: `${numericVal}%` }} />
                </div>
              )}

              {isNull && explanation && (
                <div className="null-risk-note">
                  {explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
