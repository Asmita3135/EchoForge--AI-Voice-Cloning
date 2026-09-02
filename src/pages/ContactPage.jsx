import React, { useState } from 'react';
import { ShieldCheck, Info, Mail, User, MessageSquare, ChevronDown, Send } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export function ContactPage({ onNavigateTo }) {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // DEMO: This is a frontend-only simulation. No actual message is sent.
    setSubmitted(true);
  };

  return (
    <div className="contact-page">
      {/* Header */}
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--soft-blue)', color: 'var(--primary)', padding: '0.35rem 1rem', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 800, marginBottom: '1.25rem' }}>
          <Mail size={14} />
          <span>Contact EchoForge</span>
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '0.5rem' }}>Get in Touch</h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
          Questions, feedback, or partnership inquiries — we'd love to hear from you.
        </p>
      </div>

      {/* Demo notice — MUST NOT pretend message was actually sent */}
      <div className="contact-demo-notice">
        <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Demo notice:</strong> This contact form is a frontend demonstration.
          Messages entered here are <strong>not actually sent or received</strong> in this MVP.
          In a production version, this form would submit to a secure backend endpoint.
        </div>
      </div>

      {submitted ? (
        <Card style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <ShieldCheck size={32} style={{ color: 'var(--success)' }} />
          </div>
          <h2 style={{ marginBottom: '0.5rem' }}>Message received (Demo)</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            In a live version of EchoForge, your message would now be on its way. Thank you for trying the demo.
          </p>
          <Button variant="secondary" size="md" onClick={() => { setSubmitted(false); setFormState({ name: '', email: '', subject: '', message: '' }); }}>
            Send Another Message
          </Button>
        </Card>
      ) : (
        <Card>
          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="contact-name">Your Name</label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  className="form-input"
                  placeholder="Priya Sharma"
                  value={formState.name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="contact-email">Email Address</label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="priya@example.com"
                  value={formState.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="contact-subject">Subject</label>
              <select
                id="contact-subject"
                name="subject"
                className="form-select"
                value={formState.subject}
                onChange={handleChange}
                required
              >
                <option value="">Select a topic…</option>
                <option value="general">General Question</option>
                <option value="analysis">Question about Analysis Results</option>
                <option value="privacy">Privacy & Data</option>
                <option value="technical">Technical Issue</option>
                <option value="feedback">Feedback or Suggestion</option>
                <option value="partnership">Partnership or Press Inquiry</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="contact-message">Your Message</label>
              <textarea
                id="contact-message"
                name="message"
                className="form-textarea"
                placeholder="Tell us how we can help…"
                value={formState.message}
                onChange={handleChange}
                required
                rows={5}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={Send}
              style={{ alignSelf: 'flex-start' }}
              disabled={!formState.name || !formState.email || !formState.subject || !formState.message}
            >
              Send Message (Demo)
            </Button>
          </form>
        </Card>
      )}

      {/* FAQ shortcut */}
      <div style={{ background: 'var(--soft-blue)', borderRadius: '16px', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Looking for quick answers?</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Check the FAQ — we cover the most common questions about EchoForge.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => onNavigateTo?.('faq')}>
          View FAQ
        </Button>
      </div>
    </div>
  );
}
