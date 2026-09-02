import React from 'react';
import { ShieldCheck, Heart, Upload } from 'lucide-react';

export function Footer({ onNavigateTo }) {
  const navColumns = [
    {
      title: 'PRODUCT',
      links: [
        { label: 'Analyze Call', id: 'analyze-call' },
        { label: 'Live Demo', id: 'live-demo' },
        { label: 'How It Works', id: 'how-it-works' },
      ],
    },
    {
      title: 'SAFETY',
      links: [
        { label: 'Safety Center', id: 'safety' },
        { label: 'Scam Red Flags', id: 'safety' },
        { label: 'Safety Tips', id: 'safety' },
      ],
    },
    {
      title: 'RESOURCES',
      links: [
        { label: 'FAQ', id: 'faq' },
        { label: 'About EchoForge', id: 'about' },
        { label: 'Contact', id: 'contact' },
      ],
    },
  ];

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-inner">
        <div className="footer-grid">
          {/* Brand column */}
          <div>
            <div className="footer-brand-logo">
              <div className="footer-brand-logo-icon">
                <ShieldCheck size={22} />
              </div>
              <span className="footer-brand-name">EchoForge</span>
            </div>
            <p className="footer-brand-desc">
              AI-powered voice security for safer conversations. Helping everyday people
              identify suspicious calls before it's too late.
            </p>
            <button
              className="ef-btn ef-btn-secondary ef-btn-sm"
              onClick={() => onNavigateTo?.('analyze-call')}
              style={{ background: 'rgba(255,255,255,0.1)', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '9999px' }}
            >
              <Upload size={14} />
              Analyze a Call
            </button>
          </div>

          {/* Nav columns */}
          {navColumns.map((col) => (
            <div key={col.title}>
              <div className="footer-col-title">{col.title}</div>
              <ul className="footer-links">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <button
                      className="footer-link"
                      onClick={() => onNavigateTo?.(link.id)}
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <span className="footer-bottom-text">
            © 2026 EchoForge. No warranties expressed or implied. EchoForge provides risk assessments, not guarantees.
          </span>
          <div className="footer-india-pill">
            <span>🇮🇳</span>
            <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Built for a Safer India</span>
            <Heart size={12} style={{ color: '#FCA5A5', fill: '#FCA5A5' }} />
          </div>
        </div>
      </div>
    </footer>
  );
}
