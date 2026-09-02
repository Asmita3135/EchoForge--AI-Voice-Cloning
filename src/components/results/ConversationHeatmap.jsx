import React, { useState } from 'react';
import { FileText, AlertTriangle, ShieldAlert, Clock, Info } from 'lucide-react';

/**
 * Feature 7: Conversation Heatmap
 * Displays highlighted transcript with meaningful contextual threat tagging,
 * timestamps, and risk contributions.
 */
export function ConversationHeatmap({
  transcriptSegments = [
    {
      time: '00:12',
      speaker: 'Caller',
      text: 'Good afternoon, this is senior manager Sharma calling from State Bank fraud verification cell.',
      highlight: 'impersonation',
      category: 'IMPERSONATION',
      riskContribution: '+18 Risk',
      explanation: 'Claims institutional authority without prior customer-initiated ticket.',
    },
    {
      time: '00:25',
      speaker: 'User',
      text: 'Hello? What happened to my account?',
    },
    {
      time: '00:34',
      speaker: 'Caller',
      text: 'Your debit card was flagged for unauthorized overseas transactions. You must complete verification immediately or we will permanently suspend all linked accounts within 15 minutes.',
      highlight: 'urgency_threat',
      category: 'URGENCY & THREAT',
      riskContribution: '+22 Risk',
      explanation: 'Manufactures extreme time stress and punitive consequences to force panic.',
    },
    {
      time: '01:02',
      speaker: 'User',
      text: 'Can I visit my local branch instead?',
    },
    {
      time: '01:14',
      speaker: 'Caller',
      text: 'No, branch visits will be too late. I just triggered an automated one-time passkey to your registered phone. Read out the 6-digit OTP code right now to cancel the charges.',
      highlight: 'otp_harvesting',
      category: 'OTP HARVESTING',
      riskContribution: '+26 Risk',
      explanation: 'Direct extraction of multi-factor authentication secret; bank staff never request OTP.',
    },
  ],
}) {
  const [selectedHighlight, setSelectedHighlight] = useState(null);

  const getHighlightStyle = (type) => {
    switch (type) {
      case 'impersonation':
        return {
          background: 'rgba(181, 103, 46, 0.15)',
          borderBottom: '2px solid var(--copper)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          padding: '0 3px',
          borderRadius: '2px',
        };
      case 'urgency_threat':
        return {
          background: 'rgba(184, 134, 43, 0.2)',
          borderBottom: '2px solid var(--suspicious)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          padding: '0 3px',
          borderRadius: '2px',
        };
      case 'otp_harvesting':
      case 'money_transfer':
        return {
          background: 'rgba(162, 59, 50, 0.2)',
          borderBottom: '2px solid var(--high-risk)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          padding: '0 3px',
          borderRadius: '2px',
        };
      default:
        return {};
    }
  };

  return (
    <div className="ef-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} style={{ color: 'var(--copper)' }} />
            <span>Conversation Heatmap &amp; Transcript</span>
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Contextually annotated dialog with highlighted social-engineering phrases. Click any highlight to inspect details.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem', borderRadius: '3px', background: 'rgba(181,103,46,0.15)', color: 'var(--copper)', border: '1px solid rgba(181,103,46,0.2)' }}>
            Impersonation
          </span>
          <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem', borderRadius: '3px', background: 'rgba(184,134,43,0.2)', color: 'var(--suspicious)', border: '1px solid rgba(184,134,43,0.2)' }}>
            Urgency / Threat
          </span>
          <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem', borderRadius: '3px', background: 'rgba(162,59,50,0.2)', color: 'var(--high-risk)', border: '1px solid rgba(162,59,50,0.2)' }}>
            OTP / Credential
          </span>
        </div>
      </div>

      {/* Transcript Log */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          background: 'var(--paper)',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          maxHeight: '320px',
          overflowY: 'auto',
        }}
      >
        {transcriptSegments.map((seg, idx) => {
          const isCaller = seg.speaker === 'Caller';
          const hasHighlight = !!seg.highlight;

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                background: isCaller ? 'var(--surface)' : 'transparent',
                border: isCaller ? '1px solid var(--border)' : '1px dashed transparent',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ fontWeight: 700, color: isCaller ? 'var(--copper)' : 'var(--teal)' }}>
                  {seg.speaker}
                </span>
                <span className="mono-text" style={{ color: 'var(--text-muted)' }}>
                  {seg.time}
                </span>
              </div>

              <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {hasHighlight ? (
                  <span
                    style={getHighlightStyle(seg.highlight)}
                    onClick={() => setSelectedHighlight(seg)}
                    title="Click to view forensic breakdown"
                  >
                    "{seg.text}"
                  </span>
                ) : (
                  `"${seg.text}"`
                )}
              </div>

              {hasHighlight && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                  <span
                    className="mono-text"
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: 'var(--high-risk)',
                      background: 'var(--high-risk-bg)',
                      padding: '0.1rem 0.35rem',
                      borderRadius: '3px',
                    }}
                  >
                    {seg.category}
                  </span>
                  <span className="mono-text" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    {seg.riskContribution}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Interactive Detail Drawer/Snippet if clicked */}
      {selectedHighlight && (
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderLeft: '4px solid var(--high-risk)',
            borderRadius: '6px',
            padding: '0.85rem 1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
              <ShieldAlert size={16} style={{ color: 'var(--high-risk)' }} />
              <strong style={{ fontSize: '0.85rem', color: 'var(--high-risk)' }}>
                {selectedHighlight.category} ({selectedHighlight.riskContribution})
              </strong>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {selectedHighlight.explanation}
            </p>
          </div>
          <button
            onClick={() => setSelectedHighlight(null)}
            className="ef-btn ef-btn-ghost ef-btn-sm"
            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
