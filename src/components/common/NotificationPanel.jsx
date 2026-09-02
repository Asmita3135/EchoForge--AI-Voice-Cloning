import React from 'react';
import { X, Bell, ShieldAlert, ShieldCheck, Activity, Info } from 'lucide-react';

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: 'NEW ALERT — Suspicious Phrase Detected',
    time: '2 mins ago',
    type: 'high',
    desc: 'High urgency language ("verify account immediately") detected on active stream.',
  },
  {
    id: 2,
    title: 'RISK SCORE UPDATED',
    time: '15 mins ago',
    type: 'amber',
    desc: 'Call risk assessment escalated from Medium (45) to High (82).',
  },
  {
    id: 3,
    title: 'ANALYSIS COMPLETE',
    time: '1 hour ago',
    type: 'safe',
    desc: 'Forensic evaluation for recording_sample_04.wav finished with status LOW RISK.',
  },
];

export function NotificationPanel({ isOpen, onClose, onNavigate }) {
  if (!isOpen) return null;

  return (
    <div className="notification-panel-overlay" onClick={onClose}>
      <div className="notification-panel-content" onClick={(e) => e.stopPropagation()}>
        <div className="notification-panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={18} style={{ color: 'var(--color-amber)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-ivory)' }}>
              Security Alerts &amp; Notifications
            </h3>
          </div>
          <button className="search-modal-close" onClick={onClose} aria-label="Close notifications">
            <X size={18} />
          </button>
        </div>

        <div className="notification-panel-list">
          {MOCK_NOTIFICATIONS.map((notif) => (
            <div key={notif.id} className={`notification-item type-${notif.type}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <span className="notif-title">{notif.title}</span>
                <span className="notif-time">{notif.time}</span>
              </div>
              <p className="notif-desc">{notif.desc}</p>
            </div>
          ))}
        </div>

        <div className="notification-panel-footer">
          <button
            className="ef-btn ef-btn-secondary ef-btn-sm"
            onClick={() => {
              onNavigate('/live');
              onClose();
            }}
            style={{ width: '100%' }}
          >
            View Live Intelligence Center
          </button>
        </div>
      </div>
    </div>
  );
}
