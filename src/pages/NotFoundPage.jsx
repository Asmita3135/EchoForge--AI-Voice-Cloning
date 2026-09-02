import React from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { AlertTriangle, Home } from 'lucide-react';

export function NotFoundPage({ onNavigate }) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
      <AlertTriangle size={56} style={{ color: 'var(--color-amber)' }} />
      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-ivory)' }}>404 — Page Not Found</h1>
      <p style={{ color: 'var(--text-grey)', maxWidth: '480px' }}>
        The security page or command view you requested could not be located on the EchoForge platform.
      </p>
      <Button variant="primary" size="lg" onClick={() => onNavigate('/')} icon={Home}>
        Return to Overview
      </Button>
    </div>
  );
}
