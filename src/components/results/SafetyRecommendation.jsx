import React from 'react';
import { Card } from '../common/Card';
import { ShieldAlert, ShieldCheck, AlertTriangle, CheckSquare } from 'lucide-react';

export function SafetyRecommendation({ decision }) {
  const getRecommendation = () => {
    switch (decision) {
      case 'HIGH':
        return {
          headerColor: 'var(--danger)',
          icon: <ShieldAlert size={24} style={{ color: 'var(--danger)' }} />,
          steps: [
            'Do not share OTPs, PINs, passwords, or banking details.',
            'Do not click links sent by the caller.',
            'Hang up if the request seems suspicious.',
            'Contact the organization using the number on its official website.',
          ],
        };
      case 'LOW':
        return {
          headerColor: 'var(--success)',
          icon: <ShieldCheck size={24} style={{ color: 'var(--success)' }} />,
          steps: [
            'No immediate action is needed based on this analysis, but stay alert when sharing sensitive information.',
          ],
        };
      case 'INCONCLUSIVE':
      default:
        return {
          headerColor: 'var(--warning)',
          icon: <AlertTriangle size={24} style={{ color: 'var(--warning)' }} />,
          steps: [
            "It's best to be cautious. Do not share personal information until you can independently verify the caller.",
          ],
        };
    }
  };

  const rec = getRecommendation();

  return (
    <Card style={{ borderLeft: `6px solid ${rec.headerColor}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
        {rec.icon}
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          What should I do?
        </h3>
      </div>

      <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '0.2rem', listStyle: 'none' }}>
        {rec.steps.map((step, idx) => (
          <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.98rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
            <CheckSquare size={20} style={{ color: rec.headerColor, flexShrink: 0, marginTop: '2px' }} />
            <span>{step}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
