import React from 'react';
import { Shield, ArrowUpRight } from 'lucide-react';

export function Footer({ onNavigate }) {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        {/* Brand Column */}
        <div className="footer-brand-col">
          <div className="brand-logo" onClick={() => onNavigate('/')} style={{ cursor: 'pointer', marginBottom: '0.75rem' }}>
            <div className="brand-icon-wrapper">
              <Shield size={22} />
            </div>
            <div>
              <h2 className="brand-title">EchoForge</h2>
            </div>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-grey)', lineHeight: 1.6, maxWidth: '280px' }}>
            Real-time intelligence against suspicious calls and voice impersonation scams.
          </p>
          <div className="system-online-tag" style={{ marginTop: '1rem' }}>
            <span className="pulse-dot-green"></span>
            <span>● SYSTEM ONLINE &amp; PROTECTED</span>
          </div>
        </div>

        {/* Links Grid */}
        <div className="footer-links-grid">
          {/* Column 1: Product */}
          <div className="footer-col">
            <h4 className="footer-col-title">PRODUCT</h4>
            <ul className="footer-links-list">
              <li><button onClick={() => onNavigate('/')}>Overview</button></li>
              <li><button onClick={() => onNavigate('/analyze')}>Analyze Call</button></li>
              <li><button onClick={() => onNavigate('/live')}>Live Detection</button></li>
              <li><button onClick={() => onNavigate('/security')}>Security Results</button></li>
            </ul>
          </div>

          {/* Column 2: Resources */}
          <div className="footer-col">
            <h4 className="footer-col-title">RESOURCES</h4>
            <ul className="footer-links-list">
              <li><button onClick={() => onNavigate('/how-it-works')}>How It Works</button></li>
              <li><button onClick={() => onNavigate('/safety')}>Safety Guide</button></li>
              <li><button onClick={() => onNavigate('/faq')}>FAQ</button></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="footer-col">
            <h4 className="footer-col-title">COMPANY</h4>
            <ul className="footer-links-list">
              <li><button onClick={() => onNavigate('/about')}>About Us</button></li>
              <li><button onClick={() => onNavigate('/contact')}>Contact Support</button></li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div className="footer-col">
            <h4 className="footer-col-title">LEGAL</h4>
            <ul className="footer-links-list">
              <li><button onClick={() => onNavigate('/safety')}>Privacy Principles</button></li>
              <li><button onClick={() => onNavigate('/safety')}>Terms of Service</button></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <span>&copy; 2026 EchoForge. Built for safer digital conversations.</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-grey)' }}>Cybersecurity Operations Center Platform</span>
      </div>
    </footer>
  );
}
