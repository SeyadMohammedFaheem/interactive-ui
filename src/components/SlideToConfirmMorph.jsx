import React, { useState, useRef, useEffect, useCallback } from 'react';

// Web Audio API sounds for drag ticks and confirmation
const playSlideAudio = (type = 'tick') => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'tick') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(340, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } else if (type === 'confirm') {
      const now = ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(freq, now + i * 0.06);
        g.gain.setValueAtTime(0.06, now + i * 0.06);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.22);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(now + i * 0.06);
        o.stop(now + i * 0.06 + 0.24);
      });
    } else if (type === 'snapback') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    }
  } catch (e) {}
};

export default function SlideToConfirmMorph({
  auto = false,
  speed = 4,
  sound = true,
  theme = 'Light'
}) {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const KNOB_SIZE = 52;
  const TRACK_PADDING = 5;
  const TRACK_WIDTH = 330;
  const MAX_DRAG = TRACK_WIDTH - KNOB_SIZE - TRACK_PADDING * 2;

  const startXRef = useRef(0);
  const dragXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const isConfirmedRef = useRef(false);
  const lastTickDistRef = useRef(0);

  // Sync refs for global window event listeners
  useEffect(() => {
    dragXRef.current = dragX;
  }, [dragX]);

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  useEffect(() => {
    isConfirmedRef.current = isConfirmed;
  }, [isConfirmed]);

  // Trigger successful confirmation
  const triggerConfirm = useCallback(() => {
    setIsConfirmed(true);
    setIsDragging(false);
    isConfirmedRef.current = true;
    isDraggingRef.current = false;
    setDragX(MAX_DRAG);
    dragXRef.current = MAX_DRAG;
    if (sound) playSlideAudio('confirm');
  }, [MAX_DRAG, sound]);

  // Reset to initial state
  const handleReset = useCallback((e) => {
    if (e) e.stopPropagation();
    setIsConfirmed(false);
    setIsDragging(false);
    isConfirmedRef.current = false;
    isDraggingRef.current = false;
    setDragX(0);
    dragXRef.current = 0;
    if (sound) playSlideAudio('snapback');
  }, [sound]);

  // Pointer down on knob
  const handlePointerDown = (e) => {
    if (isConfirmedRef.current) {
      handleReset(e);
      return;
    }
    e.preventDefault();
    setIsDragging(true);
    isDraggingRef.current = true;
    startXRef.current = e.clientX - dragXRef.current;
    lastTickDistRef.current = dragXRef.current;
  };

  // Robust global window pointer events: never drops tracking even when dragging outside card
  useEffect(() => {
    const handleWindowPointerMove = (e) => {
      if (!isDraggingRef.current || isConfirmedRef.current) return;
      const currentX = e.clientX - startXRef.current;
      const clampedX = Math.max(0, Math.min(MAX_DRAG, currentX));
      setDragX(clampedX);
      dragXRef.current = clampedX;

      // Audio tick every 26px
      if (sound && Math.abs(clampedX - lastTickDistRef.current) > 26) {
        playSlideAudio('tick');
        lastTickDistRef.current = clampedX;
      }

      // If dragged all the way to the end (100%), auto-confirm immediately
      if (clampedX >= MAX_DRAG - 2) {
        triggerConfirm();
      }
    };

    const handleWindowPointerUp = () => {
      if (!isDraggingRef.current || isConfirmedRef.current) return;
      setIsDragging(false);
      isDraggingRef.current = false;

      // Confirm threshold: 72% of track
      if (dragXRef.current >= MAX_DRAG * 0.72) {
        triggerConfirm();
      } else {
        setDragX(0);
        dragXRef.current = 0;
        if (sound) playSlideAudio('snapback');
      }
    };

    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('pointerup', handleWindowPointerUp);
    window.addEventListener('pointercancel', handleWindowPointerUp);

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
      window.removeEventListener('pointercancel', handleWindowPointerUp);
    };
  }, [MAX_DRAG, triggerConfirm, sound]);

  // Autoplay cycle support
  useEffect(() => {
    if (!auto) return;
    let timeoutId;
    let animId;

    const runAutoCycle = () => {
      if (isDraggingRef.current) return;
      const startTime = performance.now();
      const duration = Math.max(800, (1000 / Math.max(1, speed)) * 4);

      const step = (now) => {
        const elapsed = now - startTime;
        const p = Math.min(1, elapsed / duration);
        // Smooth easeInOut
        const ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        const x = ease * MAX_DRAG;
        setDragX(x);
        dragXRef.current = x;

        if (p < 1) {
          animId = requestAnimationFrame(step);
        } else {
          triggerConfirm();
          timeoutId = setTimeout(() => {
            handleReset();
            timeoutId = setTimeout(runAutoCycle, 1200);
          }, 2400);
        }
      };

      animId = requestAnimationFrame(step);
    };

    timeoutId = setTimeout(runAutoCycle, 800);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(animId);
    };
  }, [auto, speed, MAX_DRAG, triggerConfirm, handleReset]);

  const progressRatio = Math.max(0, Math.min(1, dragX / MAX_DRAG));

  return (
    <div style={styles.stage}>
      {/* Track Pill */}
      <div
        style={{
          ...styles.track,
          width: `${TRACK_WIDTH}px`,
          padding: `${TRACK_PADDING}px`,
          borderColor: isConfirmed ? '#10b981' : 'transparent',
          boxShadow: isConfirmed
            ? '0 8px 30px rgba(16, 185, 129, 0.18), 0 2px 6px rgba(0, 0, 0, 0.04)'
            : '0 8px 28px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03)'
        }}
        onClick={isConfirmed ? handleReset : undefined}
      >
        {/* Fill Track following the knob */}
        <div
          style={{
            ...styles.fillTrack,
            width: isConfirmed
              ? '100%'
              : `${dragX + KNOB_SIZE + TRACK_PADDING}px`,
            background: isConfirmed
              ? 'linear-gradient(90deg, #ecfdf5 0%, #d1fae5 100%)'
              : '#f4f4f5',
            opacity: isConfirmed ? 1 : progressRatio > 0.04 ? 1 : 0
          }}
        />

        {/* State 1: "Slide to confirm" Text Label (Visible during idle and initial drag) */}
        {!isConfirmed && (
          <div
            style={{
              ...styles.textLabel,
              opacity: Math.max(0, 1 - progressRatio * 1.6),
              transform: `translateX(${progressRatio * 16}px)`
            }}
          >
            <span className="slide-shimmer">Slide to confirm</span>
          </div>
        )}

        {/* State 2: "Release to confirm" prompt when past threshold */}
        {!isConfirmed && progressRatio > 0.65 && (
          <div
            style={{
              ...styles.releaseLabel,
              opacity: Math.min(1, (progressRatio - 0.65) * 3)
            }}
          >
            <span>Release to confirm</span>
          </div>
        )}

        {/* State 3: Confirmed Success State Label (Never blank!) */}
        {isConfirmed && (
          <div style={styles.confirmedContent}>
            <div style={styles.confirmedBadge}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#10b981"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Confirmed</span>
            </div>
            <button
              style={styles.resetBtn}
              onClick={handleReset}
              title="Click to reset"
            >
              Reset
            </button>
          </div>
        )}

        {/* Draggable Circular Knob */}
        <div
          onPointerDown={handlePointerDown}
          style={{
            ...styles.knob,
            width: `${KNOB_SIZE}px`,
            height: `${KNOB_SIZE}px`,
            transform: `translateX(${dragX}px)`,
            cursor: isConfirmed ? 'pointer' : isDragging ? 'grabbing' : 'grab',
            transition: isDragging
              ? 'none'
              : 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), background 0.25s ease, box-shadow 0.25s ease',
            background: isConfirmed ? '#10b981' : '#18181b',
            boxShadow: isConfirmed
              ? '0 4px 14px rgba(16, 185, 129, 0.4)'
              : isDragging
              ? '0 6px 18px rgba(0, 0, 0, 0.28)'
              : '0 4px 12px rgba(0, 0, 0, 0.16)'
          }}
          title={isConfirmed ? 'Click to reset' : 'Drag to confirm'}
        >
          {isConfirmed ? (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ animation: 'checkPop 0.32s cubic-bezier(0.175, 0.885, 0.32, 1.4)' }}
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: `translateX(${progressRatio * 4}px)`,
                transition: 'transform 0.1s ease'
              }}
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          )}
        </div>
      </div>

      {/* Shimmer CSS */}
      <style>{`
        .slide-shimmer {
          background: linear-gradient(
            90deg,
            #71717a 0%,
            #71717a 35%,
            #18181b 50%,
            #71717a 65%,
            #71717a 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: textShine 3s infinite linear;
        }
        @keyframes textShine {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes checkPop {
          0% { transform: scale(0.3); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  stage: {
    width: '100%',
    height: '100%',
    minHeight: '260px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    position: 'relative',
    userSelect: 'none',
    touchAction: 'none',
    boxSizing: 'border-box',
    padding: '24px'
  },
  track: {
    height: '62px',
    background: '#ffffff',
    borderRadius: '999px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    border: '1.5px solid transparent',
    boxSizing: 'border-box',
    overflow: 'hidden',
    transition: 'border-color 0.25s ease, box-shadow 0.25s ease'
  },
  fillTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: '999px',
    transition: 'background 0.3s ease, width 0.1s linear, opacity 0.2s ease',
    pointerEvents: 'none'
  },
  textLabel: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: '36px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#71717a',
    letterSpacing: '-0.01em',
    pointerEvents: 'none',
    transition: 'opacity 0.12s ease'
  },
  releaseLabel: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '32px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#059669',
    letterSpacing: '-0.01em',
    pointerEvents: 'none',
    transition: 'opacity 0.15s ease'
  },
  confirmedContent: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: '24px',
    paddingRight: '64px',
    zIndex: 4,
    animation: 'checkPop 0.25s ease'
  },
  confirmedBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '15px',
    fontWeight: '700',
    color: '#059669',
    letterSpacing: '-0.02em'
  },
  resetBtn: {
    background: 'rgba(5, 150, 105, 0.12)',
    border: 'none',
    color: '#059669',
    fontSize: '12px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '999px',
    cursor: 'pointer',
    transition: 'background 0.15s ease'
  },
  knob: {
    position: 'absolute',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    willChange: 'transform'
  }
};
