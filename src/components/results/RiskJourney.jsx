import React from 'react';
import { TrendingUp, Clock, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

/**
 * Feature 6: Dynamic Risk Journey
 * Compact step-by-step visualization showing continuous risk evolution and contributing events.
 */
export function RiskJourney({
  events = [
    { time: '00:05', state: 'LOW', delta: '+0', label: 'Call Connected', desc: 'Audio stream established, baseline tone normal.' },
    { time: '00:28', state: 'LOW', delta: '+12', label: 'Urgency Pattern', desc: 'Caller demands immediate attention without verification.' },
    { time: '01:05', state: 'UNCERTAIN', delta: '+18', label: 'Impersonation Claim', desc: 'Claims affiliation with central bank security division.' },
    { time: '01:42', state: 'HIGH', delta: '+26', label: 'OTP Code Request', desc: 'Directly asks for authentication code sent to mobile.' },
    { time: '02:15', state: 'HIGH', delta: '+20', label: 'Threat & Pressure', desc: 'Threatens permanent account freeze if not complied.' },
  ],
}) {
  const getStateColor = (state) => {
    switch (state) {
      case 'HIGH':
        return 'var(--high-risk)';
      case 'MEDIUM':
      case 'UNCERTAIN':
        return 'var(--suspicious)';
      case 'LOW':
      default:
        return 'var(--safe)';
    }
  };

  const getStateBg = (state) => {
    switch (state) {
      case 'HIGH':
        return 'var(--high-risk-bg)';
      case 'MEDIUM':
      case 'UNCERTAIN':
        return 'var(--suspicious-bg)';
      case 'LOW':
      default:
        return 'var(--safe-bg)';
    }
  };

  return (
    <div className="ef-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={18} style={{ color: 'var(--copper)' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Dynamic Risk Journey
          </h3>
        </div>
        <span
          className="mono-text"
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            background: 'var(--paper)',
            padding: '0.2rem 0.55rem',
            borderRadius: '4px',
            border: '1px solid var(--border)',
          }}
        >
          REAL-TIME REASSESSMENT
        </span>
      </div>

      <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
        Tracking how threat signals compounded over the duration of the conversation:
      </p>

      {/* Horizontal / Wrapped Journey Flow */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
          position: 'relative',
        }}
      >
        {events.map((evt, idx) => {
          const color = getStateColor(evt.state);
          const bg = getStateBg(evt.state);

          return (
            <div
              key={idx}
              style={{
                background: 'var(--paper)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                position: 'relative',
                borderTop: `3px solid ${color}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="mono-text" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={12} />
                  {evt.time}
                </span>
                <span
                  className="mono-text"
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: color,
                    background: bg,
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px',
                  }}
                >
                  {evt.state}
                </span>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.3rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {evt.label}
                  </span>
                  {evt.delta !== '+0' && (
                    <span
                      className="mono-text"
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: color,
                      }}
                    >
                      {evt.delta}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.35 }}>
                  {evt.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
