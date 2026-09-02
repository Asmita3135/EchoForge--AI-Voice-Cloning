import React from 'react';
import { Info } from 'lucide-react';

/**
 * Concise explainer for Target Audio vs optional Speaker Reference Audio.
 */
export function TargetVsReferenceExplainer() {
  return (
    <div
      style={{
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
      }}
    >
      <Info size={18} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
      <div>
        <strong style={{ color: 'var(--text-primary)' }}>Analysis Workflow:</strong> Target Audio is analyzed for deepfake features and transcript context. Providing an optional Reference Audio enables speaker-match verification (Member 2). If omitted, speaker verification is safely skipped.
      </div>
    </div>
  );
}
