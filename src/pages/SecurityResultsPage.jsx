import React, { useState } from 'react';
import { DecisionBanner } from '../components/results/DecisionBanner';
import { WhySection } from '../components/results/WhySection';
import { SafetyRecommendation } from '../components/results/SafetyRecommendation';
import { ReliabilityMeter } from '../components/results/ReliabilityMeter';
import { RiskBreakdownPanel } from '../components/results/RiskBreakdownPanel';
import { EvidenceSection } from '../components/results/EvidenceSection';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { RotateCcw, ChevronDown, ChevronUp, Cpu, ShieldCheck } from 'lucide-react';

export function SecurityResultsPage({ result, onResetAndNavigate }) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

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

  return (
    <div className="security-results-page" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Your Call Safety Result
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          AI safety evaluation for your uploaded recording.
        </p>
      </div>

      {/* 1. Verdict Card (LOW / HIGH / INCONCLUSIVE) */}
      <DecisionBanner
        decision={result.decision}
        riskScore={result.risk_score}
        requestId={result.request_id}
      />

      {/* 2. Actionable Safety Card ("What should I do?") */}
      <SafetyRecommendation decision={result.decision} />

      {/* 3. Plain Language Explanation ("Why did EchoForge give this result?") */}
      <WhySection
        reasons={result.reasons || []}
        warnings={result.warnings || []}
        riskBreakdown={result.risk_breakdown || {}}
        humanReviewRequired={result.human_review_required}
      />

      {/* 4. TECHNICAL DETAILS / VIEW AI EVIDENCE ACCORDION */}
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
              View AI Evidence
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

      {/* 5. Bottom Action: Analyze Another Recording */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem', paddingBottom: '2rem' }}>
        <Button variant="secondary" size="lg" onClick={onResetAndNavigate} icon={RotateCcw}>
          Analyze Another Recording
        </Button>
      </div>
    </div>
  );
}
