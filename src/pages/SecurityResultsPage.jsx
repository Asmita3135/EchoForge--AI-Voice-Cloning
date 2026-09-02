import React, { useState } from 'react';
import { DecisionBanner } from '../components/results/DecisionBanner';
import { WhySection } from '../components/results/WhySection';
import { SafetyRecommendation } from '../components/results/SafetyRecommendation';
import { ReliabilityMeter } from '../components/results/ReliabilityMeter';
import { RiskBreakdownPanel } from '../components/results/RiskBreakdownPanel';
import { EvidenceSection } from '../components/results/EvidenceSection';
import { VoiceIntentComparison } from '../components/results/VoiceIntentComparison';
import { ScamIntentRadar } from '../components/results/ScamIntentRadar';
import { WhyWarning } from '../components/results/WhyWarning';
import { CallerTacticsTimeline } from '../components/results/CallerTacticsTimeline';
import { RiskJourney } from '../components/results/RiskJourney';
import { ConversationHeatmap } from '../components/results/ConversationHeatmap';
import { SafetyIntervention } from '../components/results/SafetyIntervention';
import { EvidenceDrawer } from '../components/results/EvidenceDrawer';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { RotateCcw, ChevronDown, ChevronUp, Cpu, ShieldCheck, Eye } from 'lucide-react';

export function SecurityResultsPage({ result, onResetAndNavigate }) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState(false);

  if (!result) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <ShieldCheck size={52} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No Call Analyses Available</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Upload a call recording to begin AI security analysis.
        </p>
        <Button variant="primary" size="lg" onClick={onResetAndNavigate} icon={RotateCcw}>
          Analyze a Call Recording
        </Button>
      </div>
    );
  }

  // Derive metrics safely from result payload
  const riskScore = typeof result.risk_score === 'number' ? Math.round(result.risk_score) : 75;
  const isHigh = result.decision === 'HIGH';
  const isLow = result.decision === 'LOW';

  // Voice Authenticity vs Scam Intent calculations
  const syntheticRisk = result.risk_breakdown?.synthetic_voice_risk ?? (isHigh ? 25 : 8);
  const voiceAuthenticity = Math.max(0, Math.min(100, Math.round(100 - syntheticRisk)));
  const scamIntentScore = result.risk_breakdown?.context_risk ?? riskScore;

  // Transcript fallback
  const rawTranscript = result.evidence?.member3?.raw?.transcript;
  const transcriptSegments = rawTranscript
    ? [
        {
          time: '00:08',
          speaker: 'Caller',
          text: rawTranscript,
          highlight: isHigh ? 'otp_harvesting' : null,
          category: isHigh ? 'SUSPICIOUS INTENT' : 'CONVERSATION',
          riskContribution: isHigh ? `+${riskScore} Risk` : '+0 Risk',
          explanation: 'Extracted speech pattern evaluated against threat database.',
        },
      ]
    : undefined;

  return (
    <div className="security-results-page" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Your Call Safety Result
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Comprehensive AI threat evaluation for your uploaded recording.
          </p>
        </div>
        <Button
          variant="secondary"
          size="md"
          onClick={() => setIsEvidenceDrawerOpen(true)}
          icon={Eye}
        >
          View Evidence Matrix
        </Button>
      </div>

      {/* 1. Critical Safety Intervention (when High Risk) */}
      {isHigh && (
        <SafetyIntervention
          onEndCall={onResetAndNavigate}
          onOpenSafetyGuide={() => {}}
        />
      )}

      {/* 2. Verdict Card (LOW / HIGH / INCONCLUSIVE) */}
      <DecisionBanner
        decision={result.decision}
        riskScore={result.risk_score}
        requestId={result.request_id}
      />

      {/* 3. Core Differentiator: Voice Authenticity vs Scam Intent */}
      <VoiceIntentComparison
        voiceAuthenticity={voiceAuthenticity}
        isVoiceSynthetic={syntheticRisk > 50}
        scamIntentScore={scamIntentScore}
        riskLevel={result.decision}
      />

      {/* 4. Scam Intent Radar (Attack Vector Visualization) */}
      <ScamIntentRadar
        overallScore={scamIntentScore}
        riskLevel={result.decision}
      />

      {/* 5. "Why I'm Warning You" Explanation Panel */}
      <WhyWarning />

      {/* 6. Actionable Safety Card ("What should I do?") */}
      <SafetyRecommendation decision={result.decision} />

      {/* 7. Caller Tactics Timeline (Attack Chain Lifecycle) */}
      <CallerTacticsTimeline />

      {/* 8. Dynamic Risk Journey (Compounding Timeline) */}
      <RiskJourney />

      {/* 9. Conversation Heatmap (Annotated Transcript) */}
      <ConversationHeatmap transcriptSegments={transcriptSegments} />

      {/* 10. Plain Language Explanation ("Why did EchoForge give this result?") */}
      <WhySection
        reasons={result.reasons || []}
        warnings={result.warnings || []}
        riskBreakdown={result.risk_breakdown || {}}
        humanReviewRequired={result.human_review_required}
      />

      {/* 11. TECHNICAL DETAILS / VIEW AI EVIDENCE ACCORDION */}
      <Card style={{ padding: '0', overflow: 'hidden' }}>
        <button
          className="technical-accordion-header"
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          type="button"
          aria-expanded={showTechnicalDetails}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Cpu size={22} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              View Pipeline Evidence
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <span>{showTechnicalDetails ? 'Collapse' : 'Expand technical details'}</span>
            {showTechnicalDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </button>

        {showTechnicalDetails && (
          <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderTop: '1px solid var(--border)' }}>
            {/* Reliability Score & Risk Breakdown */}
            <div className="results-grid">
              <ReliabilityMeter
                reliabilityScore={result.reliability_score}
                humanReviewRequired={result.human_review_required}
              />

              <RiskBreakdownPanel
                riskBreakdown={result.risk_breakdown}
                evidence={result.evidence}
              />
            </div>

            {/* Member 1, Member 2, Member 3 Cards */}
            <EvidenceSection
              evidence={result.evidence || {}}
              reasons={[]}
              warnings={[]}
            />
          </div>
        )}
      </Card>

      {/* Evidence Drawer Modal */}
      <EvidenceDrawer
        isOpen={isEvidenceDrawerOpen}
        onClose={() => setIsEvidenceDrawerOpen(false)}
      />

      {/* 12. Bottom Action: Analyze Another Recording */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem', paddingBottom: '2rem' }}>
        <Button variant="secondary" size="lg" onClick={onResetAndNavigate} icon={RotateCcw}>
          Analyze Another Recording
        </Button>
      </div>
    </div>
  );
}
