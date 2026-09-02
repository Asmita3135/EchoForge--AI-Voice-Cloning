import React, { useState } from 'react';
import { Search, X, Shield, AlertTriangle, FileText, ArrowRight } from 'lucide-react';

const SEARCH_ITEMS = [
  { title: 'Bank Impersonation Scam', category: 'Threat Type', desc: 'Callers pretending to be bank security agents requesting verification codes.', route: '/safety' },
  { title: 'OTP & Password Protection', category: 'Safety Guide', desc: 'Never share 1-time passcodes over unexpected calls.', route: '/safety' },
  { title: 'Urgency & Pressure Tactics', category: 'Risk Indicator', desc: 'Social engineering pattern creating fake time pressure.', route: '/how-it-works' },
  { title: 'Voice Authenticity Check', category: 'Feature', desc: 'Acoustic spectral analysis for deepfake voice cloning detection.', route: '/how-it-works' },
  { title: 'Speaker Verification', category: 'Feature', desc: 'Biometric vocal matching between caller and reference recording.', route: '/how-it-works' },
  { title: 'Delivery & Courier Scam', category: 'Threat Type', desc: 'Fake delivery fee demands or parcel hold scams.', route: '/safety' },
  { title: 'Government Impersonation', category: 'Threat Type', desc: 'Callers impersonating tax or law enforcement officials.', route: '/safety' },
  { title: 'Tech Support Scam', category: 'Threat Type', desc: 'Fake support agents requesting remote device access.', route: '/safety' },
];

export function SearchModal({ isOpen, onClose, onNavigate }) {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filtered = query.trim()
    ? SEARCH_ITEMS.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.desc.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      )
    : SEARCH_ITEMS.slice(0, 4);

  const handleSelect = (route) => {
    onNavigate(route);
    onClose();
  };

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="search-modal-header">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            className="search-modal-input"
            placeholder="Search security concepts, threat types, features, or safety guides..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button className="search-modal-close" onClick={onClose} aria-label="Close search">
            <X size={20} />
          </button>
        </div>

        <div className="search-modal-results">
          <div className="search-modal-label">
            {query.trim() ? `Search Results (${filtered.length})` : 'Popular Searches'}
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No results found for "{query}"
            </div>
          ) : (
            filtered.map((item, idx) => (
              <div
                key={idx}
                className="search-result-item"
                onClick={() => handleSelect(item.route)}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span className="search-result-category">{item.category}</span>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--color-ivory)' }}>{item.title}</strong>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-grey)' }}>{item.desc}</div>
                </div>
                <ArrowRight size={16} style={{ color: 'var(--color-mint)', flexShrink: 0 }} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
