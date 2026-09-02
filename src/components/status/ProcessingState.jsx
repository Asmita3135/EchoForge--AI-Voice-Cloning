import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

export function ProcessingState() {
  const [stageIndex, setStageIndex] = useState(0);

  const STAGES = [
    'Checking voice authenticity',
    'Analyzing conversation context',
    'Comparing voice characteristics',
    'Preparing your safety result',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStageIndex((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(timer);
  }, [STAGES.length]);

  return (
    <div className="processing-container">
      {/* Waveform Scan Animation */}
      <div className="waveform-loader" aria-label="Loading animation">
        <div className="scan-line" aria-hidden="true" />
        <div className="waveform-bar" />
        <div className="waveform-bar" />
        <div className="waveform-bar" />
        <div className="waveform-bar" />
        <div className="waveform-bar" />
        <div className="waveform-bar" />
        <div className="waveform-bar" />
        <div className="waveform-bar" />
      </div>

      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--copper)', marginBottom: '0.25rem' }}>
          Analyzing your recording...
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Our forensics engine is evaluating the audio signal.
        </p>
      </div>

      {/* Visual Waiting Stages */}
      <div className="waiting-stages-list">
        {STAGES.map((stage, idx) => {
          const isDone = idx <= stageIndex;
          return (
            <div key={idx} className={`waiting-stage-item ${isDone ? 'done' : ''}`}>
              <span>{stage}</span>
              {isDone ? (
                <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
              ) : (
                <Circle size={16} style={{ color: 'var(--text-muted)' }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
