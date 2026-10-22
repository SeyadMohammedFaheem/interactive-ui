import React, { useState, useRef, useEffect } from 'react';

// Web Audio API subtle haptics
const playSound = (type = 'click') => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'expand') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(540, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.19);
    } else if (type === 'collapse') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(460, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'key') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400 + Math.random() * 80, ctx.currentTime);
      gain.gain.setValueAtTime(0.012, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.045);
    } else if (type === 'activate') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    }
  } catch (e) {}
};

export default function LicenseKeyMorph() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [licenseKey, setLicenseKey] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isExpanded]);

  const handleExpand = () => {
    if (!isExpanded) {
      playSound('expand');
      setIsExpanded(true);
      setIsActivated(false);
    }
  };

  const handleCollapse = (e) => {
    if (e) e.stopPropagation();
    playSound('collapse');
    setIsExpanded(false);
    setIsActivated(false);
    setLicenseKey('');
  };

  const handleInputChange = (e) => {
    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (val.length > 16) val = val.slice(0, 16);

    // Format as XXXX-XXXX-XXXX-XXXX
    const parts = val.match(/.{1,4}/g) || [];
    const formatted = parts.join('-');
    setLicenseKey(formatted);
    playSound('key');
  };

  const handleActivate = (e) => {
    e.stopPropagation();
    if (!isActivated) {
      if (!licenseKey) {
        setLicenseKey('SWFT-8492-NX99-PRO');
      }
      setIsActivated(true);
      playSound('activate');
    } else {
      setIsActivated(false);
      setLicenseKey('');
    }
  };

  const fillDemoKey = (e) => {
    e.stopPropagation();
    setLicenseKey('PRO-2026-SWFT-GOLD');
    playSound('key');
  };

  return (
    <div style={styles.stage}>
      {/* Morphing Capsule Container */}
      <div
        style={{
          ...styles.capsule,
          width: isExpanded ? '376px' : '244px',
          height: isExpanded ? '58px' : '52px',
          background: '#ffffff',
          boxShadow: isExpanded
            ? '0 14px 34px -4px rgba(0, 0, 0, 0.10), 0 2px 8px -2px rgba(0, 0, 0, 0.04)'
            : isHovered
            ? '0 6px 18px -2px rgba(0, 0, 0, 0.08), 0 2px 5px rgba(0, 0, 0, 0.03)'
            : '0 4px 12px -2px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)',
          transform: isExpanded ? 'scale(1)' : isHovered ? 'scale(1.02)' : 'scale(1)',
          border: '1px solid rgba(0, 0, 0, 0.03)',
          cursor: isExpanded ? 'default' : 'pointer'
        }}
        onClick={handleExpand}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* State 1: Collapsed Pill Label matching user's screenshot */}
        {!isExpanded && (
          <div style={styles.collapsedWrapper}>
            <span style={styles.collapsedLabel}>I have a License Key</span>
          </div>
        )}

        {/* State 2: Expanded Input Form */}
        {isExpanded && (
          <div style={styles.expandedWrapper}>
            {/* Key Icon */}
            <div style={styles.keyIconBox}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#71717a"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 2l-2 2m-1.5 1.5L14 9l-1.5-1.5L11 9l-1.5-1.5L8 9l-1.5-1.5L2 12a5.5 5.5 0 0 0 7.78 7.78L22 7.5z" />
              </svg>
            </div>

            {/* Formatted License Input */}
            <input
              ref={inputRef}
              type="text"
              value={licenseKey}
              onChange={handleInputChange}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              autoComplete="off"
              spellCheck="false"
              style={styles.inputField}
            />

            {/* Action Group: Activate Pill + Close Button */}
            <div style={styles.rightActions}>
              <button
                style={{
                  ...styles.activateButton,
                  background: isActivated ? '#10b981' : '#18181b',
                  color: '#ffffff'
                }}
                onClick={handleActivate}
                title={isActivated ? 'Key verified!' : 'Activate license key'}
              >
                {isActivated ? (
                  <span style={styles.activeText}>
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Active</span>
                  </span>
                ) : (
                  <span>Activate</span>
                )}
              </button>

              {/* Collapse / Close Button */}
              <button
                style={styles.closeButton}
                onClick={handleCollapse}
                title="Cancel"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Demo Key Preset Helper */}
      {isExpanded && !isActivated && (
        <button style={styles.demoKeyHint} onClick={fillDemoKey}>
          Auto-fill sample key
        </button>
      )}
    </div>
  );
}

const styles = {
  stage: {
    width: '100%',
    height: '100%',
    minHeight: '260px',
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
  capsule: {
    position: 'relative',
    borderRadius: '999px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.38s cubic-bezier(0.34, 1.56, 0.64, 1)',
    overflow: 'hidden',
    boxSizing: 'border-box'
  },
  collapsedWrapper: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 28px'
  },
  collapsedLabel: {
    fontSize: '16.5px',
    fontWeight: '500',
    color: '#18181b',
    letterSpacing: '-0.015em',
    whiteSpace: 'nowrap',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  expandedWrapper: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    padding: '4px 6px 4px 16px',
    boxSizing: 'border-box',
    gap: '10px'
  },
  keyIconBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.75
  },
  inputField: {
    flex: 1,
    height: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: '14.5px',
    fontWeight: '600',
    color: '#18181b',
    fontFamily: '"SF Mono", "Fira Code", monospace',
    letterSpacing: '0.04em'
  },
  rightActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  activateButton: {
    border: 'none',
    outline: 'none',
    borderRadius: '999px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.18s ease',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  activeText: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  closeButton: {
    border: 'none',
    outline: 'none',
    background: '#f4f4f5',
    color: '#71717a',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'background 0.15s ease'
  },
  demoKeyHint: {
    position: 'absolute',
    bottom: '22px',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#9ca3af',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    textDecoration: 'underline',
    transition: 'color 0.15s ease'
  }
};
