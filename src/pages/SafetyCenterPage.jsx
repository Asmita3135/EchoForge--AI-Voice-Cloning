import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, Phone, CreditCard, Link, Eye, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

const SCAM_EXAMPLES = [
  {
    icon: '🚨',
    iconColor: '#EF4444',
    category: 'Urgency Tactics',
    quote: '"Your bank account will be blocked in 2 hours. You must call us immediately."',
    title: 'Time pressure is a red flag',
    explanation: 'Genuine banks and government agencies do not demand immediate action over a phone call. Urgency is used to prevent you from thinking clearly or verifying the claim.',
  },
  {
    icon: '🔐',
    iconColor: '#B45309',
    category: 'OTP & PIN Requests',
    quote: '"Please share your OTP to verify your Aadhaar KYC."',
    title: 'Never share an OTP or PIN',
    explanation: 'A real bank, UIDAI, or government agency will NEVER ask for your OTP, PIN, or password over a phone call. OTPs are one-time codes meant only for your use.',
  },
  {
    icon: '💳',
    iconColor: '#B91C1C',
    category: 'Money Transfers',
    quote: '"Transfer ₹5,000 to this account to unfreeze your funds."',
    title: 'No legitimate agency asks for a transfer',
    explanation: 'Requests to transfer money to "verify your account", "unfreeze funds", or "secure your KYC" are scam tactics. Pause and verify the claim through official channels.',
  },
  {
    icon: '🎭',
    iconColor: '#7C3AED',
    category: 'Impersonation',
    quote: '"I am calling from your bank\'s fraud prevention team."',
    title: 'Anyone can claim to be your bank',
    explanation: 'AI voice cloning and spoofing make it easy for fraudsters to sound like known contacts or officials. Always hang up and call back using the number on the official website or card.',
  },
  {
    icon: '🔗',
    iconColor: '#0F4C5C',
    category: 'Suspicious Links',
    quote: '"Open this link to complete your KYC verification process."',
    title: 'Do not open unsolicited links',
    explanation: 'Links sent by unknown callers may lead to phishing websites designed to steal your banking credentials, install malware, or harvest personal information.',
  },
  {
    icon: '📦',
    iconColor: '#B45309',
    category: 'Parcel / Delivery Scams',
    quote: '"Your parcel is being held at customs. Pay ₹2,000 to release it."',
    title: 'Customs does not call like this',
    explanation: 'Parcel or courier scams create fake urgency around deliveries. Verify any customs or delivery claim directly through official carrier websites.',
  },
];

const SAFETY_TIPS = [
  { icon: '✅', tip: 'Hang up if you feel pressured.' },
  { icon: '✅', tip: 'Call the official number back independently.' },
  { icon: '✅', tip: 'Never share OTPs, PINs, or passwords.' },
  { icon: '✅', tip: 'Do not click links sent by unknown callers.' },
  { icon: '✅', tip: 'Warn family members, especially elderly relatives.' },
  { icon: '✅', tip: 'Report suspicious calls to cybercrime helpline 1930.' },
];

export function SafetyCenterPage({ onNavigateTo }) {
  const [openExample, setOpenExample] = useState(null);

  return (
    <div className="safety-center-page">
      {/* Hero */}
      <section className="safety-hero">
        <div className="safety-hero-badge">
          <ShieldCheck size={14} />
          <span>EchoForge Safety Center</span>
        </div>
        <h1>Stay Safer in Every Conversation</h1>
        <p>
          Learn to recognize voice scams, understand AI impersonation risks, and know exactly
          what to do when a call feels suspicious.
        </p>
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Button
            variant="primary"
            size="md"
            onClick={() => onNavigateTo?.('analyze-call')}
            style={{ background: 'rgba(255,255,255,0.95)', color: 'var(--primary)' }}
          >
            Analyze a Suspicious Call
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => onNavigateTo?.('faq')}
            style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#FFFFFF', background: 'transparent' }}
          >
            Read FAQ
          </Button>
        </div>
      </section>

      {/* Voice Scam Red Flags */}
      <section>
        <div className="section-heading-center" style={{ marginBottom: '2rem' }}>
          <h2>Common Voice Scam Red Flags</h2>
          <p>These are patterns frequently used by scammers targeting Indian consumers. Tap each to learn more.</p>
        </div>

        <div className="scam-examples-grid">
          {SCAM_EXAMPLES.map((example, idx) => (
            <div key={example.category} className="scam-example-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.75rem' }}>{example.icon}</span>
                <div>
                  <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: example.iconColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {example.category}
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{example.title}</h3>
                </div>
              </div>
              <div className="scam-quote-bubble">{example.quote}</div>
              <p className="scam-explanation">{example.explanation}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Voice Cloning Explained */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--soft-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
            <Eye size={28} />
          </div>
          <div style={{ flex: 1, minWidth: '260px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>AI Voice Cloning Explained</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1rem' }}>
              AI voice cloning is technology that can generate a realistic copy of a person's voice using just a few seconds of sample audio. Fraudsters use this to impersonate family members, bank officers, or government officials.
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1rem' }}>
              A cloned voice can say anything — including convincing the target that their loved one is in danger, or that urgent action is required on a bank account.
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontWeight: 600 }}>
              EchoForge analyzes acoustic patterns in call recordings to detect signs of synthetic voice generation and flag high-risk calls.
            </p>
          </div>
        </div>
      </Card>

      {/* Safety Tips */}
      <section>
        <div className="section-heading-center" style={{ marginBottom: '1.75rem' }}>
          <h2>What To Do If a Call Feels Suspicious</h2>
          <p>Simple steps that can protect you and your family.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {SAFETY_TIPS.map(({ icon, tip }) => (
            <div key={tip} style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              boxShadow: 'var(--shadow-xs)',
              fontSize: '0.95rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}>
              <span style={{ fontSize: '1.2rem' }}>{icon}</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            🇮🇳 Report cybercrime: <strong style={{ color: 'var(--primary)' }}>Helpline 1930</strong> or <strong style={{ color: 'var(--primary)' }}>cybercrime.gov.in</strong>
          </div>
          <Button variant="primary" size="lg" onClick={() => onNavigateTo?.('analyze-call')} icon={ArrowRight}>
            Analyze a Suspicious Call
          </Button>
        </div>
      </section>
    </div>
  );
}
