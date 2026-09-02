import React from 'react';
import { ShieldCheck, Mic, Shield, ArrowRight, Heart, Target, Eye } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

export function AboutPage({ onNavigateTo }) {
  const values = [
    {
      icon: Eye,
      color: 'blue',
      title: 'Transparency',
      desc: 'We explain every result in plain language — no jargon, no confusion.',
    },
    {
      icon: Heart,
      color: 'orange',
      title: 'Human-First Design',
      desc: 'Built for elderly users, non-technical users, and families across India.',
    },
    {
      icon: Shield,
      color: 'green',
      title: 'Safety, Not Fear',
      desc: 'EchoForge informs — it does not alarm. We give you clarity, not anxiety.',
    },
    {
      icon: Target,
      color: 'purple',
      title: 'Accuracy',
      desc: 'Multi-layer AI analysis combines multiple independent signals for reliable results.',
    },
  ];

  return (
    <div className="about-page">
      {/* About Hero */}
      <section className="about-hero">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--soft-blue)', color: 'var(--primary)', padding: '0.35rem 1rem', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 800, marginBottom: '1.25rem' }}>
            <ShieldCheck size={14} />
            <span>About EchoForge</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', marginBottom: '1.1rem', lineHeight: 1.1 }}>
            Technology that helps people trust the voice on the other end.
          </h1>

          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem', maxWidth: '520px' }}>
            EchoForge was built on a simple belief: advanced voice-security technology should be
            understandable and useful to <em>every</em> person — not just security experts.
          </p>

          <Button variant="primary" size="lg" onClick={() => onNavigateTo?.('analyze-call')} icon={ArrowRight}>
            Try EchoForge
          </Button>
        </div>

        {/* About Visual */}
        <div className="about-visual">
          <div className="about-shield-visual">
            <Shield size={80} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Voice → Analysis → Shield → Safety
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              The EchoForge protection journey
            </div>
          </div>
          {/* Decorative waveform */}
          <svg viewBox="0 0 200 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '200px', opacity: 0.3 }}>
            <path d="M0 20 Q10 5 20 20 Q30 35 40 20 Q50 5 60 20 Q70 35 80 20 Q90 5 100 20 Q110 35 120 20 Q130 5 140 20 Q150 35 160 20 Q170 5 180 20 Q190 35 200 20"
              stroke="#0F4C5C" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </svg>
        </div>
      </section>

      {/* Mission Card */}
      <Card style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)', border: 'none', padding: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', padding: '0.85rem', borderRadius: '14px', flexShrink: 0 }}>
            <Target size={28} style={{ color: '#FFFFFF' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
              OUR MISSION
            </div>
            <h2 style={{ color: '#FFFFFF', fontSize: '1.6rem', marginBottom: '0.75rem' }}>
              Make advanced voice-security technology understandable and useful to everyday people.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, fontSize: '1rem' }}>
              Voice impersonation scams affect millions of people every year. EchoForge gives
              ordinary people access to the same AI technology that was previously available
              only to large organizations — presented in a way that anyone can understand.
            </p>
          </div>
        </div>
      </Card>

      {/* Values Grid */}
      <section>
        <div className="section-heading-center" style={{ marginBottom: '1.75rem' }}>
          <h2>Our Values</h2>
          <p>Everything we build at EchoForge is guided by these principles.</p>
        </div>

        <div className="features-grid">
          {values.map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="feature-card">
              <div className={`feature-icon-wrapper ${color}`}>
                <Icon size={26} />
              </div>
              <h3 className="feature-card-title">{title}</h3>
              <p className="feature-card-desc">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What We Don't Do */}
      <Card>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>What EchoForge does NOT do</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            'We do not access your microphone.',
            'We do not make promises or guarantees about call safety.',
            'We do not store or sell your recordings.',
            'We do not make up information — everything shown comes from our AI analysis.',
            'We do not replace your own judgment — we inform it.',
          ].map((item) => (
            <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--danger-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--danger)' }}>✕</span>
              </div>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* India mission */}
      <div style={{ background: 'linear-gradient(90deg, #FFF8E7, #FFF4D6)', borderRadius: '20px', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
        <div>
          <h3 style={{ marginBottom: '0.4rem' }}>🇮🇳 Built for a Safer India</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '480px' }}>
            Voice scams are a growing problem across India. EchoForge is designed with Indian consumers in mind — their needs, their languages, their reality.
          </p>
        </div>
        <Heart size={32} style={{ color: '#EF4444', fill: '#EF4444', flexShrink: 0 }} />
      </div>
    </div>
  );
}
