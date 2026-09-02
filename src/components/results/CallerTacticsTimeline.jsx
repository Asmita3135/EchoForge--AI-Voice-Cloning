import React from 'react';
import { ShieldAlert, ArrowRight, UserCheck, HeartHandshake, AlertCircle, Flame, KeyRound, Lock } from 'lucide-react';

/**
 * Feature 9: Caller Tactics Timeline
 * Visualizes the social engineering kill chain and attack pattern progression.
 */
export function CallerTacticsTimeline({
  stages = [
    { name: 'Identity Claim', icon: UserCheck, status: 'detected', note: 'Claimed official bank manager' },
    { name: 'Trust Building', icon: HeartHandshake, status: 'detected', note: 'Quoted reference ID numbers' },
    { name: 'Urgency Creation', icon: AlertCircle, status: 'detected', note: 'Created false 10-minute timer' },
    { name: 'Fear Induction', icon: Flame, status: 'detected', note: 'Warned of criminal investigation' },
    { name: 'OTP Code Request', icon: KeyRound, status: 'detected', note: 'Demanded 2FA passkey' },
    { name: 'Coercive Pressure', icon: Lock, status: 'detected', note: 'Forbade hanging up call' },
  ],
}) {
  return (
    <div className="ef-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={18} style={{ color: 'var(--copper)' }} />
            <span>Caller Tactics Timeline (Attack Pattern)</span>
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Recognizing the end-to-end psychological manipulation lifecycle, not just isolated keywords.
          </p>
        </div>
        <span
          className="mono-text"
          style={{
            fontSize: '0.75rem',
            color: 'var(--high-risk)',
            background: 'var(--high-risk-bg)',
            padding: '0.2rem 0.55rem',
            borderRadius: '4px',
            border: '1px solid rgba(162,59,50,0.2)',
            fontWeight: 600,
          }}
        >
          ATTACK CHAIN MATCHED
        </span>
      </div>

      {/* Horizontal / Stacking Process Flow */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '0.6rem',
        }}
      >
        {stages.map((stg, i) => {
          const Icon = stg.icon || AlertCircle;
          const isDetected = stg.status === 'detected';

          return (
            <div
              key={i}
              style={{
                background: isDetected ? 'var(--paper)' : 'var(--surface)',
                border: isDetected ? '1px solid var(--border)' : '1px dashed var(--border)',
                borderLeft: isDetected && i >= 3 ? '3px solid var(--high-risk)' : isDetected ? '3px solid var(--copper)' : '3px solid var(--border)',
                borderRadius: '6px',
                padding: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="mono-text" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  STAGE 0{i + 1}
                </span>
                <Icon size={14} style={{ color: i >= 3 ? 'var(--high-risk)' : 'var(--copper)' }} />
              </div>

              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {stg.name}
              </div>

              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                {stg.note}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
