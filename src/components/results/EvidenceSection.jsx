import React from 'react';
import { Card } from '../common/Card';
import { Member1Card } from './Member1Card';
import { Member2Card } from './Member2Card';
import { Member3Card } from './Member3Card';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

/**
 * Orchestrates the full Evidence Section:
 * - Reasons and Warnings lists
 * - Member 1, Member 2, and Member 3 cards
 */
export function EvidenceSection({ evidence = {}, reasons = [], warnings = [] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Reasons and Warnings Panel */}
      {(reasons.length > 0 || warnings.length > 0) && (
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reasons.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Info size={16} />
                  <span>Key Analytical Rationale ({reasons.length})</span>
                </h4>
                <ul style={{ listStyle: 'disc', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  {reasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {warnings.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-inconclusive)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <AlertCircle size={16} />
                  <span>System Diagnostics & Warnings ({warnings.length})</span>
                </h4>
                <ul style={{ listStyle: 'disc', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.9rem', color: '#fcd34d' }}>
                  {warnings.map((warning, idx) => (
                    <li key={idx}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Module Evidence Cards Grid */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Module Evidence Matrix
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Inspect raw and transformed forensic evidence returned by each pipeline module.
        </p>

        <div className="evidence-cards-grid">
          <Member1Card memberData={evidence?.member1} />
          <Member2Card memberData={evidence?.member2} />
          <Member3Card memberData={evidence?.member3} />
        </div>
      </div>
    </div>
  );
}
