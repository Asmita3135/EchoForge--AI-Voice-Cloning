import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { ExpandableSection } from '../common/ExpandableSection';

/**
 * Expandable code viewer for pretty-printed raw backend JSON response objects.
 */
export function RawJsonViewer({ data, title = 'View Raw Evidence Payload' }) {
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ExpandableSection title={title} badge="JSON">
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={handleCopy}
          className="ef-btn ef-btn-ghost ef-btn-sm"
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            padding: '0.3rem 0.5rem',
            fontSize: '0.75rem',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            zIndex: 2,
          }}
          title="Copy raw JSON"
        >
          {copied ? <Check size={12} style={{ color: 'var(--color-low)' }} /> : <Copy size={12} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>

        <pre className="raw-json-container">
          <code>{jsonString}</code>
        </pre>
      </div>
    </ExpandableSection>
  );
}
