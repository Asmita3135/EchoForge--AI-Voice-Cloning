import React, { useState, useRef } from 'react';
import { UploadDropzone } from '../components/upload/UploadDropzone';
import { ProcessingState } from '../components/status/ProcessingState';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { ErrorBanner } from '../components/common/ErrorBanner';
import {
  Sparkles,
  Upload,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  Phone,
  Volume2,
  AlertTriangle,
  Users,
  Lock,
  Heart,
  Play,
  Mic,
  Brain,
  FileAudio,
  CheckCircle2,
  Zap,
} from 'lucide-react';

/* ====================================================================
   SVG Components
   ==================================================================== */

/** Wavy hand-drawn-style orange underline for "scam?" */
function ScamSvgUnderline() {
  return (
    <svg
      className="scam-svg-underline"
      viewBox="0 0 120 14"
      preserveAspectRatio="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 10 Q15 5 30 9 Q50 14 70 8 Q90 3 107 9 Q115 12 119 8"
        stroke="#F59E0B"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/** Sonar / radar rings — background depth behind phone */
function HeroShieldBackground() {
  return (
    <svg
      className="hero-shield-bg"
      viewBox="0 0 340 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Concentric rings — sonar / signal identity, pale-blue hero tones */}
      <circle cx="170" cy="200" r="155" stroke="#1F5C56" strokeWidth="1" opacity="0.08" />
      <circle cx="170" cy="200" r="125" stroke="#1F5C56" strokeWidth="1" opacity="0.06" />
      <circle cx="170" cy="200" r="95"  stroke="#B5672E" strokeWidth="1" opacity="0.07" />
      <circle cx="170" cy="200" r="65"  stroke="#1F5C56" strokeWidth="0.8" opacity="0.05" />
      {/* Cross-hairs */}
      <line x1="170" y1="45"  x2="170" y2="355" stroke="#1F5C56" strokeWidth="0.5" opacity="0.06" strokeDasharray="4 8" />
      <line x1="15"  y1="200" x2="325" y2="200" stroke="#1F5C56" strokeWidth="0.5" opacity="0.06" strokeDasharray="4 8" />
    </svg>
  );
}


/** Wave divider at hero bottom */
function HeroWaveDivider() {
  return (
    <div className="hero-wave-divider" aria-hidden="true">
      <svg
        viewBox="0 0 1440 56"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{ width: '100%', height: '56px', display: 'block' }}
      >
        <path
          d="M0,28 C240,56 480,0 720,28 C960,56 1200,0 1440,28 L1440,56 L0,56 Z"
          fill="#F7FBFC"
        />
      </svg>
    </div>
  );
}

/* ====================================================================
   Main Component
   ==================================================================== */

export function AnalyzeCallPage({
  targetFile,
  setTargetFile,
  referenceFile,
  setReferenceFile,
  status,
  error,
  fileValidationError,
  runAnalysis,
  healthStatus,
  onNavigateToDemo,
  onNavigateTo,
}) {
  const [showLearnMore, setShowLearnMore] = useState(false);
  const uploadSectionRef = useRef(null);

  const isBackendConnected = healthStatus === 'connected';
  const isAnalyzing = status === 'analyzing';
  const canAnalyze = isBackendConnected && targetFile && !isAnalyzing;

  const scrollToUpload = () => {
    uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const howItWorksSteps = [
    { num: '01', icon: FileAudio, title: 'Upload Call Recording', desc: 'Upload the suspicious call you received as an audio file (MP3, WAV, M4A etc).' },
    { num: '02', icon: Mic, title: 'Voice Authenticity Check', desc: 'EchoForge analyzes acoustic patterns to detect AI-generated or synthetic voice characteristics.' },
    { num: '03', icon: Users, title: 'Speaker Comparison', desc: 'If you provide a reference voice, we compare it with the call recording for identity match.' },
    { num: '04', icon: Brain, title: 'Conversation Risk Analysis', desc: 'We scan the call context for urgency tactics, financial pressure, and impersonation patterns.' },
    { num: '05', icon: ShieldAlert, title: 'Risk Assessment', desc: 'All signals are combined into a single, clear risk verdict: LOW, HIGH, or UNCERTAIN.' },
    { num: '06', icon: ShieldCheck, title: 'Safety Guidance', desc: 'You receive plain-language advice tailored to the verdict — what to do, and what to avoid.' },
  ];

  const redFlags = [
    {
      emoji: '🚨',
      type: 'URGENCY',
      title: 'Time Pressure',
      quote: '"Your account will be blocked in 2 hours. Act immediately."',
    },
    {
      emoji: '🔐',
      type: 'SENSITIVE INFO',
      title: 'OTP & PIN Requests',
      quote: '"Please share your OTP to verify your KYC."',
    },
    {
      emoji: '💳',
      type: 'MONEY REQUEST',
      title: 'Transfer Demand',
      quote: '"Transfer ₹10,000 to secure your account now."',
    },
    {
      emoji: '🎭',
      type: 'IMPERSONATION',
      title: 'False Identity',
      quote: '"I\'m calling from your bank\'s fraud prevention team."',
    },
    {
      emoji: '🔗',
      type: 'SUSPICIOUS LINK',
      title: 'Link Verification',
      quote: '"Open this link to complete your KYC verification."',
    },
  ];

  return (
    <div className="analyze-page" style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>

      {/* ================================================================
          1. HERO — WITH HERO BACKGROUND WRAPPER FOR DEPTH
          ================================================================ */}
      <section className="analyze-page-hero-bg">
        <div className="hero-wrapper">
          {/* LEFT COLUMN */}
          <div>
            <div className="hero-orange-badge">
              <ShieldCheck size={15} />
              <span>Know When a Conversation Becomes a Threat</span>
            </div>

            <h1 className="hero-headline">
              Is this call a{' '}
              <span className="scam-word-wrapper">
                scam?
                <ScamSvgUnderline />
              </span>
            </h1>

            <p className="hero-subheadline">
              EchoForge analyzes voice authenticity, conversation context, and social-engineering behavior in real time to detect scam intent before it becomes a loss.
            </p>

            <div className="hero-cta-group">
              <Button variant="primary" size="lg" onClick={scrollToUpload} icon={Upload}>
                Analyze Call Recording
              </Button>
              <Button variant="secondary" size="lg" onClick={onNavigateToDemo} icon={Play}>
                Try Live Demo
              </Button>
            </div>

            {/* Trust signals */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '1.75rem', flexWrap: 'wrap' }}>
              {[
                { icon: ShieldCheck, text: 'No microphone access' },
                { icon: Lock, text: 'Private analysis' },
                { icon: Zap, text: 'Instant AI verdict' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  <Icon size={14} style={{ color: 'var(--safe)' }} />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN — PREMIUM SMARTPHONE MOCKUP */}
          <div className="hero-visual-container">
            {/* Giant shield background — VERY SUBTLE, behind everything */}
            <HeroShieldBackground />

            {/* Floating Notification Badge 1 — Red (Voice Clone) */}
            <div className="floating-pill red">
              <div className="badge-icon-circle">
                <AlertTriangle size={14} />
              </div>
              <span>Possible AI Voice Clone</span>
            </div>

            {/* Floating Notification Badge 2 — Orange (Anomaly) */}
            <div className="floating-pill orange">
              <div className="badge-icon-circle">
                <Volume2 size={14} />
              </div>
              <span>Voice Anomaly Detected</span>
            </div>

            {/* Floating Notification Badge 3 — Blue (Protected) */}
            <div className="floating-pill blue">
              <div className="badge-icon-circle">
                <ShieldCheck size={14} />
              </div>
              <span>You're Protected with EchoForge</span>
            </div>

            {/* PHYSICAL SMARTPHONE — outer shell provides bezel + tilt + shadow */}
            <div className="phone-outer-shell" role="img" aria-label="Smartphone showing unknown caller alert">
              <div className="phone-illustration-frame">
                {/* Notch bar */}
                <div className="phone-notch-bar">
                  <div className="phone-notch-speaker" />
                </div>

                {/* Screen content */}
                <div className="phone-screen-content">
                  {/* Status bar micro-text */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)', marginBottom: '0.5rem' }}>
                    <span>9:41</span>
                    <span>●●●</span>
                  </div>

                  {/* Incoming call label */}
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                    INCOMING CALL
                  </div>

                  {/* CALLER AVATAR — GLOWING RED */}
                  <div style={{ position: 'relative', marginBottom: '0.85rem' }}>
                    <div className="phone-avatar-danger">
                      <Phone size={36} />
                      <span className="danger-exclamation-dot">!</span>
                    </div>
                    {/* Pulsing ring */}
                    <div className="phone-incoming-ring" />
                  </div>

                  {/* Caller details */}
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.2rem', letterSpacing: '-0.02em' }}>
                    Unknown Caller
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)' }}>
                    +91 98XXXXXX10
                  </span>

                  {/* EchoForge warning strip */}
                  <div style={{
                    marginTop: '1.1rem',
                    background: 'rgba(239,68,68,0.15)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '10px',
                    padding: '0.6rem 0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: '100%',
                  }}>
                    <ShieldAlert size={15} style={{ color: '#F87171', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.72rem', color: '#FCA5A5', fontWeight: 700, textAlign: 'left', lineHeight: 1.3 }}>
                      EchoForge: Risk signals detected
                    </span>
                  </div>

                  {/* Call action buttons */}
                  <div className="phone-call-actions">
                    <button className="phone-action-btn decline" aria-label="Decline call">
                      <Phone size={22} style={{ transform: 'rotate(135deg)', color: '#FFFFFF' }} />
                    </button>
                    <button className="phone-action-btn answer" aria-label="Answer call">
                      <Phone size={22} style={{ color: '#FFFFFF' }} />
                    </button>
                  </div>

                  {/* Disclaimer label */}
                  <div style={{ marginTop: '0.85rem', fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textAlign: 'center' }}>
                    ★ VISUAL REPRESENTATION ONLY
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider at hero bottom */}
        <HeroWaveDivider />
      </section>

      {/* ================================================================
          2. TRUST STRIP
          ================================================================ */}
      <section className="trust-strip-bar" aria-label="Trust message">
        <div className="trust-strip-left">
          <ShieldCheck size={22} style={{ color: 'var(--warning)', flexShrink: 0 }} />
          <span>
            <strong>Because one fake call can cause real damage.</strong>{' '}
            Let EchoForge help you decide before it's too late.
          </span>
        </div>
        <div className="india-tag-pill">
          <span>🇮🇳 Built for a Safer India</span>
          <Heart size={13} style={{ color: 'var(--danger)', fill: 'var(--danger)' }} />
        </div>
      </section>

      {/* ================================================================
          3. FOUR FEATURE CARDS
          ================================================================ */}
      <section aria-labelledby="features-heading">
        <div className="section-heading-center" style={{ marginBottom: '1.75rem' }}>
          <h2 id="features-heading">One recording. Total clarity.</h2>
          <p>EchoForge gives you a thorough, multi-layer security analysis in seconds.</p>
        </div>

        <div className="features-grid">
          {[
            { color: 'blue',   icon: ShieldCheck,  title: 'Detect AI Voice Scams',    desc: 'Find signs of deepfake and cloned voices in calls.' },
            { color: 'green',  icon: Volume2,       title: 'Compare Voices',           desc: 'Check if the caller\'s voice matches the real person.' },
            { color: 'orange', icon: ShieldAlert,   title: 'Understand the Risk',      desc: 'Get a clear, easy-to-understand safety verdict.' },
            { color: 'purple', icon: Users,         title: 'Stay Safer Together',      desc: 'Protect yourself and your family from phone fraud.' },
          ].map(({ color, icon: Icon, title, desc }) => (
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

      {/* ================================================================
          4. INDIA CTA STRIP
          ================================================================ */}
      <div className="india-cta-strip" role="complementary" aria-label="EchoForge mission statement">
        <ShieldCheck size={36} style={{ color: 'var(--warning)', flexShrink: 0 }} />
        <div className="india-cta-strip-center">
          <h3>Because one scam call can change everything.</h3>
          <p>Let EchoForge help you decide before it's too late. Built for real people, in real situations.</p>
        </div>
        <div className="india-tag-pill">
          <span>🇮🇳 Built for a Safer India</span>
          <Heart size={13} style={{ color: '#EF4444', fill: '#EF4444' }} />
        </div>
      </div>

      {/* ================================================================
          5. HOW IT WORKS — 6-STEP TIMELINE
          ================================================================ */}
      <section className="how-it-works-section" aria-labelledby="how-it-works-heading">
        <div className="section-heading-center">
          <h2 id="how-it-works-heading">How EchoForge works</h2>
          <p>Upload a suspicious call and EchoForge does the rest — instantly, clearly, and safely.</p>
        </div>

        <div className="how-it-works-steps">
          {howItWorksSteps.map((step) => (
            <div key={step.num} className="how-step-row">
              <div className="how-step-icon-col">
                <div className="how-step-circle">{step.num}</div>
              </div>
              <div className="how-step-body">
                <div className="how-step-title">{step.title}</div>
                <div className="how-step-desc">{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================
          6. THREE LAYERS OF PROTECTION JOURNEY
          ================================================================ */}
      <section className="protection-journey-section" aria-labelledby="protection-heading">
        <div className="section-heading-center">
          <h2 id="protection-heading">Three layers of protection</h2>
          <p>A calm, step-by-step security journey for every conversation.</p>
        </div>

        <div className="journey-cards-flow">
          <div className="journey-step-card">
            <span className="journey-step-num">01 — Voice Authenticity</span>
            <h4 className="journey-step-title">Synthetic Check</h4>
            <p className="journey-step-desc">Is the voice potentially AI-generated or synthetic?</p>
          </div>

          <div className="journey-flow-arrow"><ArrowRight size={20} /></div>

          <div className="journey-step-card">
            <span className="journey-step-num">02 — Speaker Comparison</span>
            <h4 className="journey-step-title">Identity Match</h4>
            <p className="journey-step-desc">Does the voice resemble the expected speaker?</p>
          </div>

          <div className="journey-flow-arrow"><ArrowRight size={20} /></div>

          <div className="journey-step-card">
            <span className="journey-step-num">03 — Conversation Risk</span>
            <h4 className="journey-step-title">Threat Patterns</h4>
            <p className="journey-step-desc">Does the conversation contain suspicious scam tactics?</p>
          </div>
        </div>
      </section>

      {/* ================================================================
          7. VOICE SCAM RED FLAGS
          ================================================================ */}
      <section className="red-flags-section" aria-labelledby="red-flags-heading">
        <div className="section-heading-center">
          <h2 id="red-flags-heading">Watch out for these red flags</h2>
          <p>Common patterns used in voice scams targeting Indian consumers.</p>
        </div>

        <div className="red-flags-grid">
          {redFlags.map((flag) => (
            <div key={flag.type} className="red-flag-card">
              <div className="red-flag-emoji">{flag.emoji}</div>
              <div className="red-flag-type">{flag.type}</div>
              <div className="red-flag-title">{flag.title}</div>
              <div className="red-flag-quote">{flag.quote}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Button variant="secondary" size="md" onClick={() => onNavigateTo?.('safety')} icon={ShieldCheck}>
            View Full Safety Guide
          </Button>
        </div>
      </section>

      {/* ================================================================
          8. BACKEND STATUS BANNERS & ERRORS
          ================================================================ */}
      {healthStatus === 'unavailable' && (
        <ErrorBanner
          title="Analysis server is unavailable"
          error="EchoForge cannot connect to the analysis server. Please ensure the backend is running at http://127.0.0.1:8000, then try again."
        />
      )}

      {fileValidationError && (
        <ErrorBanner title="This file type isn't supported" error={fileValidationError} />
      )}

      {status === 'error' && error && (
        <ErrorBanner
          title="Something went wrong during analysis"
          error={error.message || "We couldn't complete the analysis. Please try again."}
        />
      )}

      {/* ================================================================
          9. UPLOAD EXPERIENCE
          ================================================================ */}
      <div ref={uploadSectionRef} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', scrollMarginTop: '100px' }}>
        <div>
          <h2>Analyze a suspicious call</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem', fontSize: '1rem' }}>
            Upload your recording and let EchoForge assess the risk.
          </p>
        </div>

        {(status === 'idle' || status === 'filesReady' || status === 'error') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* PRIMARY UPLOAD CARD */}
            <Card className="upload-card-primary">
              <h3 style={{ color: 'var(--primary)', marginBottom: '0.35rem', fontSize: '1.15rem' }}>
                Upload the suspicious call recording
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                The audio file from the call you want EchoForge to analyze.
              </p>
              <UploadDropzone
                id="target-audio-input"
                title="Drop your audio here"
                subtitle="or click Choose File to browse — MP3, WAV, M4A, OGG supported"
                file={targetFile}
                onFileSelect={setTargetFile}
                onFileRemove={() => setTargetFile(null)}
                isRequired={true}
                badgeText="SUSPICIOUS RECORDING"
              />
            </Card>

            {/* SECONDARY REFERENCE VOICE CARD */}
            <Card className="upload-card-secondary">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>
                    Optional: Add a reference voice
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Have a known recording of the real person's voice? Add it here to enable speaker comparison.
                  </p>
                </div>
                <button
                  className="learn-more-btn"
                  onClick={() => setShowLearnMore(!showLearnMore)}
                  type="button"
                  aria-expanded={showLearnMore}
                >
                  <span>Learn more</span>
                  {showLearnMore ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>
              </div>

              {showLearnMore && (
                <div className="learn-more-box">
                  <HelpCircle size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ fontSize: '0.87rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                    A reference voice is a known recording of the person you expect to be on the call. EchoForge compares it with the suspicious recording to check whether the voices belong to the same speaker. Without a reference, speaker comparison is skipped.
                  </p>
                </div>
              )}

              <div style={{ marginTop: '1.25rem' }}>
                <UploadDropzone
                  id="reference-audio-input"
                  title="Drop reference voice file here"
                  subtitle="or click Choose File to select reference audio"
                  file={referenceFile}
                  onFileSelect={setReferenceFile}
                  onFileRemove={() => setReferenceFile(null)}
                  isRequired={false}
                  badgeText="OPTIONAL REFERENCE"
                />
              </div>
            </Card>

            {/* ANALYZE CTA */}
            <div>
              <Button
                variant="primary"
                size="lg"
                onClick={runAnalysis}
                disabled={!canAnalyze}
                icon={Sparkles}
                style={{ width: '100%', justifyContent: 'center', padding: '1.1rem 2rem', fontSize: '1.05rem', borderRadius: '16px' }}
              >
                {!targetFile
                  ? 'Upload a recording to analyze →'
                  : !isBackendConnected
                  ? 'Analysis server offline'
                  : 'Analyze Recording →'}
              </Button>

              <div style={{
                textAlign: 'center',
                marginTop: '0.9rem',
                fontSize: '0.83rem',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
              }}>
                <Lock size={13} />
                <span>Your recording is used only for analysis. It is not stored or shared.</span>
              </div>
            </div>
          </div>
        )}

        {/* ANALYZING STATE */}
        {isAnalyzing && (
          <Card style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
            <ProcessingState />
          </Card>
        )}
      </div>
    </div>
  );
}
