import React from 'react';
import { CheckCircle2, Activity, Radio, Cpu } from 'lucide-react';

/**
 * Feature 11: Real-Time AI Activity
 * Displays active pipeline stages with subtle pulse on active process.
 */
export function AIActivity({
  activeStageIndex = 2, // 0..4
  stages = [
    { label: 'Listening to audio stream', doneText: 'Stream captured' },
    { label: 'Transcribing speech to text', doneText: 'Transcript extracted' },
    { label: 'Analyzing conversational context', doneText: 'Context evaluated' },
    { label: 'Checking social-engineering scam patterns', doneText: 'Threat vectors matched' },
    { label: 'Synthesizing final risk assessment', doneText: 'Risk calculated' },
  ],
}) {
  return (
    <div
      className="ef-card"
      style={{
        padding: '1.25rem 1.5rem',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--copper)',
              boxShadow: '0 0 8px rgba(181,103,46,0.6)',
              display: 'inline-block',
            }}
          />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Live AI Neural Pipeline
          </span>
        </div>
        <span className="mono-text" style={{ fontSize: '0.75rem', color: 'var(--copper)', fontWeight: 600 }}>
          ACTIVE MONITOR
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {stages.map((stage, i) => {
          const isDone = i < activeStageIndex;
          const isActive = i === activeStageIndex;
          const isPending = i > activeStageIndex;

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.35rem 0.6rem',
                borderRadius: '6px',
                background: isActive ? 'var(--paper)' : 'transparent',
                border: isActive ? '1px solid var(--border)' : '1px solid transparent',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                {isDone ? (
                  <CheckCircle2 size={16} style={{ color: 'var(--safe)', flexShrink: 0 }} />
                ) : isActive ? (
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: 'var(--copper)',
                      display: 'inline-block',
                      animation: 'pulse-dot 1.5s ease-in-out infinite',
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'var(--border)',
                      display: 'inline-block',
                      flexShrink: 0,
                    }}
                  />
                )}

                <span
                  style={{
                    fontSize: '0.84rem',
                    color: isActive ? 'var(--text-primary)' : isDone ? 'var(--text-secondary)' : 'var(--text-muted)',
                    fontWeight: isActive ? 700 : isDone ? 500 : 400,
                  }}
                >
                  {stage.label}
                </span>
              </div>

              <span
                className="mono-text"
                style={{
                  fontSize: '0.72rem',
                  color: isDone ? 'var(--safe)' : isActive ? 'var(--copper)' : 'var(--text-muted)',
                  fontWeight: 600,
                }}
              >
                {isDone ? 'COMPLETED' : isActive ? 'ANALYZING...' : 'QUEUED'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
