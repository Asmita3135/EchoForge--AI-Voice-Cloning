import React from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { 
  ShieldCheck, 
  PhoneCall, 
  Upload, 
  Cpu, 
  UserCheck, 
  BrainCircuit, 
  ArrowRight,
  ShieldAlert,
  Mic,
  Activity,
  FileText,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

export function DashboardPage({ onNavigate }) {
  return (
    <div className="dashboard-page" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <ShieldCheck size={16} />
          <span>AI-POWERED VOICE IMPERSONATION DEFENSE</span>
        </div>

        <h1 className="hero-title">
          Stay Safe From Voice Impersonation Scams
        </h1>

        <p className="hero-tagline">
          EchoForge uses AI to analyze voice authenticity and conversation context to identify suspicious calls before they cause financial or security harm.
        </p>

        <div className="hero-actions">
          <Button
            variant="primary"
            size="lg"
            onClick={() => onNavigate('analyze-recording')}
            icon={Upload}
          >
            Analyze a Call Recording
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => onNavigate('live-call')}
            icon={PhoneCall}
          >
            Try Live Call Protection
          </Button>
        </div>
      </section>

      {/* Workflow Visualization Diagram */}
      <section className="workflow-section">
        <div className="section-header">
          <h2 className="section-title">How EchoForge Protects You</h2>
          <p className="section-subtitle">
            EchoForge checks multiple signals before giving you a clear security assessment.
          </p>
        </div>

        <div className="workflow-flow-bar">
          <div className="flow-step">
            <div className="flow-icon"><Mic size={22} /></div>
            <div className="flow-label">VOICE AUDIO</div>
            <div className="flow-sub">Call Recording</div>
          </div>

          <div className="flow-arrow"><ArrowRight size={20} /></div>

          <div className="flow-step">
            <div className="flow-icon"><Activity size={22} /></div>
            <div className="flow-label">AI ANALYSIS</div>
            <div className="flow-sub">Multi-Vector Engine</div>
          </div>

          <div className="flow-arrow"><ArrowRight size={20} /></div>

          <div className="flow-step">
            <div className="flow-icon"><ShieldCheck size={22} /></div>
            <div className="flow-label">RISK ASSESSMENT</div>
            <div className="flow-sub">Score &amp; Confidence</div>
          </div>

          <div className="flow-arrow"><ArrowRight size={20} /></div>

          <div className="flow-step">
            <div className="flow-icon"><CheckCircle2 size={22} /></div>
            <div className="flow-label">RECOMMENDATION</div>
            <div className="flow-sub">Clear Guidance</div>
          </div>
        </div>
      </section>

      {/* 3 AI Analysis Layers Explained Simply */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Three Layers of AI Security</h2>
        
        <div className="architecture-grid">
          {/* Layer 1 */}
          <div className="arch-card">
            <div className="arch-header">
              <div className="arch-icon-wrapper layer-1">
                <Cpu size={24} />
              </div>
              <div>
                <h3 className="arch-title">1. Voice Authenticity</h3>
                <span className="arch-tag">Synthetic Voice Detection</span>
              </div>
            </div>
            <p className="arch-desc">
              Detects signs of AI-generated or manipulated speech by analyzing acoustic spectral properties, phase coherence, and synthetic voice generator artifacts.
            </p>
          </div>

          {/* Layer 2 */}
          <div className="arch-card">
            <div className="arch-header">
              <div className="arch-icon-wrapper layer-2">
                <UserCheck size={24} />
              </div>
              <div>
                <h3 className="arch-title">2. Speaker Verification</h3>
                <span className="arch-tag">Biometric Vocal Matching</span>
              </div>
            </div>
            <p className="arch-desc">
              Checks whether the caller's vocal profile matches an authentic reference recording of the claimed person when reference audio is provided.
            </p>
          </div>

          {/* Layer 3 */}
          <div className="arch-card">
            <div className="arch-header">
              <div className="arch-icon-wrapper layer-3">
                <BrainCircuit size={24} />
              </div>
              <div>
                <h3 className="arch-title">3. Conversation Context</h3>
                <span className="arch-tag">Scam Intent Analysis</span>
              </div>
            </div>
            <p className="arch-desc">
              Detects suspicious language patterns such as urgent money transfer demands, account suspension threats, OTP/credential harvesting, and social engineering.
            </p>
          </div>
        </div>
      </section>

      {/* Dual Feature Cards */}
      <section className="feature-cards-grid">
        {/* Card 1: LIVE CALL PROTECTION */}
        <div className="feature-card feature-card-sim">
          <div className="feature-card-header">
            <div className="feature-icon-wrapper sim">
              <PhoneCall size={28} />
            </div>
            <span className="feature-type-badge sim-badge">
              VISUAL DEMO SIMULATION
            </span>
          </div>

          <div className="feature-card-body">
            <h3 className="feature-card-title">
              🛡 Live Call Protection — Demo
            </h3>
            <p className="feature-card-subtitle">
              Simulated real-time mobile phone security screen
            </p>
            <p className="feature-card-desc">
              Experience a visual prototype demonstrating how EchoForge would intercept incoming calls, alert users to synthetic voices in real time, and show HUD security warnings.
            </p>
          </div>

          <div className="feature-card-footer">
            <div className="feature-note">
              <span>● No microphone permissions used (UI Simulation)</span>
            </div>
            <Button
              variant="secondary"
              size="md"
              onClick={() => onNavigate('live-call')}
              icon={ArrowRight}
            >
              Try Live Call Protection
            </Button>
          </div>
        </div>

        {/* Card 2: ANALYZE CALL RECORDING */}
        <div className="feature-card feature-card-mvp">
          <div className="feature-card-header">
            <div className="feature-icon-wrapper mvp">
              <Upload size={28} />
            </div>
            <span className="feature-type-badge mvp-badge">
              ACTUAL WORKING MVP
            </span>
          </div>

          <div className="feature-card-body">
            <h3 className="feature-card-title">
              🎙 Analyze Call Recording
            </h3>
            <p className="feature-card-subtitle">
              Upload a recording for live AI forensic analysis
            </p>
            <p className="feature-card-desc">
              Upload a suspicious audio file directly to our backend to run full multi-vector forensic evaluation, receive risk breakdown scores, and inspect detailed evidence reports.
            </p>
          </div>

          <div className="feature-card-footer">
            <div className="feature-note highlight">
              <span>● Connected to http://127.0.0.1:8000</span>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => onNavigate('analyze-recording')}
              icon={ArrowRight}
            >
              Analyze a Call Recording
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
