import React from 'react';
import { Card } from '../components/common/Card';
import { CheckCircle2, XCircle, ShieldAlert, Lock, PhoneOff } from 'lucide-react';
import { Button } from '../components/common/Button';

export function SafetyGuidePage({ onNavigate }) {
  return (
    <div className="safety-guide-page" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Hero */}
      <section className="hero-section" style={{ textAlign: 'left', padding: '0' }}>
        <span className="section-kicker">CONSUMER DEFENSE</span>
        <h1 className="hero-title" style={{ fontSize: '2.2rem', margin: 0 }}>
          Voice Scam Safety Guide
        </h1>
        <p className="hero-tagline" style={{ fontSize: '1.05rem', marginTop: '0.5rem', maxWidth: '750px' }}>
          Essential safety rules to protect yourself and your family from AI voice cloning, spoofed caller IDs, and social engineering fraud.
        </p>
      </section>

      {/* Structured DO / DON'T Grid */}
      <div className="do-dont-grid">
        {/* DO Card */}
        <div className="do-card">
          <h3 className="do-title"><CheckCircle2 size={22} /> ALWAYS DO</h3>
          <ul className="do-list">
            <li><strong>Verify Independently:</strong> Hang up and call the organization back using an official telephone number from their official website.</li>
            <li><strong>Pause Under Pressure:</strong> Scammers create artificial urgency to prevent critical thinking. Take a breath and pause.</li>
            <li><strong>Ask Verification Questions:</strong> Ask for details only the authentic caller would know.</li>
            <li><strong>Report Suspicious Calls:</strong> Report scam numbers to your telecom carrier and national fraud reporting portal.</li>
          </ul>
        </div>

        {/* DON'T Card */}
        <div className="dont-card">
          <h3 className="dont-title"><XCircle size={22} /> NEVER DO</h3>
          <ul className="dont-list">
            <li><strong>Never Share OTPs or Passwords:</strong> Bank staff and government officials will NEVER ask for 1-time passcodes or PINs.</li>
            <li><strong>Never Install Remote Apps:</strong> Do not download remote desktop apps (e.g. AnyDesk, TeamViewer) requested over a call.</li>
            <li><strong>Never Transfer Funds Under Urgency:</strong> Refuse pressure to make instant UPI, wire, or gift card transfers.</li>
            <li><strong>Do Not Trust Caller ID Alone:</strong> Phone numbers can be easily spoofed using VoIP services.</li>
          </ul>
        </div>
      </div>

      {/* Call to Action */}
      <Card style={{ textAlign: 'center', padding: '2.5rem 1.5rem', background: 'var(--bg-charcoal)' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-ivory)', marginBottom: '0.5rem' }}>
          Have a Suspicious Call Recording?
        </h2>
        <p style={{ color: 'var(--text-grey)', marginBottom: '1.5rem' }}>
          Upload the audio recording to run EchoForge AI voice cloning and threat analysis.
        </p>
        <Button variant="primary" size="lg" onClick={() => onNavigate('/analyze')}>
          Analyze Recording Now
        </Button>
      </Card>
    </div>
  );
}
