import React from 'react';
import { ShieldAlert, AlertTriangle, KeyRound, DollarSign, Clock, UserX, FileWarning, ExternalLink } from 'lucide-react';

/**
 * Feature 8: "Why I'm Warning You"
 * Compact explanation panel displaying 3–5 strongest threat reasons with icon,
 * signal category, explanation, and risk contribution.
 */
export function WhyWarning({
  reasons = [
    {
      id: 'impersonation',
      icon: UserX,
      signal: 'Impersonation detected',
      explanation: 'Caller falsely claims authority representing your banking/KYC security team.',
      riskContribution: '+18 Risk',
      severity: 'high',
    },
    {
      id: 'urgency',
      icon: Clock,
      signal: 'Urgency tactic detected',
      explanation: 'Caller is pressuring you with artificial deadlines to prevent calm verification.',
      riskContribution: '+20 Risk',
      severity: 'high',
    },
    {
      id: 'otp',
      icon: KeyRound,
      signal: 'OTP request detected',
      explanation: 'Conversation contains direct demands for one-time passwords and verification codes.',
      riskContribution: '+26 Risk',
      severity: 'high',
    },
    {
      id: 'financial',
      icon: DollarSign,
      signal: 'Financial transfer request',
      explanation: 'Caller prompted an immediate fund transfer to an unverified third-party account.',
      riskContribution: '+15 Risk',
      severity: 'medium',
    },
  ],
}) {
  return (
    <div className="ef-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={20} style={{ color: 'var(--high-risk)' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Why I'm Warning You
          </h3>
        </div>
        <span
          className="mono-text"
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            background: 'var(--paper)',
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            border: '1px solid var(--border)',
          }}
        >
          {reasons.length} CRITICAL SIGNALS
        </span>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        EchoForge evaluated conversational patterns and extracted the strongest social-engineering attack factors:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {reasons.map((item, idx) => {
          const Icon = item.icon || AlertTriangle;
          const isHigh = item.severity === 'high';

          return (
            <div
              key={item.id || idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.85rem',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                background: isHigh ? 'var(--high-risk-bg)' : 'var(--suspicious-bg)',
                border: `1px solid ${isHigh ? 'rgba(162,59,50,0.2)' : 'rgba(184,134,43,0.2)'}`,
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: isHigh ? 'rgba(162,59,50,0.15)' : 'rgba(184,134,43,0.15)',
                  color: isHigh ? 'var(--high-risk)' : 'var(--suspicious)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                <Icon size={18} />
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {item.signal}
                  </span>
                  {item.riskContribution && (
                    <span
                      className="mono-text"
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: isHigh ? 'var(--high-risk)' : 'var(--suspicious)',
                        background: 'var(--surface)',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {item.riskContribution}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {item.explanation}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
