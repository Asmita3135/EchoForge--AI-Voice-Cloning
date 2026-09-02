import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Mic, Brain } from 'lucide-react';

/**
 * Feature 10: Voice Authenticity vs Scam Intent
 * Clearly separates voice synthesis detection from social-engineering / scam intent.
 * Core concept: "Real voice ≠ Safe conversation" and "Fake voice ≠ Only reason for danger".
 */
export function VoiceIntentComparison({
  voiceAuthenticity = 92, // % genuine
  isVoiceSynthetic = false,
  scamIntentScore = 87,   // % scam intent
  riskLevel = 'HIGH',
}) {
  const isHighRisk = riskLevel === 'HIGH' || scamIntentScore >= 70;
  const isModerateRisk = riskLevel === 'UNCERTAIN' || (scamIntentScore >= 40 && scamIntentScore < 70);

  return (
    <div
      className="ef-card"
      style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        borderLeft: isHighRisk
          ? '4px solid var(--high-risk)'
          : isModerateRisk
          ? '4px solid var(--suspicious)'
          : '4px solid var(--safe)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Voice Authenticity vs. Scam Intent</span>
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Multi-layer analysis: acoustic synthesis verification separated from conversational social-engineering detection.
          </p>
        </div>
        <span
          className="mono-text"
          style={{
            fontSize: '0.75rem',
            padding: '0.25rem 0.6rem',
            borderRadius: '4px',
            background: 'var(--paper)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
          }}
        >
          DUAL-PIPELINE
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* Metric 1: Voice Authenticity */}
        <div
          style={{
            padding: '1.25rem',
            borderRadius: '8px',
            background: 'var(--paper)',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--teal)' }}>
              <Mic size={18} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Voice Authenticity
              </span>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: isVoiceSynthetic ? 'var(--high-risk)' : 'var(--safe)',
              }}
            >
              {isVoiceSynthetic ? 'AI Synthetic' : 'Likely Genuine'}
            </span>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
              <span className="mono-text" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {isVoiceSynthetic ? `${100 - voiceAuthenticity}%` : `${voiceAuthenticity}%`}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                {isVoiceSynthetic ? 'Synthetic Probability' : 'Acoustic Integrity'}
              </span>
            </div>
            {/* Progress bar */}
            <div style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: '3px', marginTop: '0.5rem', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${voiceAuthenticity}%`,
                  height: '100%',
                  background: isVoiceSynthetic ? 'var(--high-risk)' : 'var(--safe)',
                  borderRadius: '3px',
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShieldCheck size={14} style={{ color: 'var(--safe)', flexShrink: 0 }} />
            <span>Phonetic &amp; spectral phase stability analyzed.</span>
          </div>
        </div>

        {/* Metric 2: Scam Intent */}
        <div
          style={{
            padding: '1.25rem',
            borderRadius: '8px',
            background: isHighRisk ? 'var(--high-risk-bg)' : isModerateRisk ? 'var(--suspicious-bg)' : 'var(--safe-bg)',
            border: `1px solid ${isHighRisk ? 'rgba(162,59,50,0.25)' : isModerateRisk ? 'rgba(184,134,43,0.25)' : 'rgba(47,122,82,0.25)'}`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: isHighRisk ? 'var(--high-risk)' : isModerateRisk ? 'var(--suspicious)' : 'var(--safe)' }}>
              <Brain size={18} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Scam Intent
              </span>
            </div>
            <span
              className="mono-text"
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: isHighRisk ? 'var(--high-risk)' : isModerateRisk ? 'var(--suspicious)' : 'var(--safe)',
              }}
            >
              {isHighRisk ? 'HIGH RISK' : isModerateRisk ? 'MODERATE RISK' : 'LOW RISK'}
            </span>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
              <span className="mono-text" style={{ fontSize: '2rem', fontWeight: 700, color: isHighRisk ? 'var(--high-risk)' : isModerateRisk ? 'var(--suspicious)' : 'var(--safe)' }}>
                {scamIntentScore}%
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Threat Probability
              </span>
            </div>
            {/* Progress bar */}
            <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.08)', borderRadius: '3px', marginTop: '0.5rem', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${scamIntentScore}%`,
                  height: '100%',
                  background: isHighRisk ? 'var(--high-risk)' : isModerateRisk ? 'var(--suspicious)' : 'var(--safe)',
                  borderRadius: '3px',
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <AlertTriangle size={14} style={{ color: isHighRisk ? 'var(--high-risk)' : 'var(--suspicious)', flexShrink: 0 }} />
            <span>Social-engineering language &amp; urgency patterns detected.</span>
          </div>
        </div>
      </div>

      {/* Core Principle Callout */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0.75rem 1rem',
          borderRadius: '6px',
          background: 'var(--paper)',
          border: '1px dashed var(--border)',
          fontSize: '0.82rem',
          color: 'var(--text-primary)',
        }}
      >
        <span style={{ fontSize: '1rem' }}>💡</span>
        <span>
          <strong>Key Security Distinction:</strong> A genuine human voice can still execute a social-engineering scam. EchoForge verifies both <em>how the caller sounds</em> and <em>what they are trying to do</em>.
        </span>
      </div>
    </div>
  );
}
