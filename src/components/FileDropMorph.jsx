import React, { useState, useRef, useEffect } from 'react';

const SAMPLE_FILES = [
  {
    id: 'f1',
    name: 'mood.png',
    sizeMB: 2.4,
    type: 'PNG',
    badgeColor: '#059669' // Green badge
  },
  {
    id: 'f2',
    name: 'demo.mp4',
    sizeMB: 4.8,
    type: 'MP4',
    badgeColor: '#2563eb' // Blue badge
  }
];

// High quality tactile sounds via Web Audio API
const playDropSound = (type = 'drop') => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'drop') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(540, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.13);
    } else if (type === 'complete') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + (type === 'complete' ? 0.36 : 0.14));
  } catch (e) {}
};

export default function FileDropMorph() {
  const [activeFile, setActiveFile] = useState(null); // when uploading or uploaded
  const [progress, setProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const [draggingSampleId, setDraggingSampleId] = useState(null);
  const progressTimerRef = useRef(null);

  // Start smooth upload simulation
  const startUpload = (file) => {
    setActiveFile(file);
    setProgress(0);
    setIsCompleted(false);
    playDropSound('drop');

    if (progressTimerRef.current) clearInterval(progressTimerRef.current);

    let cur = 0;
    progressTimerRef.current = setInterval(() => {
      cur += Math.random() * 9 + 4;
      if (cur >= 100) {
        cur = 100;
        clearInterval(progressTimerRef.current);
        setProgress(100);
        setIsCompleted(true);
        playDropSound('complete');
      } else {
        setProgress(cur);
      }
    }, 120);
  };

  useEffect(() => {
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, []);

  const handleReset = (e) => {
    if (e) e.stopPropagation();
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    setActiveFile(null);
    setProgress(0);
    setIsCompleted(false);
  };

  // Drag over target zone
  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    // If native file dropped
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const dropped = e.dataTransfer.files[0];
      const ext = dropped.name.split('.').pop().toUpperCase();
      startUpload({
        id: 'native-' + Date.now(),
        name: dropped.name,
        sizeMB: Math.max(0.5, (dropped.size / (1024 * 1024)).toFixed(1)),
        type: ext,
        badgeColor: ext === 'PNG' || ext === 'JPG' || ext === 'WEBP' ? '#059669' : '#2563eb'
      });
      return;
    }

    // If sample file dropped
    if (draggingSampleId) {
      const sample = SAMPLE_FILES.find((f) => f.id === draggingSampleId);
      if (sample) startUpload(sample);
      setDraggingSampleId(null);
    }
  };

  // Render file icon with colored badge
  const renderFileIcon = (type, badgeColor) => (
    <div style={styles.fileIconWrapper}>
      {/* File Outline Paper */}
      <svg width="44" height="52" viewBox="0 0 44 52" fill="none">
        <path
          d="M8 2H28L40 14V46C40 48.2091 38.2091 50 36 50H8C5.79086 50 4 48.2091 4 46V6C4 3.79086 5.79086 2 8 2Z"
          fill="#ffffff"
          stroke="#9ca3af"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M28 2V14H40"
          stroke="#9ca3af"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Embedded File Type Badge */}
      <span
        style={{
          ...styles.fileBadge,
          background: badgeColor
        }}
      >
        {type}
      </span>
    </div>
  );

  return (
    <div style={styles.stage}>
      {/* Dynamic Drop Zone / Uploading Pill Card */}
      {!activeFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => startUpload(SAMPLE_FILES[0])}
          style={{
            ...styles.dropCard,
            borderColor: isDragOver ? '#2563eb' : 'transparent',
            transform: isDragOver ? 'scale(1.03)' : 'scale(1)',
            boxShadow: isDragOver
              ? '0 16px 36px -6px rgba(37, 99, 235, 0.16)'
              : '0 8px 24px rgba(0, 0, 0, 0.05)'
          }}
          title="Click to upload mood.png or drag file here"
        >
          {/* Upload Squircle Button */}
          <div style={styles.uploadIconBox}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#18181b"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>

          <h3 style={styles.dropTitle}>Drag a file here</h3>
          <p style={styles.dropSubtitle}>Up to 5 MB</p>
        </div>
      ) : (
        /* Morphed Uploading Card (Matching Image 2) */
        <div style={styles.uploadingCard}>
          <div style={styles.uploadingLeft}>
            {renderFileIcon(activeFile.type, activeFile.badgeColor)}
          </div>

          <div style={styles.uploadingContent}>
            <div style={styles.uploadingHeader}>
              <span style={styles.fileName}>{activeFile.name}</span>
              {isCompleted ? (
                <button
                  style={styles.doneBtn}
                  onClick={handleReset}
                  title="Upload another file"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Ready</span>
                </button>
              ) : null}
            </div>

            <div style={styles.fileMeta}>
              {((activeFile.sizeMB * progress) / 100).toFixed(1)} MB · {Math.round(progress)}%
            </div>

            {/* Blue Progress Bar */}
            <div style={styles.progressTrack}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${progress}%`,
                  background: isCompleted ? '#10b981' : '#2563eb'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Draggable File Previews Row (Matching Image 1) */}
      <div
        style={{
          ...styles.samplesRow,
          opacity: activeFile ? 0.35 : 1,
          pointerEvents: activeFile ? 'none' : 'auto'
        }}
      >
        {SAMPLE_FILES.map((sample) => (
          <div
            key={sample.id}
            draggable={!activeFile}
            onDragStart={() => setDraggingSampleId(sample.id)}
            onDragEnd={() => setDraggingSampleId(null)}
            onClick={() => startUpload(sample)}
            style={styles.sampleItem}
            title={`Drag ${sample.name} into box or tap to upload`}
          >
            {renderFileIcon(sample.type, sample.badgeColor)}
            <span style={styles.sampleName}>{sample.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  stage: {
    width: '100%',
    height: '100%',
    minHeight: '380px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    position: 'relative',
    userSelect: 'none',
    boxSizing: 'border-box',
    padding: '24px'
  },
  dropCard: {
    width: '320px',
    maxWidth: '92vw',
    background: '#ffffff',
    borderRadius: '28px',
    padding: '38px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: '2px dashed transparent',
    transition: 'all 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
    boxSizing: 'border-box'
  },
  uploadIconBox: {
    width: '46px',
    height: '46px',
    borderRadius: '14px',
    background: '#f4f4f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px'
  },
  dropTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#18181b',
    margin: '0 0 6px 0',
    letterSpacing: '-0.02em'
  },
  dropSubtitle: {
    fontSize: '13px',
    fontWeight: '400',
    color: '#71717a',
    margin: 0
  },
  uploadingCard: {
    width: '340px',
    maxWidth: '92vw',
    background: '#ffffff',
    borderRadius: '26px',
    padding: '20px 22px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 8px 26px rgba(0, 0, 0, 0.06)',
    animation: 'popIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
    boxSizing: 'border-box'
  },
  uploadingLeft: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  uploadingContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    overflow: 'hidden'
  },
  uploadingHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px'
  },
  fileName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#18181b',
    letterSpacing: '-0.015em',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  fileMeta: {
    fontSize: '13px',
    fontWeight: '400',
    color: '#71717a',
    marginBottom: '4px'
  },
  progressTrack: {
    width: '100%',
    height: '4px',
    background: '#f1f1f2',
    borderRadius: '999px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: '999px',
    transition: 'width 0.14s ease, background 0.3s ease'
  },
  doneBtn: {
    background: '#ecfdf5',
    color: '#059669',
    border: 'none',
    padding: '4px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'transform 0.15s ease'
  },
  samplesRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '36px',
    marginTop: '34px',
    transition: 'opacity 0.25s ease'
  },
  sampleItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    cursor: 'grab',
    transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
  },
  sampleName: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#4b5563',
    letterSpacing: '-0.01em'
  },
  fileIconWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '52px'
  },
  fileBadge: {
    position: 'absolute',
    bottom: '8px',
    left: '-6px',
    color: '#ffffff',
    fontSize: '9px',
    fontWeight: '800',
    padding: '2px 5px',
    borderRadius: '999px',
    letterSpacing: '0.02em',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
  }
};
