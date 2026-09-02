import React, { useState, useRef, useEffect } from 'react';
import { ConnectionStatusBadge } from '../status/ConnectionStatusBadge';
import {
  ShieldCheck,
  Menu,
  X,
  ChevronDown,
  Shield,
  Upload,
  HelpCircle,
  Info,
  Phone,
  BookOpen,
  Mail,
  FileText
} from 'lucide-react';

export function Navbar({ activeTab, onSelectTab, hasResults, healthStatus, onRetryHealth, onNavigateTo }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const resourcesRef = useRef(null);

  // Close resources dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (resourcesRef.current && !resourcesRef.current.contains(e.target)) {
        setResourcesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleTabClick = (tabId) => {
    onSelectTab(tabId);
    setMobileMenuOpen(false);
    setResourcesOpen(false);
  };

  const primaryNavItems = [
    { id: 'analyze-call', label: 'Analyze' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'safety', label: 'Safety' },
    { id: 'live-demo', label: 'Live Demo' },
  ];

  const resourceItems = [
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'about', label: 'About EchoForge', icon: Info },
    { id: 'contact', label: 'Contact', icon: Mail },
    { id: 'safety', label: 'Safety Guides', icon: BookOpen },
  ];

  return (
    <header className="app-header" role="banner">
      {/* Brand */}
      <div className="brand-logo" onClick={() => handleTabClick('analyze-call')} aria-label="EchoForge home">
        <div className="brand-waveform-mark" aria-hidden="true">
          <div className="brand-waveform-bar" />
          <div className="brand-waveform-bar" />
          <div className="brand-waveform-bar" />
          <div className="brand-waveform-bar" />
          <div className="brand-waveform-bar" />
          <div className="brand-waveform-bar" />
        </div>
        <div className="brand-title">EchoForge</div>
      </div>

      {/* Mobile Toggle */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle navigation menu"
        aria-expanded={mobileMenuOpen}
      >
        {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Center Primary Navigation */}
      <nav
        className={`nav-tabs ${mobileMenuOpen ? 'mobile-open' : ''}`}
        aria-label="Main navigation"
      >
        {primaryNavItems.map((item) => (
          <button
            key={item.id}
            className={`nav-tab-btn ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => handleTabClick(item.id)}
            aria-current={activeTab === item.id ? 'page' : undefined}
          >
            {item.label}
          </button>
        ))}

        {/* Results tab — appears only when analysis is done */}
        {hasResults && (
          <button
            className={`nav-tab-btn ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => handleTabClick('results')}
            aria-current={activeTab === 'results' ? 'page' : undefined}
          >
            Results
          </button>
        )}

        {/* Resources Dropdown */}
        <div className="nav-dropdown-wrapper" ref={resourcesRef}>
          <button
            className={`nav-tab-btn ${resourcesOpen ? 'active' : ''}`}
            onClick={() => setResourcesOpen(!resourcesOpen)}
            aria-expanded={resourcesOpen}
            aria-haspopup="menu"
          >
            Resources
            <ChevronDown
              size={14}
              style={{ transition: 'transform 0.18s ease', transform: resourcesOpen ? 'rotate(180deg)' : 'none' }}
            />
          </button>

          {resourcesOpen && (
            <div className="nav-dropdown-menu" role="menu">
              {resourceItems.map((item) => (
                <button
                  key={item.id + item.label}
                  className="nav-dropdown-item"
                  onClick={() => handleTabClick(item.id)}
                  role="menuitem"
                >
                  <item.icon size={15} />
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Right side: tag pill + status badge + CTA */}
      <div className="nav-right">
        <div className="header-tag-pill">
          <Shield size={13} />
          <span>Your Voice. Our Protection.</span>
        </div>

        <ConnectionStatusBadge status={healthStatus} onRetry={onRetryHealth} />

        <button
          className="nav-cta-btn"
          onClick={() => handleTabClick('analyze-call')}
          aria-label="Analyze a call recording"
        >
          <Upload size={14} />
          <span>Analyze a Call</span>
        </button>
      </div>
    </header>
  );
}
