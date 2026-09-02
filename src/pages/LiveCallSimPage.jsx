import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { 
  Phone, 
  PhoneOff, 
  ShieldAlert, 
  Activity, 
  Clock, 
  Info,
  RotateCcw,
  ArrowRight,
  Radio,
  CheckCircle2
} from 'lucide-react';

export function LiveCallSimPage({ onNavigateToUpload }) {
  const [callState, setCallState] = useState('incoming'); // 'incoming' | 'in-call' | 'demo-result'
  const [callSeconds, setCallSeconds] = useState(0);
  const [simProgressStage, setSimProgressStage] = useState(0);

  const STAGES = [
    { label: 'Simulated voice received', sub: 'Listening to incoming simulated audio stream...' },
    { label: 'Voice authenticity check', sub: 'Scanning phase coherence & synthetic voice artifacts...' },
    { label: 'Speaker comparison', sub: 'Skipped — No reference voice provided for demo...' },
    { label: 'Conversation risk check', sub: 'Detecting urgency language & banking threat patterns...' },
    { label: 'Safety result', sub: 'Finalizing simulated threat assessment...' },
  ];

  // Call timer simulation
  useEffect(() => {
    let timer;
    if (callState === 'in-call') {
      timer = setInterval(() => {
        setCallSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callState]);

  // Demo stage progression sequence
  useEffect(() => {
    let stageTimer;
    if (callState === 'in-call') {
      if (simProgressStage < STAGES.length - 1) {
        stageTimer = setTimeout(() => {
          setSimProgressStage((prev) => prev + 1);
        }, 1800);
      } else {
        setCallState('demo-result');
      }
    }
    return () => clearInterval(stageTimer);
  }, [callState, simProgressStage, STAGES.length]);

  const handleStartDemo = () => {
    setCallState('in-call');
    setCallSeconds(4);
    setSimProgressStage(0);
  };

  const handleResetDemo = () => {
    setCallState('incoming');
    setCallSeconds(0);
    setSimProgressStage(0);
  };

  const formatCallTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="live-demo-page" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* PROMINENT MANDATORY DISCLAIMER AT TOP */}
      <div className="demo-disclaimer-banner">
        <Info size={22} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: 'var(--warning)', fontSize: '1rem' }}>
            Demonstration only
          </strong>
          <p style={{ marginTop: '0.25rem', color: 'var(--text-primary)', fontSize: '0.92rem', lineHeight: 1.5 }}>
            Live microphone analysis is not enabled in this MVP. This interactive simulation demonstrates how EchoForge's real-time call protection interface will operate in a future mobile release. To analyze an audio file using our live AI backend, go to <button className="learn-more-btn" style={{ display: 'inline', padding: 0 }} onClick={onNavigateToUpload}>Analyze Call</button>.
          </p>
        </div>
      </div>

      {/* Main Demo Workspace */}
      <div className="call-sim-workspace">
        {/* Left Informational Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
              <Radio size={20} />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Live Security Scan Demo</h2>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Experience how EchoForge evaluates live conversation streams, identifies synthetic voice artifacts, and delivers real-time safety warnings during incoming calls.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                <span>Simulated Frontend Storyboard — Zero microphone permissions requested</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                <span>5-Stage Visual Security Sequence</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                <span>Instant Safety Guidance &amp; Scam Warnings</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Phone HUD Simulator */}
        <div className="phone-frame-wrapper">
          <div className="phone-frame">
            <div className="phone-top-bar">
              <div className="phone-speaker"></div>
            </div>

            <div className="phone-screen">
              {/* STATE 1: INCOMING CALL */}
              {callState === 'incoming' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%', justifyContent: 'space-between' }}>
                  <div className="simulated-audio-badge">
                    SIMULATED PHONE HUD
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Phone size={30} />
                    </div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF' }}>Unknown Caller</h2>
                    <span className="mono-text" style={{ fontSize: '0.95rem', color: '#E8F4F6' }}>+91 98XXXXXX10</span>
                  </div>

                  <button className="ef-btn ef-btn-primary" style={{ width: '100%', padding: '0.95rem' }} onClick={handleStartDemo}>
                    <Phone size={20} />
                    <span>Start Demo</span>
                  </button>
                </div>
              )}

              {/* STATE 2: ACTIVE CALL SIMULATION */}
              {callState === 'in-call' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%', justifyContent: 'space-between' }}>
                  <div className="simulated-audio-badge highlight">
                    SIMULATED AUDIO &bull; SIMULATED DATA
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>Unknown Caller</h3>
                    <span className="mono-text" style={{ fontSize: '0.85rem', color: '#E8F4F6' }}>+91 98XXXXXX10</span>
                  </div>

                  <div className="mono-text" style={{ fontSize: '1rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={16} />
                    <span>{formatCallTime(callSeconds)}</span>
                  </div>

                  {/* Dynamic Progress Checklist */}
                  <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '0.85rem', width: '100%', textAlign: 'left' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFFFFF' }}>
                      {STAGES[simProgressStage].label}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9FB3C8', marginTop: '0.2rem' }}>
                      {STAGES[simProgressStage].sub}
                    </div>
                  </div>

                  {/* Animated Waveform */}
                  <div className="waveform-loader" style={{ height: '36px' }}>
                    <div className="waveform-bar" style={{ background: '#FFFFFF' }}></div>
                    <div className="waveform-bar" style={{ background: '#FFFFFF' }}></div>
                    <div className="waveform-bar" style={{ background: '#FFFFFF' }}></div>
                    <div className="waveform-bar" style={{ background: '#FFFFFF' }}></div>
                    <div className="waveform-bar" style={{ background: '#FFFFFF' }}></div>
                  </div>

                  <button className="ef-btn ef-btn-danger" style={{ width: '100%', padding: '0.85rem' }} onClick={() => setCallState('demo-result')}>
                    <PhoneOff size={18} />
                    <span>End Call</span>
                  </button>
                </div>
              )}

              {/* STATE 3: SIMULATED RESULT */}
              {callState === 'demo-result' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%', justifyContent: 'space-between' }}>
                  <div className="simulated-audio-badge" style={{ backgroundColor: 'var(--danger)', color: '#FFFFFF' }}>
                    SIMULATED DATA
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldAlert size={48} style={{ color: '#F87171' }} />
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F87171' }}>High Risk</h3>
                    <p style={{ fontSize: '0.85rem', color: '#E8F4F6' }}>
                      This simulated call shows several warning signs.
                    </p>
                  </div>

                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={onNavigateToUpload}
                      icon={ArrowRight}
                      style={{ width: '100%' }}
                    >
                      Analyze Call Recording
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleResetDemo}
                      icon={RotateCcw}
                      style={{ width: '100%' }}
                    >
                      Restart Live Demo
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
