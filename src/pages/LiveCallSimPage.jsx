import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { VoiceIntentComparison } from '../components/results/VoiceIntentComparison';
import { ScamIntentRadar } from '../components/results/ScamIntentRadar';
import { WhyWarning } from '../components/results/WhyWarning';
import { CallerTacticsTimeline } from '../components/results/CallerTacticsTimeline';
import { RiskJourney } from '../components/results/RiskJourney';
import { ConversationHeatmap } from '../components/results/ConversationHeatmap';
import { SafetyIntervention } from '../components/results/SafetyIntervention';
import { EvidenceDrawer } from '../components/results/EvidenceDrawer';
import { AIActivity } from '../components/status/AIActivity';
import { 
  Phone, 
  PhoneOff, 
  ShieldAlert, 
  ShieldCheck,
  Activity, 
  Clock, 
  Info,
  RotateCcw,
  ArrowRight,
  Radio,
  CheckCircle2,
  Eye,
  AlertTriangle,
  Brain,
  Mic,
  Zap
} from 'lucide-react';

export function LiveCallSimPage({ onNavigateToUpload }) {
  const [callState, setCallState] = useState('incoming'); // 'incoming' | 'in-call' | 'demo-result'
  const [callSeconds, setCallSeconds] = useState(0);
  const [simProgressStage, setSimProgressStage] = useState(0);
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState(false);

  // Dynamic real-time simulation stages
  const STAGES = [
    {
      label: 'Call Connected & Baseline Stream',
      sub: 'Phonetic analysis: Human voice frequency detected (94% genuine acoustic score).',
      riskScore: 8,
      riskLevel: 'LOW',
      activeSignal: 'Call Initialized',
      transcriptSnippet: 'Hello? Am I speaking with the account holder?',
    },
    {
      label: 'Urgency Pattern Flagged',
      sub: 'Caller creates artificial urgency: "Your card is flagged for immediate cancellation."',
      riskScore: 31,
      riskLevel: 'UNCERTAIN',
      activeSignal: 'Urgency Detected (+12)',
      transcriptSnippet: 'Your debit card was flagged for unauthorized activity. Act immediately.',
    },
    {
      label: 'Authority Impersonation Identified',
      sub: 'Caller falsely claims identity from Central Bank Security Division.',
      riskScore: 57,
      riskLevel: 'UNCERTAIN',
      activeSignal: 'Impersonation Pattern (+18)',
      transcriptSnippet: 'I am the senior fraud mitigation officer managing your branch.',
    },
    {
      label: 'Critical OTP Request Detected',
      sub: 'Direct demand for SMS verification code and authentication passkey.',
      riskScore: 84,
      riskLevel: 'HIGH',
      activeSignal: 'OTP Code Request (+26)',
      transcriptSnippet: 'Read me the 6-digit OTP code sent to your phone right now.',
    },
    {
      label: 'Coercive Pressure & Threat',
      sub: 'Caller forbids hanging up or contacting local branch under penalty of legal action.',
      riskScore: 91,
      riskLevel: 'HIGH',
      activeSignal: 'Threat & Pressure (+20)',
      transcriptSnippet: 'Do not disconnect this call or your account will be permanently frozen.',
    },
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
        }, 2600);
      } else {
        stageTimer = setTimeout(() => {
          setCallState('demo-result');
        }, 2200);
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

  const currentStage = STAGES[simProgressStage] || STAGES[0];
  const isHighRisk = currentStage.riskLevel === 'HIGH';
  const isUncertain = currentStage.riskLevel === 'UNCERTAIN';

  return (
    <div className="live-demo-page" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* PROMINENT MANDATORY DISCLAIMER AT TOP */}
      <div className="demo-disclaimer-banner">
        <Info size={22} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: 'var(--warning)', fontSize: '1rem' }}>
            Interactive Scenario Simulation
          </strong>
          <p style={{ marginTop: '0.25rem', color: 'var(--text-primary)', fontSize: '0.92rem', lineHeight: 1.5 }}>
            This simulation demonstrates how EchoForge analyzes incoming audio in real time, detecting social-engineering tactics and evolving threat levels as a conversation progresses. To analyze a real call recording with the live backend, navigate to{' '}
            <button className="learn-more-btn" style={{ display: 'inline', padding: 0 }} onClick={onNavigateToUpload}>
              Analyze Call
            </button>.
          </p>
        </div>
      </div>

      {/* Main Demo Workspace */}
      <div className="call-sim-workspace" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Informational & AI Intelligence Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
              <Radio size={20} />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Real-Time Scam Intent Engine</h2>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              EchoForge listens to conversational dialogue, continuously re-evaluating manipulation signals, urgency patterns, and credential extraction tactics.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                <span>Dual-Pipeline: Acoustic Voice Authenticity + Linguistic Intent</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                <span>Continuous Risk Reassessment (+Δ Scoring)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                <span>Explainable Threat Evidence &amp; Immediate Intervention</span>
              </div>
            </div>
          </Card>

          {/* Real-time AI Pipeline Activity Tracker */}
          <AIActivity activeStageIndex={callState === 'in-call' ? simProgressStage : callState === 'demo-result' ? 4 : 0} />
        </div>

        {/* Right Phone HUD Simulator */}
        <div className="phone-frame-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
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
                    <span>Start Live Threat Demo</span>
                  </button>
                </div>
              )}

              {/* STATE 2: ACTIVE CALL SIMULATION */}
              {callState === 'in-call' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%', justifyContent: 'space-between', gap: '0.75rem' }}>
                  
                  {/* Top Live Badge with dynamic risk tag */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <div className="simulated-audio-badge highlight" style={{ margin: 0 }}>
                      ● LIVE MONITOR
                    </div>
                    <span
                      className="mono-text"
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        background: isHighRisk ? 'var(--danger)' : isUncertain ? 'var(--warning)' : 'var(--success)',
                        color: '#FFFFFF',
                      }}
                    >
                      {currentStage.riskLevel} {currentStage.riskScore}%
                    </span>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF' }}>Unknown Caller</h3>
                    <span className="mono-text" style={{ fontSize: '0.8rem', color: '#E8F4F6' }}>+91 98XXXXXX10</span>
                  </div>

                  {/* Call Timer */}
                  <div className="mono-text" style={{ fontSize: '0.9rem', color: 'var(--accent-light)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={15} />
                    <span>{formatCallTime(callSeconds)}</span>
                  </div>

                  {/* Live AI Transcript & Signal Box */}
                  <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.75rem', width: '100%', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--copper-light)', textTransform: 'uppercase' }}>
                        {currentStage.label}
                      </span>
                      <span className="mono-text" style={{ fontSize: '0.7rem', color: isHighRisk ? '#F87171' : 'var(--accent-light)' }}>
                        {currentStage.activeSignal}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.78rem', color: '#E8F4F6', fontStyle: 'italic', lineHeight: 1.35 }}>
                      "{currentStage.transcriptSnippet}"
                    </p>
                  </div>

                  {/* Animated Live Waveform */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', width: '100%' }}>
                    <div className="waveform-loader" style={{ height: '32px' }}>
                      <div className="waveform-bar" style={{ background: isHighRisk ? '#F87171' : '#FFFFFF' }}></div>
                      <div className="waveform-bar" style={{ background: isHighRisk ? '#F87171' : '#FFFFFF' }}></div>
                      <div className="waveform-bar" style={{ background: isHighRisk ? '#F87171' : '#FFFFFF' }}></div>
                      <div className="waveform-bar" style={{ background: isHighRisk ? '#F87171' : '#FFFFFF' }}></div>
                      <div className="waveform-bar" style={{ background: isHighRisk ? '#F87171' : '#FFFFFF' }}></div>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-mono)' }}>
                      AI continuously analyzing conversation...
                    </span>
                  </div>

                  <button className="ef-btn ef-btn-danger" style={{ width: '100%', padding: '0.75rem', fontSize: '0.85rem' }} onClick={() => setCallState('demo-result')}>
                    <PhoneOff size={16} />
                    <span>End Call (Evaluate Threat)</span>
                  </button>
                </div>
              )}

              {/* STATE 3: SIMULATED RESULT */}
              {callState === 'demo-result' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <div className="simulated-audio-badge" style={{ backgroundColor: 'var(--danger)', color: '#FFFFFF' }}>
                    HIGH RISK ATTACK IDENTIFIED
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', textAlign: 'center' }}>
                    <ShieldAlert size={44} style={{ color: '#F87171' }} />
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#F87171' }}>91% Threat Score</h3>
                    <p style={{ fontSize: '0.82rem', color: '#E8F4F6', lineHeight: 1.35 }}>
                      Genuine human voice (94%) detected executing high-risk OTP harvesting &amp; bank impersonation.
                    </p>
                  </div>

                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={onNavigateToUpload}
                      icon={ArrowRight}
                      style={{ width: '100%' }}
                    >
                      Analyze Real Recording
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

      {/* When in demo-result state: Show full post-call intelligence storyboard */}
      {callState === 'demo-result' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.3s ease-in-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Simulated Post-Call Forensic Breakdown
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Here is how EchoForge deconstructed the simulated attack in real time.
              </p>
            </div>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setIsEvidenceDrawerOpen(true)}
              icon={Eye}
            >
              Open Evidence Matrix
            </Button>
          </div>

          {/* Safety Intervention Card */}
          <SafetyIntervention
            onEndCall={handleResetDemo}
            onOpenSafetyGuide={() => {}}
          />

          {/* Voice Authenticity vs Scam Intent */}
          <VoiceIntentComparison
            voiceAuthenticity={94}
            isVoiceSynthetic={false}
            scamIntentScore={91}
            riskLevel="HIGH"
          />

          {/* Scam Intent Radar */}
          <ScamIntentRadar
            overallScore={91}
            riskLevel="HIGH"
          />

          {/* "Why I'm Warning You" */}
          <WhyWarning />

          {/* Caller Tactics Timeline */}
          <CallerTacticsTimeline />

          {/* Dynamic Risk Journey */}
          <RiskJourney />

          {/* Conversation Heatmap */}
          <ConversationHeatmap />

          {/* Evidence Drawer */}
          <EvidenceDrawer
            isOpen={isEvidenceDrawerOpen}
            onClose={() => setIsEvidenceDrawerOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
