import React from 'react';
import { Card } from '../common/Card';
import { HelpCircle, Info, AlertCircle } from 'lucide-react';

export function WhySection({ reasons = [], warnings = [], riskBreakdown = {}, humanReviewRequired = false }) {
  const getFriendlyReasons = () => {
    const list = [];

    // Translate technical backend reasons array into plain consumer language
    if (Array.isArray(reasons) && reasons.length > 0) {
      reasons.forEach((r) => {
        if (r.includes('synthetic-voice') || r.includes('Deepfake')) {
          list.push('The audio contains acoustic characteristics consistent with AI voice cloning or synthetic speech.');
        } else if (r.includes('does not match') || r.includes('reference speaker')) {
          list.push('The suspicious recording differs from the provided reference voice.');
        } else if (r.includes('Financial') || r.includes('Urgency') || r.includes('context')) {
          list.push('The conversation contains signs that may involve sensitive information or unusual requests.');
        } else if (r.includes('genuine-voice') || r.includes('authentic')) {
          list.push('Natural vocal characteristics and pitch patterns were detected.');
        } else {
          list.push(r);
        }
      });
    }

    // Explicit Speaker Mismatch null handling
    if (riskBreakdown?.speaker_mismatch_risk === null || riskBreakdown?.speaker_mismatch_risk === undefined) {
      list.push('A reference voice was not provided, so EchoForge could not compare the speakers.');
    }

    return list;
  };

  const friendlyList = getFriendlyReasons();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Human Review Recommended Notice */}
      {humanReviewRequired && (
        <div style={{ backgroundColor: 'var(--warning-light)', border: '1px solid var(--warning)', borderRadius: '14px', padding: '1rem 1.25rem', color: 'var(--warning)', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span>
            <strong>Additional review recommended:</strong> Signals show border or conflicting thresholds.
          </span>
        </div>
      )}

      {/* Main Why Card */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <HelpCircle size={24} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Why did EchoForge give this result?
          </h3>
        </div>

        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', paddingLeft: '1.25rem', color: 'var(--text-primary)' }}>
          {friendlyList.map((item, idx) => (
            <li key={idx} style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>
              {item}
            </li>
          ))}
        </ul>

        {/* Warnings list if any */}
        {Array.isArray(warnings) && warnings.length > 0 && (
          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--warning)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Info size={16} />
              <span>System Warnings</span>
            </h4>
            <ul style={{ listStyle: 'disc', paddingLeft: '1.25rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
}
