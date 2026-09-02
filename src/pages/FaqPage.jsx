import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ShieldCheck, Upload } from 'lucide-react';
import { Button } from '../components/common/Button';

const FAQ_CATEGORIES = [
  {
    category: 'About EchoForge',
    questions: [
      {
        q: 'What is EchoForge?',
        a: 'EchoForge is an AI-powered voice security tool that analyzes call recordings to detect signs of voice cloning, speaker mismatch, and suspicious conversation patterns. It helps you understand whether a suspicious call may pose a risk.',
      },
      {
        q: 'Who is EchoForge built for?',
        a: 'EchoForge is built for everyday people — anyone who has received a suspicious call and wants to understand the risk. It is designed to be accessible to elderly users, non-technical users, and Indian consumers who may be targeted by voice scams.',
      },
      {
        q: 'Is EchoForge free to use?',
        a: 'The current version of EchoForge is an MVP demonstration. Pricing for a production version has not been announced.',
      },
    ],
  },
  {
    category: 'Voice Analysis',
    questions: [
      {
        q: 'How does EchoForge analyze a call?',
        a: 'EchoForge runs three checks: (1) Voice Authenticity — does the voice show signs of being AI-generated? (2) Speaker Comparison — if you provide a reference voice, does it match the caller? (3) Conversation Risk — does the conversation include scam-related language or urgency patterns? All three signals are combined into a single risk verdict.',
      },
      {
        q: 'What audio formats are supported?',
        a: 'EchoForge accepts most common audio formats including MP3, WAV, M4A, OGG, and FLAC. The file should contain audible speech for best results.',
      },
      {
        q: 'What if I don\'t have a reference voice?',
        a: 'Analysis can still proceed without a reference voice. Voice authenticity and conversation risk checks will still run. Speaker comparison (Member 2) will be skipped, and the result will note that speaker verification was unavailable.',
      },
    ],
  },
  {
    category: 'Understanding Results',
    questions: [
      {
        q: 'What does "HIGH RISK" mean?',
        a: 'HIGH RISK means EchoForge detected one or more significant risk signals — such as synthetic voice characteristics, a mismatch with the reference speaker, or suspicious conversation patterns. It does not prove fraud with absolute certainty, but it means you should treat the call with caution and not share sensitive information.',
      },
      {
        q: 'Does "LOW RISK" mean the call is guaranteed safe?',
        a: 'No. EchoForge provides an assessment, not a guarantee. LOW RISK means no major risk signals were detected, but the absence of detected risk does not confirm the caller is genuine. Always use your own judgment and verify important requests through official channels.',
      },
      {
        q: 'What does "UNCERTAIN RESULT" mean?',
        a: 'UNCERTAIN (or INCONCLUSIVE) means the signals from the analysis were mixed or insufficient to give a confident verdict. Treat the call with caution in this case.',
      },
      {
        q: 'Why did EchoForge flag a call as HIGH RISK even though the voice sounded real?',
        a: 'Advanced AI voice cloning can sound extremely realistic. EchoForge looks at deeper acoustic properties rather than how natural the voice sounds to a human ear. A HIGH RISK verdict with a genuine-sounding voice may mean the speaker was not the expected person, or that conversation patterns were suspicious.',
      },
    ],
  },
  {
    category: 'Privacy & Security',
    questions: [
      {
        q: 'Is EchoForge listening to my microphone?',
        a: 'No. EchoForge never accesses your microphone. The current MVP requires you to upload a pre-recorded audio file. The Live Demo tab is a frontend simulation — it does not capture any audio.',
      },
      {
        q: 'Is my uploaded audio stored or shared?',
        a: 'Your uploaded audio is sent to the EchoForge analysis backend for processing and is not publicly displayed. In this MVP, no persistent data storage is configured. Always review the privacy policy of any production service before uploading sensitive recordings.',
      },
    ],
  },
  {
    category: 'Live Demo',
    questions: [
      {
        q: 'What is the Live Demo?',
        a: 'The Live Demo is a frontend simulation showing how EchoForge would look and behave if real-time call monitoring were enabled in a future mobile release. It does not access the microphone, does not analyze any real audio, and all data shown is simulated.',
      },
      {
        q: 'Can I use the Live Demo to analyze a real call?',
        a: 'No. The Live Demo is entirely simulated. To analyze a real call recording, use the Analyze Call tab and upload your audio file.',
      },
    ],
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-accordion-item">
      <button
        className="faq-accordion-trigger"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="faq-question">{q}</span>
        {open
          ? <ChevronUp size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          : <ChevronDown size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
      </button>
      {open && (
        <div className="faq-accordion-body">
          {a}
        </div>
      )}
    </div>
  );
}

export function FaqPage({ onNavigateTo }) {
  return (
    <div className="faq-section">
      {/* Header */}
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--soft-blue)', color: 'var(--primary)', padding: '0.35rem 1rem', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 800, marginBottom: '1rem' }}>
          <ShieldCheck size={14} />
          <span>Frequently Asked Questions</span>
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '0.5rem' }}>
          Common Questions
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '560px' }}>
          Everything you need to know about EchoForge, voice analysis, and staying safe from scam calls.
        </p>
      </div>

      {/* FAQ categories */}
      {FAQ_CATEGORIES.map((cat) => (
        <div key={cat.category} className="faq-category-group">
          <div className="faq-category-label">{cat.category}</div>
          {cat.questions.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      ))}

      {/* Bottom CTA */}
      <div style={{
        background: 'var(--soft-blue)',
        borderRadius: '20px',
        padding: '2rem',
        textAlign: 'center',
        border: '1px solid rgba(15,76,92,0.15)',
      }}>
        <h3 style={{ marginBottom: '0.5rem' }}>Still have a question?</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
          Reach out through our contact form — we'll do our best to help.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button variant="primary" size="md" onClick={() => onNavigateTo?.('contact')}>
            Contact Us
          </Button>
          <Button variant="secondary" size="md" onClick={() => onNavigateTo?.('analyze-call')} icon={Upload}>
            Try EchoForge
          </Button>
        </div>
      </div>
    </div>
  );
}
