import React, { useState, useRef } from 'react';
import { UploadCloud, Music, X, FileAudio } from 'lucide-react';
import { formatFileSize } from '../../utils/formatRisk';
import { AudioPreviewPlayer } from './AudioPreviewPlayer';

/**
 * Drag and drop upload dropzone component for audio files.
 */
export function UploadDropzone({
  file,
  onFileSelect,
  onFileRemove,
  title,
  subtitle,
  isRequired = false,
  badgeText = null,
  id,
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      onFileSelect(droppedFile);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label htmlFor={id} style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <FileAudio size={16} style={{ color: 'var(--accent-cyan)' }} />
          <span>{title}</span>
          {isRequired ? (
            <span style={{ color: 'var(--color-high)', fontSize: '0.8rem' }}>* (Required)</span>
          ) : (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>(Optional)</span>
          )}
        </label>
        {badgeText && (
          <span className="mono-text" style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', backgroundColor: 'var(--accent-cyan-glow)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
            {badgeText}
          </span>
        )}
      </div>

      {file ? (
        <AudioPreviewPlayer file={file} onRemove={onFileRemove} />
      ) : (
        <div
          className={`dropzone-container ${isDragOver ? 'is-dragover' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick();
            }
          }}
          aria-label={`Upload ${title}`}
        >
          <input
            id={id}
            ref={inputRef}
            type="file"
            accept="audio/*,.wav,.mp3,.m4a,.flac,.ogg,.aiff,.webm"
            onChange={handleInputChange}
            className="file-input-hidden"
            tabIndex={-1}
          />
          <div className="dropzone-icon">
            <UploadCloud size={24} />
          </div>
          <div>
            <div className="dropzone-title">{subtitle || 'Drag & drop audio file here'}</div>
            <div className="dropzone-subtitle" style={{ marginTop: '0.25rem' }}>
              Click to browse • Max file size 50MB (.wav, .mp3, .m4a, .flac)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
