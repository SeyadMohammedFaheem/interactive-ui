import React, { useState, useRef, useEffect } from 'react';

// Web Audio API sounds for tactile Apple-grade feel
const playMicSound = (type = 'start') => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'start') {
      // Soft high chirp when mic activates
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(840, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'cancel') {
      // Dull low pop
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } else if (type === 'stop') {
      // Subtle release click
      osc.type = 'sine';
      osc.frequency.setValueAtTime(740, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 0.07);

      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    }
  } catch (e) {
    // Ignore audio restrictions
  }
};

export default function HoldToRecordMorph({
  auto = false,
  speed = 4,
  sound = true,
  theme = 'Light'
}) {
  // States: 'idle' | 'recording' | 'preview'
  const [state, setState] = useState('idle');
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [dragX, setDragX] = useState(0); // For slide to cancel
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0); // 0 to 1
  const [waveHeights, setWaveHeights] = useState(() =>
    Array.from({ length: 22 }, () => 6 + Math.random() * 18)
  );

  const containerRef = useRef(null);
  const startXRef = useRef(0);
  const timerRef = useRef(null);
  const playTimerRef = useRef(null);
  const isHoldingRef = useRef(false);
  const waveAnimRef = useRef(null);

  // Format seconds to M:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Live waveform animation when recording
  useEffect(() => {
    if (state === 'recording') {
      const updateWaveform = () => {
        setWaveHeights(prev =>
          prev.map((h, i) => {
            const time = Date.now() * 0.009;
            const wave = Math.sin(time + i * 0.45) * 10;
            const randomJitter = Math.random() * 8;
            return Math.max(5, Math.min(26, 12 + wave + randomJitter));
          })
        );
        waveAnimRef.current = requestAnimationFrame(updateWaveform);
      };
      waveAnimRef.current = requestAnimationFrame(updateWaveform);
    } else {
      if (waveAnimRef.current) cancelAnimationFrame(waveAnimRef.current);
    }
    return () => {
      if (waveAnimRef.current) cancelAnimationFrame(waveAnimRef.current);
    };
  }, [state]);

  // Recording counter
  useEffect(() => {
    if (state === 'recording') {
      setRecordSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state]);

  // Playback progress loop
  useEffect(() => {
    if (isPlaying && state === 'preview') {
      const duration = Math.max(2, recordSeconds || 2);
      const intervalMs = 50;
      const step = intervalMs / (duration * 1000);

      playTimerRef.current = setInterval(() => {
        setPlayProgress(prev => {
          if (prev >= 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev + step;
        });
      }, intervalMs);
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, state, recordSeconds]);

  // Start recording on pointer down
  const handlePointerDown = (e) => {
    if (state === 'preview') return;
    isHoldingRef.current = true;
    startXRef.current = e.clientX;
    setDragX(0);
    setState('recording');
    if (sound) playMicSound('start');

    if (e.target.setPointerCapture) {
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  const handlePointerMove = (e) => {
    if (!isHoldingRef.current || state !== 'recording') return;
    const dx = e.clientX - startXRef.current;
    if (dx < 0) {
      setDragX(dx);
      // Cancel threshold exceeded (-90px)
      if (dx < -90) {
        isHoldingRef.current = false;
        setState('idle');
        setDragX(0);
        if (sound) playMicSound('cancel');
      }
    } else {
      setDragX(0);
    }
  };

  const handlePointerUp = () => {
    if (!isHoldingRef.current || state !== 'recording') return;
    isHoldingRef.current = false;

    // Check if recorded for long enough
    if (sound) playMicSound('stop');
    setDragX(0);
    setState('preview');
  };

  // Reset to idle
  const handleReset = (e) => {
    if (e) e.stopPropagation();
    setState('idle');
    setIsPlaying(false);
    setPlayProgress(0);
    setRecordSeconds(0);
    setDragX(0);
    if (sound) playMicSound('cancel');
  };

  // Toggle playback
  const handleTogglePlay = (e) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  // Autoplay demonstration cycle
  useEffect(() => {
    if (!auto) return;
    let step = 0;
    const interval = setInterval(() => {
      step = (step + 1) % 4;
      if (step === 1) {
        setState('recording');
        setRecordSeconds(0);
        if (sound) playMicSound('start');
      } else if (step === 2) {
        setRecordSeconds(2);
        setState('preview');
        setIsPlaying(true);
        if (sound) playMicSound('stop');
      } else if (step === 3) {
        setIsPlaying(false);
      } else {
        setState('idle');
        setPlayProgress(0);
        setRecordSeconds(0);
      }
    }, (speed || 4) * 1000);

    return () => clearInterval(interval);
  }, [auto, speed, sound]);

  return (
    <div style={styles.stage}>
      <div style={styles.morphWrapper}>
        {/* Main Morphing Pill Capsule */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            ...styles.capsule,
            ...(state === 'idle'
              ? styles.capsuleIdle
              : styles.capsuleActive),
            transform: `translateX(${dragX * 0.35}px) scale(${state === 'recording' ? 1.02 : 1})`,
            cursor: state === 'idle' ? 'pointer' : (state === 'recording' ? 'grabbing' : 'default')
          }}
        >
          {/* STATE 1: IDLE ("Hold to record") */}
          {state === 'idle' && (
            <div style={styles.idleContent}>
              {/* Mic Icon */}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#18181b"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="22"></line>
              </svg>
              <span style={styles.idleText}>Hold to record</span>
            </div>
          )}

          {/* STATE 2: RECORDING (Red dot + Timer + Live Waveform) */}
          {state === 'recording' && (
            <div style={styles.recordingContent}>
              <div style={styles.recordingLeft}>
                <div style={styles.redDot} />
                <span style={styles.timerText}>
                  {formatTime(recordSeconds)}
                </span>
              </div>

              {/* Dynamic Waveform Bars */}
              <div style={styles.waveformContainer}>
                {waveHeights.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      ...styles.waveBar,
                      height: `${h}px`,
                      backgroundColor: '#18181b'
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* STATE 3: PREVIEW / PLAYBACK (Play Button + Silver Waveform + Duration + Close) */}
          {state === 'preview' && (
            <div style={styles.previewContent}>
              {/* Play / Pause Circular Button */}
              <button
                style={styles.playBtn}
                onClick={handleTogglePlay}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#ffffff">
                    <rect x="6" y="4" width="4" height="16" rx="1"></rect>
                    <rect x="14" y="4" width="4" height="16" rx="1"></rect>
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#ffffff" style={{ marginLeft: '2px' }}>
                    <polygon points="6 4 20 12 6 20 6 4" />
                  </svg>
                )}
              </button>

              {/* Scrubber Waveform Bars */}
              <div style={styles.waveformContainer}>
                {waveHeights.map((h, i) => {
                  const barProgress = i / waveHeights.length;
                  const isFilled = isPlaying && barProgress <= playProgress;
                  return (
                    <div
                      key={i}
                      style={{
                        ...styles.waveBar,
                        height: `${h}px`,
                        backgroundColor: isFilled ? '#18181b' : '#9ca3af',
                        transition: 'background-color 0.12s ease'
                      }}
                    />
                  );
                })}
              </div>

              {/* Recorded Duration */}
              <span style={styles.previewDuration}>
                {formatTime(recordSeconds || 2)}
              </span>

              {/* Close / Delete Button */}
              <button
                style={styles.closeBtn}
                onClick={handleReset}
                title="Discard Voice Note"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#71717a"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Subtitle Hint: < Slide to cancel (Only in recording state) */}
        <div
          style={{
            ...styles.slideCancelHint,
            opacity: state === 'recording' ? 1 : 0,
            transform: `translateY(${state === 'recording' ? 0 : -4}px)`
          }}
        >
          <span>‹ Slide to cancel</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  stage: {
    width: '100%',
    height: '100%',
    minHeight: '360px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    userSelect: 'none',
    touchAction: 'none',
    padding: '24px',
    boxSizing: 'border-box'
  },
  morphWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    position: 'relative'
  },
  capsule: {
    height: '52px',
    borderRadius: '999px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    transition: 'width 0.28s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease, box-shadow 0.2s ease'
  },
  capsuleIdle: {
    width: '210px',
    background: '#ffffff',
    border: '1.5px solid transparent',
    boxShadow: '0 4px 18px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
    padding: '0 20px'
  },
  capsuleActive: {
    width: '270px',
    background: '#ffffff',
    border: '2px solid #2563eb', // Vibrant electric blue matching reference
    boxShadow: '0 8px 24px -4px rgba(37, 99, 235, 0.18), 0 2px 8px rgba(0, 0, 0, 0.04)',
    padding: '0 16px'
  },
  idleContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  idleText: {
    fontSize: '14.5px',
    fontWeight: '600',
    color: '#18181b',
    letterSpacing: '-0.01em'
  },
  recordingContent: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 4px'
  },
  recordingLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  redDot: {
    width: '9px',
    height: '9px',
    borderRadius: '50%',
    backgroundColor: '#f87171',
    boxShadow: '0 0 8px rgba(248, 113, 113, 0.6)',
    animation: 'pulseRecord 1.1s ease-in-out infinite'
  },
  timerText: {
    fontSize: '14px',
    fontWeight: '700',
    fontFamily: "'SF Pro Display', -apple-system, monospace",
    color: '#18181b',
    minWidth: '34px'
  },
  waveformContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '2.5px',
    height: '28px',
    padding: '0 4px',
    flex: 1,
    justifyContent: 'center'
  },
  waveBar: {
    width: '2.5px',
    borderRadius: '999px',
    minHeight: '4px',
    transition: 'height 0.08s ease'
  },
  previewContent: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px'
  },
  playBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#18181b',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'transform 0.15s ease'
  },
  previewDuration: {
    fontSize: '13px',
    fontWeight: '600',
    fontFamily: "'SF Pro Display', -apple-system, monospace",
    color: '#4b5563',
    minWidth: '32px',
    textAlign: 'right'
  },
  closeBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'transparent',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'background-color 0.15s ease'
  },
  slideCancelHint: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#71717a',
    letterSpacing: '-0.01em',
    pointerEvents: 'none',
    transition: 'opacity 0.2s ease, transform 0.2s ease'
  }
};
