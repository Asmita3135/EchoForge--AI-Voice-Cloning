import React from 'react';
import { AlertTriangle, ServerOff, XCircle } from 'lucide-react';

/**
 * Accessible alert banner for displaying API or validation errors.
 */
export function ErrorBanner({ title = 'Analysis Error', error, onDismiss = null }) {
  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error.message;
  const isCorsOrNetwork = error.isCorsOrNetwork;

  return (
    <div className="error-banner" role="alert" aria-live="assertive">
      <div className="error-banner-icon">
        {isCorsOrNetwork ? <ServerOff size={24} /> : <AlertTriangle size={24} />}
      </div>
      <div style={{ flex: 1 }}>
        <div className="error-banner-title">
          {isCorsOrNetwork ? 'Backend Connection / CORS Error' : title}
        </div>
        <div className="error-banner-desc">{errorMessage}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ef-btn ef-btn-ghost ef-btn-sm"
          aria-label="Dismiss error"
          style={{ padding: '0.2rem' }}
        >
          <XCircle size={18} />
        </button>
      )}
    </div>
  );
}
