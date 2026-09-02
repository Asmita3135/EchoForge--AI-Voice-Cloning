import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, Radio } from 'lucide-react';

/**
 * Feature 5: Scam Intent Radar
 * Visualizes conversational social-engineering attack vectors with center risk score
 * and perimeter signal contributions.
 */
export function ScamIntentRadar({
  overallScore = 87,
  riskLevel = 'HIGH',
  signals = [
    { key: 'impersonation', label: 'Impersonation', value: 85, weight: '+22' },
    { key: 'urgency', label: 'Urgency Tactic', value: 90, weight: '+18' },
    { key: 'otp', label: 'OTP / PIN Request', value: 95, weight: '+26' },
    { key: 'money', label: 'Money Transfer', value: 78, weight: '+15' },
    { key: 'threat', label: 'Account Threat', value: 70, weight: '+12' },
    { key: 'pressure', label: 'Authority Pressure', value: 80, weight: '+14' },
    { key: 'credential', label: 'Credential Harvesting', value: 65, weight: '+10' },
    { key: 'link', label: 'Suspicious Link', value: 40, weight: '+5' },
  ],
}) {
  const isHigh = riskLevel === 'HIGH' || overallScore >= 70;
  const isModerate = riskLevel === 'UNCERTAIN' || (overallScore >= 40 && overallScore < 70);

  // Calculate radar polygon points for 8 signals
  const total = signals.length;
  const center = 140;
  const maxRadius = 95;

  const getCoordinates = (index, valuePercent) => {
    const angle = (Math.PI * 2 / total) * index - Math.PI / 2;
    const radius = (valuePercent / 100) * maxRadius;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { x, y, angle };
  };

  const polygonPoints = signals
    .map((sig, i) => {
      const { x, y } = getCoordinates(i, sig.value);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="ef-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Radio size={18} style={{ color: 'var(--copper)' }} />
            <span>Scam Intent Radar</span>
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Real-time breakdown of social-engineering attack vectors and manipulation signals.
          </p>
        </div>
        <span
          className="mono-text"
          style={{
            fontSize: '0.75rem',
            padding: '0.25rem 0.6rem',
            borderRadius: '4px',
            background: isHigh ? 'var(--high-risk-bg)' : isModerate ? 'var(--suspicious-bg)' : 'var(--safe-bg)',
            color: isHigh ? 'var(--high-risk)' : isModerate ? 'var(--suspicious)' : 'var(--safe)',
            fontWeight: 700,
            border: `1px solid ${isHigh ? 'rgba(162,59,50,0.2)' : isModerate ? 'rgba(184,134,43,0.2)' : 'rgba(47,122,82,0.2)'}`,
          }}
        >
          {riskLevel} RISK INTENT
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          alignItems: 'center',
        }}
      >
        {/* Visual Radar SVG with Center Score */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <svg viewBox="0 0 280 280" style={{ width: '100%', maxWidth: '280px', height: 'auto', overflow: 'visible' }}>
            {/* Concentric grid rings */}
            {[0.25, 0.5, 0.75, 1].map((scale, i) => (
              <circle
                key={i}
                cx={center}
                cy={center}
                r={maxRadius * scale}
                fill="none"
                stroke="var(--border)"
                strokeWidth="1"
                strokeDasharray={scale === 1 ? 'none' : '3 3'}
              />
            ))}

            {/* Radial axes */}
            {signals.map((_, i) => {
              const { x, y } = getCoordinates(i, 100);
              return (
                <line
                  key={i}
                  x1={center}
                  y1={center}
                  x2={x}
                  y2={y}
                  stroke="var(--border)"
                  strokeWidth="1"
                  opacity="0.8"
                />
              );
            })}

            {/* Shaded Radar polygon */}
            <polygon
              points={polygonPoints}
              fill={isHigh ? 'rgba(162, 59, 50, 0.22)' : isModerate ? 'rgba(184, 134, 43, 0.22)' : 'rgba(47, 122, 82, 0.22)'}
              stroke={isHigh ? 'var(--high-risk)' : isModerate ? 'var(--suspicious)' : 'var(--safe)'}
              strokeWidth="2"
            />

            {/* Signal nodes */}
            {signals.map((sig, i) => {
              const { x, y } = getCoordinates(i, sig.value);
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="4"
                  fill={isHigh ? 'var(--high-risk)' : isModerate ? 'var(--suspicious)' : 'var(--safe)'}
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />
              );
            })}

            {/* Radar center circle with overall risk */}
            <circle
              cx={center}
              cy={center}
              r="34"
              fill="var(--surface)"
              stroke={isHigh ? 'var(--high-risk)' : isModerate ? 'var(--suspicious)' : 'var(--safe)'}
              strokeWidth="2"
              filter="drop-shadow(0 2px 6px rgba(0,0,0,0.08))"
            />
          </svg>

          {/* Center text overlay */}
          <div
            style={{
              position: 'absolute',
              textAlign: 'center',
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              className="mono-text"
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: isHigh ? 'var(--high-risk)' : isModerate ? 'var(--suspicious)' : 'var(--safe)',
                lineHeight: 1,
              }}
            >
              {overallScore}%
            </span>
            <span
              style={{
                fontSize: '0.62rem',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                letterSpacing: '0.04em',
                marginTop: '2px',
              }}
            >
              {riskLevel}
            </span>
          </div>
        </div>

        {/* Signal List breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Detected Intent Vectors
          </div>
          {signals.map((sig) => (
            <div
              key={sig.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.4rem 0.65rem',
                borderRadius: '6px',
                background: sig.value > 60 ? 'var(--paper)' : 'transparent',
                border: sig.value > 60 ? '1px solid var(--border)' : '1px solid transparent',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background:
                      sig.value >= 75
                        ? 'var(--high-risk)'
                        : sig.value >= 45
                        ? 'var(--suspicious)'
                        : 'var(--safe)',
                  }}
                />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  {sig.label}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span
                  className="mono-text"
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: sig.value > 60 ? 'var(--high-risk)' : 'var(--text-muted)',
                  }}
                >
                  {sig.weight} risk
                </span>
                <span className="mono-text" style={{ fontSize: '0.8rem', fontWeight: 700, minWidth: '32px', textAlign: 'right' }}>
                  {sig.value}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
