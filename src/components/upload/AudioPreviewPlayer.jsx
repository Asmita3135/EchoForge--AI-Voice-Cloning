import React, { useState, useEffect } from 'react';
import { Music, Trash2 } from 'lucide-react';
import { formatFileSize } from '../../utils/formatRisk';

/**
 * Audio preview player rendering file info and browser audio controls.
 */
export function AudioPreviewPlayer({ file, onRemove }) {
  const [audioUrl, setAudioUrl] = useState(null);

  useEffect(() => {
    if (!file) {
      setAudioUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setAudioUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  return (
    <div className="audio-preview-card">
      <div className="audio-preview-header">
        <div className="audio-file-info">
          <div style={{ color: 'var(--accent-cyan)' }}>
            <Music size={18} />
          </div>
          <div>
            <div className="audio-file-name" title={file.name}>
              {file.name}
            </div>
            <div className="audio-file-size">{formatFileSize(file.size)}</div>
          </div>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="ef-btn ef-btn-ghost ef-btn-sm"
          title="Remove audio file"
          aria-label={`Remove file ${file.name}`}
          style={{ color: 'var(--color-high)', padding: '0.4rem' }}
        >
          <Trash2 size={16} />
        </button>
      </div>

      {audioUrl && (
        <audio
          controls
          src={audioUrl}
          className="custom-audio-element"
          controlsList="nodownload"
        >
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
}
