import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Collapsible section wrapper for secondary content and raw data views.
 */
export function ExpandableSection({
  title,
  children,
  defaultOpen = false,
  badge = null,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`expandable-section ${className}`} style={{ marginTop: '0.75rem' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="ef-btn ef-btn-ghost ef-btn-sm"
        style={{
          width: '100%',
          justify: 'space-between',
          padding: '0.5rem 0.75rem',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '6px',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
          {title}
          {badge && <span className="mono-text" style={{ fontSize: '0.75rem', opacity: 0.7 }}>({badge})</span>}
        </span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {isOpen && (
        <div style={{ marginTop: '0.5rem', paddingLeft: '0.25rem' }}>
          {children}
        </div>
      )}
    </div>
  );
}
