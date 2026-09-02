import React from 'react';
import { Card } from '../common/Card';
import { ShieldCheck, UserCheck, AlertCircle, HelpCircle } from 'lucide-react';
import { formatProbabilityScore } from '../../utils/formatRisk';

/**
 * Visual meter for reliability_score and human_review_required status.
 */
export function ReliabilityMeter({ reliabilityScore, humanReviewRequired }) {
  // reliability_score comes as float 0-100 or 0-1 from backend (typically 0-100).
  const scoreValue = typeof reliabilityScore === 'number' ? (reliabilityScore > 1 ? reliabilityScore : reliabilityScore * 100) : 0;
  const formattedScore = `${scoreValue.toFixed(1)}%`;

  const getReliabilityColor = (val) => {
    if (val >= 80) return 'meter-fill-cyan';
    if (val >= 50) return 'meter-fill-amber';
    return 'meter-fill-red';
  };

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={18} style={{ color: 'var(--accent-cyan)' }} />
          <span>Evidence Reliability & Review Status</span>
        </h3>
        
        <div className={`review-pill ${humanReviewRequired ? 'required' : 'not-required'}`}>
          {humanReviewRequired ? (
            <>
              <AlertCircle size={14} />
              <span>Human Review Required</span>
            </>
          ) : (
            <>
              <UserCheck size={14} />
              <span>Automated Confidence Sufficient</span>
            </>
          )}
        </div>
      </div>

      <div className="meter-header">
        <span className="meter-label">Evidence Reliability Score</span>
        <span className="meter-value" style={{ color: 'var(--accent-cyan)' }}>{formattedScore}</span>
      </div>

      <div className="meter-track" role="progressbar" aria-valuenow={scoreValue} aria-valuemin={0} aria-valuemax={100} aria-label="Evidence Reliability">
        <div className={`meter-fill ${getReliabilityColor(scoreValue)}`} style={{ width: `${Math.min(100, Math.max(0, scoreValue))}%` }} />
      </div>

      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '0.5rem' }}>
        <strong style={{ color: 'var(--text-primary)' }}>What this means:</strong> Reliability reflects the coverage and acoustic quality of the forensic evidence evaluated. It indicates how much you can trust the decision — <em>not</em> the risk level of the file itself.
      </p>
    </Card>
  );
}
