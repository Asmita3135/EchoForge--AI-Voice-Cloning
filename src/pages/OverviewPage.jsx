import React from 'react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { 
  ShieldCheck, 
  ShieldAlert, 
  PhoneCall, 
  Upload, 
  ArrowRight, 
  Activity, 
  Cpu, 
  UserCheck, 
  BrainCircuit,
  Lock,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Building,
  Truck,
  Briefcase,
  Headphones,
  Landmark,
  TrendingUp
} from 'lucide-react';

export function OverviewPage({ onNavigate }) {
  return (
    <div className="overview-page" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {/* 1. Dramatic Clean Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <Activity size={16} style={{ color: 'var(--color-mint)' }} />
          <span>REAL-TIME THREAT INTELLIGENCE ENGINE</span>
        </div>

        <h1 className="hero-title">
          Real-Time Intelligence Against Suspicious Calls.
        </h1>

        <p className="hero-tagline">
          EchoForge listens for manipulation, urgency, impersonation and other risk signals — helping you recognize suspicious conversations before it's too late.
        </p>

        <div className="hero-actions">
          <Button
            variant="primary"
            size="lg"
            onClick={() => onNavigate('/analyze')}
            icon={Upload}
          >
            Analyze a Call
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => onNavigate('/live')}
            icon={PhoneCall}
          >
            See Live Detection
          </Button>
        </div>

        {/* Hero Visual Mockup: Real-Time Intelligence Command Center */}
        <div className="hero-command-mockup">
          <div className="command-column left">
            <div className="mockup-header-tag">INCOMING SIGNAL</div>
            <div className="mockup-caller-box">
              <div className="mockup-caller-icon"><PhoneCall size={22} /></div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-ivory)' }}>Unknown Caller</div>
                <div className="mono-text" style={{ fontSize: '0.8rem', color: 'var(--text-grey)' }}>+91 98XXXXXX21</div>
              </div>
            </div>
            <div className="mockup-pulse-pill">
              <span className="pulse-dot-green"></span>
              <span>LIVE MONITORED</span>
            </div>
          </div>

          <div className="command-column center">
            <div className="mockup-header-tag">AI LIVE TRANSCRIPT STREAM</div>
            <div className="mockup-transcript-stream">
              <div className="transcript-line caller">
                <span className="speaker">Caller:</span> "Your bank account has been flagged for suspicious transfer..."
              </div>
              <div className="transcript-line signal">
                <span className="signal-badge">⚠ URGENCY SIGNAL DETECTED</span>
              </div>
              <div className="transcript-line caller">
                <span className="speaker">Caller:</span> "You must verify your 6-digit OTP immediately."
              </div>
            </div>
          </div>

          <div className="command-column right">
            <div className="mockup-header-tag">RISK ASSESSMENT</div>
            <div className="mockup-score-box">
              <div className="mockup-score-val">82<span className="mockup-score-max">/100</span></div>
              <span className="risk-level-tag high">HIGH RISK</span>
            </div>
            <div className="mockup-footer-note">
              <span>● Monitoring 7 risk indicators</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Horizontal Real-Time Security Status Strip */}
      <section className="security-status-strip">
        <div className="status-strip-item">
          <span className="status-strip-label">SYSTEM STATUS</span>
          <span className="status-strip-val green"><span className="pulse-dot-green"></span> Operational</span>
        </div>
        <div className="status-strip-item">
          <span className="status-strip-label">AI MODEL</span>
          <span className="status-strip-val green"><span className="pulse-dot-green"></span> Active</span>
        </div>
        <div className="status-strip-item">
          <span className="status-strip-label">CALL ANALYSIS</span>
          <span className="status-strip-val green"><span className="pulse-dot-green"></span> Real-time</span>
        </div>
        <div className="status-strip-item">
          <span className="status-strip-label">THREAT DETECTION</span>
          <span className="status-strip-val green"><span className="pulse-dot-green"></span> Monitoring</span>
        </div>
      </section>

      {/* 3. "How It Works" 4-Step Visual Process */}
      <section className="workflow-section">
        <div className="section-header">
          <span className="section-kicker">FOUR-STEP ENGINE</span>
          <h2 className="section-title">How EchoForge Protects You</h2>
          <p className="section-subtitle">
            A multi-vector neural pipeline converting complex acoustic signals into clear, actionable safety guidance.
          </p>
        </div>

        <div className="process-timeline">
          <div className="process-card">
            <div className="process-num">01</div>
            <h3 className="process-title">LISTEN</h3>
            <p className="process-desc">EchoForge receives the conversation audio or live call stream.</p>
          </div>

          <div className="process-arrow"><ArrowRight size={20} /></div>

          <div className="process-card">
            <div className="process-num">02</div>
            <h3 className="process-title">UNDERSTAND</h3>
            <p className="process-desc">AI analyzes voice acoustic phase, pitch, and linguistic context.</p>
          </div>

          <div className="process-arrow"><ArrowRight size={20} /></div>

          <div className="process-card">
            <div className="process-num">03</div>
            <h3 className="process-title">DETECT</h3>
            <p className="process-desc">Voice cloning anomalies and scam intent indicators are identified.</p>
          </div>

          <div className="process-arrow"><ArrowRight size={20} /></div>

          <div className="process-card">
            <div className="process-num">04</div>
            <h3 className="process-title">PROTECT</h3>
            <p className="process-desc">The user receives clear risk scoring and immediate action steps.</p>
          </div>
        </div>
      </section>

      {/* 4. Why EchoForge Section */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="section-header">
          <span className="section-kicker">CORE ADVANTAGES</span>
          <h2 className="section-title">Built Around Your Protection</h2>
        </div>

        <div className="why-grid">
          <div className="why-card">
            <div className="why-icon-box"><Activity size={24} /></div>
            <h3 className="why-card-title">REAL-TIME</h3>
            <p className="why-card-desc">Detection while the conversation is happening, giving you instant warning indicators.</p>
          </div>

          <div className="why-card">
            <div className="why-icon-box"><BrainCircuit size={24} /></div>
            <h3 className="why-card-title">CONTEXT-AWARE</h3>
            <p className="why-card-desc">Understands subtle combinations of voice cloning, speaker mismatch, and pressure tactics.</p>
          </div>

          <div className="why-card">
            <div className="why-icon-box"><ShieldCheck size={24} /></div>
            <h3 className="why-card-title">ACTIONABLE</h3>
            <p className="why-card-desc">Doesn't just give a score — tells you exactly what steps to take to remain safe.</p>
          </div>

          <div className="why-card">
            <div className="why-icon-box"><Lock size={24} /></div>
            <h3 className="why-card-title">PRIVACY-FIRST</h3>
            <p className="why-card-desc">Designed around responsible, secure handling of sensitive audio conversations.</p>
          </div>
        </div>
      </section>

      {/* 5. Threat Types EchoForge Can Recognize */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="section-header">
          <span className="section-kicker">SCAM PATTERN MATRIX</span>
          <h2 className="section-title">Threats EchoForge Can Recognize</h2>
        </div>

        <div className="threats-grid">
          <div className="threat-card">
            <div className="threat-header">
              <Building size={20} className="threat-icon" />
              <h4 className="threat-title">BANKING SCAMS</h4>
            </div>
            <p className="threat-desc">Fake bank representatives requesting account verification or OTP codes under threat of account freeze.</p>
          </div>

          <div className="threat-card">
            <div className="threat-header">
              <Truck size={20} className="threat-icon" />
              <h4 className="threat-title">DELIVERY SCAMS</h4>
            </div>
            <p className="threat-desc">Fraudulent delivery fee demands or parcel hold requests demanding immediate online payments.</p>
          </div>

          <div className="threat-card">
            <div className="threat-header">
              <Briefcase size={20} className="threat-icon" />
              <h4 className="threat-title">JOB SCAMS</h4>
            </div>
            <p className="threat-desc">Fake recruiters requesting registration fees, security deposits, or personal identity details.</p>
          </div>

          <div className="threat-card">
            <div className="threat-header">
              <Headphones size={20} className="threat-icon" />
              <h4 className="threat-title">TECH SUPPORT</h4>
            </div>
            <p className="threat-desc">Fake support agents requesting remote computer access or installing malware applications.</p>
          </div>

          <div className="threat-card">
            <div className="threat-header">
              <Landmark size={20} className="threat-icon" />
              <h4 className="threat-title">GOVERNMENT IMPERSONATION</h4>
            </div>
            <p className="threat-desc">Callers pretending to represent tax, law enforcement, or regulatory agencies threatening legal action.</p>
          </div>

          <div className="threat-card">
            <div className="threat-header">
              <TrendingUp size={20} className="threat-icon" />
              <h4 className="threat-title">INVESTMENT SCAMS</h4>
            </div>
            <p className="threat-desc">Unsolicited pressure to transfer funds into fraudulent high-yield stock or crypto schemes.</p>
          </div>
        </div>
      </section>

      {/* 6. High-Stakes Trust Section */}
      <section className="high-stakes-card">
        <div style={{ maxWidth: '650px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-ivory)', marginBottom: '0.75rem' }}>
            Built for High-Stakes Conversations.
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-grey)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            EchoForge combines zero-delay acoustic deepfake scoring, vocal biometric matching, and threat intent analysis into a trustworthy defense system.
          </p>

          <div className="stakes-features-row">
            <div className="stake-item"><CheckCircle2 size={18} style={{ color: 'var(--color-mint)' }} /> Privacy-aware architecture</div>
            <div className="stake-item"><CheckCircle2 size={18} style={{ color: 'var(--color-mint)' }} /> Secure communication</div>
            <div className="stake-item"><CheckCircle2 size={18} style={{ color: 'var(--color-mint)' }} /> Explainable risk signals</div>
          </div>
        </div>

        <Button variant="primary" size="lg" onClick={() => onNavigate('/analyze')} icon={ArrowRight}>
          Analyze a Call Now
        </Button>
      </section>
    </div>
  );
}
