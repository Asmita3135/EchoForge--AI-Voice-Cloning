import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

/**
 * Renders the primary Verdict Card based on backend decision mapping.
 * LOW         -> "Low Risk"       / "This call seems low risk."
 * HIGH        -> "High Risk"      / "Be careful — this call shows signs of a possible scam."
 * INCONCLUSIVE -> "Uncertain Result" / "We're not sure about this call."
 *
 * Props are identical to the original — no backend data flow changed.
 */
export function DecisionBanner({ decision, riskScore, requestId }) {
  const getDecisionConfig = () => {
    switch (decision) {
      case 'LOW':
        return {
          headline:    'This call seems low risk.',
          icon:        <ShieldCheck size={28} strokeWidth={2} />,
          badgeLabel:  'LOW RISK',
          scoreContext:'Low Confidence',
          desc:        'EchoForge found no major voice cloning, speaker mismatch, or scam context indicators in this recording.',
          className:   'verdict-low',
        };
      case 'HIGH':
        return {
          headline:    'Be careful — this call shows signs of a possible scam.',
          icon:        <ShieldAlert size={28} strokeWidth={2} />,
          badgeLabel:  'HIGH RISK',
          scoreContext:'High Risk Detected',
          desc:        'Our analysis detected significant risk indicators, such as synthetic voice characteristics, speaker mismatch, or urgent scam context.',
          className:   'verdict-high',
        };
      case 'INCONCLUSIVE':
      default:
        return {
          headline:    "We're not sure about this call.",
          icon:        <AlertTriangle size={28} strokeWidth={2} />,
          badgeLabel:  'UNCERTAIN RESULT',
          scoreContext:'Confidence: Uncertain',
          desc:        'Some signals conflict or there was insufficient clear audio evidence for a confident verdict.',
          className:   'verdict-inconclusive',
        };
    }
  };

  const config = getDecisionConfig();

  // Preserve original fallback (50) when score is not a number
  const displayScore = typeof riskScore === 'number' ? Math.round(riskScore) : 50;

  // Clamp thumb position so it never overflows the track edges
  const thumbPct = Math.min(Math.max(displayScore, 4), 96);

  return (
    <div
      className={`verdict-card ${config.className}`}
      role="region"
      aria-label="Security Verdict Result"
    >

      {/* ── TOP ROW: icon + content + score ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', width: '100%' }}>

        {/* Circular icon */}
        <div className="verdict-icon-box" aria-hidden="true">
          {config.icon}
        </div>

        {/* Left: badge + headline + description */}
        <div className="verdict-content">
          <div className="verdict-badge">{config.badgeLabel}</div>
          <h2 className="verdict-headline">{config.headline}</h2>
          <p className="verdict-desc">{config.desc}</p>
        </div>

        {/* Right: score column */}
        <div className="verdict-score-box" aria-label={`Risk score: ${displayScore} out of 100`}>
          <span className="verdict-score-label">Risk Assessment</span>
          <span className="verdict-score-num">
            {displayScore}
            <span className="verdict-score-max">/100</span>
          </span>
          <span className="verdict-score-context">{config.scoreContext}</span>
        </div>

      </div>

      {/* ── DIVIDER ── */}
      <div className="verdict-divider" />

      {/* ── POLISHED RISK SCALE ── */}
      <div className="verdict-risk-scale">

        {/* Segmented track */}
        <div
          className="verdict-risk-scale-track"
          role="meter"
          aria-valuenow={displayScore}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Risk level: ${displayScore} out of 100`}
        >
          <div
            className="verdict-risk-thumb"
            style={{ left: `${thumbPct}%` }}
          />
        </div>

        {/* Labels: LOW / MODERATE / HIGH */}
        <div className="verdict-risk-scale-labels">
          <span>Low</span>
          <span>Moderate</span>
          <span>High</span>
        </div>

      </div>

    </div>
  );
}
