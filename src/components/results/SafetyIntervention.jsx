import React from 'react';
import { ShieldAlert, PhoneOff, BookOpen, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '../common/Button';

/**
 * Feature 13: Safety Intervention
 * Direct, clear, calm intervention panel displayed during or after high-risk calls.
 */
export function SafetyIntervention({
  onEndCall,
  onOpenSafetyGuide,
  indicators = [
    'Impersonation of banking / regulatory authorities',
    'Urgency and artificial time pressure tactics',
    'Direct requests for 2FA / OTP passwords',
    'Punitive threats of account freezing',
  ],
}) {
  return (
    <div
      className="ef-card"
      style={{
        padding: '1.5rem',
        background: 'var(--high-risk-bg)',
        border: '1.5px solid rgba(162,59,50,0.35)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'var(--high-risk)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '2px',
          }}
        >
          <ShieldAlert size={22} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              className="mono-text"
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                background: 'rgba(162,59,50,0.2)',
                color: 'var(--high-risk)',
                padding: '0.15rem 0.45rem',
                borderRadius: '3px',
              }}
            >
              CRITICAL INTERVENTION
            </span>
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--high-risk)' }}>
            High Threat Pattern Detected
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
            This conversation matches proven social-engineering fraud schemes. Take immediate protective action.
          </p>
        </div>
      </div>

      {/* Why summary bullets */}
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: '8px',
          padding: '1rem',
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Primary Threat Drivers:
        </span>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {indicators.map((ind, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.84rem', color: 'var(--text-primary)' }}>
              <AlertTriangle size={14} style={{ color: 'var(--high-risk)', flexShrink: 0 }} />
              <span>{ind}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommended protocol & actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', maxWidth: '420px', lineHeight: 1.4 }}>
          <strong>Recommended Protocol:</strong> Terminate this call immediately. Do not share codes, card numbers, or passwords.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {onEndCall && (
            <Button variant="danger" size="md" onClick={onEndCall} icon={PhoneOff}>
              End Call Now
            </Button>
          )}
          {onOpenSafetyGuide && (
            <Button variant="secondary" size="md" onClick={onOpenSafetyGuide} icon={BookOpen}>
              Open Safety Guide
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
