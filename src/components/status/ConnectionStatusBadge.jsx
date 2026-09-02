import React from 'react';
import { Activity, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Displays backend GET /health status indicator.
 * States: 'checking' | 'connected' | 'unavailable'
 */
export function ConnectionStatusBadge({ status, onRetry = null }) {
  const getBadgeContent = () => {
    switch (status) {
      case 'connected':
        return {
          label: 'Backend Connected',
          icon: <CheckCircle2 size={14} />,
          className: 'connected',
        };
      case 'unavailable':
        return {
          label: 'Backend Offline / CORS Issue',
          icon: <AlertCircle size={14} />,
          className: 'unavailable',
        };
      case 'checking':
      default:
        return {
          label: 'Checking API Liveness...',
          icon: <Activity size={14} className="spin-icon" />,
          className: 'checking',
        };
    }
  };

  const { label, icon, className } = getBadgeContent();

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
      <div
        className={`status-badge ${className}`}
        role="status"
        aria-live="polite"
        title={`Backend status: ${status}`}
      >
        <span className="status-dot" aria-hidden="true" />
        {icon}
        <span>{label}</span>
      </div>
      {status === 'unavailable' && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="ef-btn ef-btn-ghost ef-btn-sm"
          title="Retry backend health check"
          aria-label="Retry connection health check"
          style={{ padding: '0.3rem 0.5rem' }}
        >
          <RefreshCw size={14} />
        </button>
      )}
    </div>
  );
}
