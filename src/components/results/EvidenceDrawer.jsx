import React, { useEffect } from 'react';
import { X, ShieldAlert, FileText, CheckCircle2, AlertTriangle, Cpu } from 'lucide-react';
import { Button } from '../common/Button';

/**
 * Feature 14: Evidence Drawer / Modal
 * Displays explainable forensic evidence, timestamped quotes, and individual risk contribution.
 */
export function EvidenceDrawer({
  isOpen,
  onClose,
  evidenceItems = [
    {
      time: '00:12',
      signal: 'Authority Impersonation',
      quote: 'Good afternoon, this is senior manager Sharma calling from State Bank fraud verification cell.',
      category: 'Impersonation',
      riskContribution: '+18 Risk',
      rationale: 'Caller claims official authority from financial institution without prior customer dispute initiation.',
    },
    {
      time: '00:34',
      signal: 'Artificial Urgency & Threat',
      quote: 'You must complete verification immediately or we will permanently suspend all linked accounts within 15 minutes.',
      category: 'Urgency / Fear',
      riskContribution: '+22 Risk',
      rationale: 'Caller creates high stress and panic to bypass rational security practices.',
    },
    {
      time: '01:14',
      signal: '2FA Credential Harvesting',
      quote: 'I just triggered an automated one-time passkey to your registered phone. Read out the 6-digit OTP code right now to cancel the charges.',
      category: 'OTP Request',
      riskContribution: '+26 Risk',
      rationale: 'Direct solicitation of one-time authentication passkey. Authentic banking staff never request SMS OTPs.',
    },
    {
      time: '01:45',
      signal: 'Acoustic Synthesis Check',
      quote: '[Acoustic analysis over 00:00 - 01:45]',
      category: 'Voice Authenticity',
      riskContribution: '92% Genuine (Low AI Voice Risk)',
      rationale: 'Voice spectral phase characteristics match natural human vocal tract dynamics, confirming social-engineering attack via real human operator.',
    },
  ],
}) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(18, 23, 27, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          height: '100%',
          backgroundColor: 'var(--surface)',
          borderLeft: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-md)',
          animation: 'slideInRight 0.25s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Detection Evidence Drawer"
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--paper)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Cpu size={20} style={{ color: 'var(--copper)' }} />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Detection Evidence Matrix
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Explainable conversational forensic log
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ef-btn ef-btn-ghost ef-btn-sm"
            style={{ padding: '0.4rem', borderRadius: '50%' }}
            aria-label="Close drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div
          style={{
            padding: '1.5rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            flex: 1,
          }}
        >
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Below are timestamped forensic signals extracted during multi-module AI inference:
          </div>

          {evidenceItems.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--paper)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
                <span className="mono-text" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--copper)' }}>
                  [{item.time}] {item.signal}
                </span>
                <span
                  className="mono-text"
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: item.riskContribution.includes('+') ? 'var(--high-risk)' : 'var(--safe)',
                    background: 'var(--surface)',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                  }}
                >
                  {item.riskContribution}
                </span>
              </div>

              <div
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '0.65rem 0.75rem',
                  fontSize: '0.84rem',
                  color: 'var(--text-primary)',
                  fontStyle: 'italic',
                  lineHeight: 1.4,
                }}
              >
                "{item.quote}"
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                <strong style={{ color: 'var(--text-primary)' }}>Rationale:</strong> {item.rationale}
              </div>
            </div>
          ))}
        </div>

        {/* Drawer Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'flex-end',
            background: 'var(--paper)',
          }}
        >
          <Button variant="secondary" size="md" onClick={onClose}>
            Close Evidence
          </Button>
        </div>
      </div>
    </div>
  );
}
