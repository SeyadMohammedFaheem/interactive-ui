import React, { useState, useRef, useEffect } from 'react';

// Web Audio API sounds for drag ticks and confirmation
const playSlideAudio = (type = 'tick') => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'tick') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'confirm') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.36);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.38);
    } else if (type === 'snapback') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    }
  } catch (e) {}
};

export default function SlideToConfirmMorph() {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const trackRef = useRef(null);
  const startXRef = useRef(0);
  const lastTickDistRef = useRef(0);

  const KNOB_SIZE = 56;
  const TRACK_PADDING = 6;
  const TRACK_WIDTH = 320;
  const MAX_DRAG = TRACK_WIDTH - KNOB_SIZE - TRACK_PADDING * 2;

  // Handle pointer drag
  const handlePointerDown = (e) => {
    if (isConfirmed) return;
    setIsDragging(true);
    startXRef.current = e.clientX - dragX;
    lastTickDistRef.current = dragX;
    if (e.target.setPointerCapture) {
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging || isConfirmed) return;
    const currentX = e.clientX - startXRef.current;
    const clampedX = Math.max(0, Math.min(MAX_DRAG, currentX));
    setDragX(clampedX);

    // Audio tick every 28px
    if (Math.abs(clampedX - lastTickDistRef.current) > 28) {
      playSlideAudio('tick');
      lastTickDistRef.current = clampedX;
    }
  };

  const handlePointerUp = () => {
    if (!isDragging || isConfirmed) return;
    setIsDragging(false);

    // Confirmation threshold: 82% of track
    if (dragX >= MAX_DRAG * 0.82) {
      setDragX(MAX_DRAG);
      setIsConfirmed(true);
      playSlideAudio('confirm');
    } else {
      // Elastic snapback
      setDragX(0);
      playSlideAudio('snapback');
    }
  };

  const handleReset = (e) => {
    e.stopPropagation();
    setIsConfirmed(false);
    setDragX(0);
    playSlideAudio('snapback');
  };

  const progressRatio = dragX / MAX_DRAG;

  return (
    <div style={styles.stage}>
      {/* Track Pill */}
      <div
        ref={trackRef}
        style={{
          ...styles.track,
          width: `${TRACK_WIDTH}px`,
          padding: `${TRACK_PADDING}px`
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Dynamic Completed / Fill Track */}
        <div
          style={{
            ...styles.fillTrack,
            width: isConfirmed
              ? '100%'
              : `${dragX + KNOB_SIZE + TRACK_PADDING}px`,
            background: isConfirmed ? '#10b981' : '#f4f4f5'
          }}
        />

        {/* Text Label */}
        <div
          style={{
            ...styles.textLabel,
            opacity: isConfirmed ? 0 : Math.max(0, 1 - progressRatio * 1.5)
          }}
        >
          <span className="slide-shimmer">Slide to confirm</span>
        </div>

        {/* Confirmed Success State Label */}
        {isConfirmed && (
          <div
            style={styles.confirmedText}
            onClick={handleReset}
            title="Tap to reset"
          >
            <span>Confirmed</span>
            <span style={styles.resetPill}>Tap to reset</span>
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
              : 'transform 0.36s cubic-bezier(0.175, 0.885, 0.32, 1.25), background 0.3s ease',
            background: isConfirmed ? '#ffffff' : '#18181b',
            color: isConfirmed ? '#10b981' : '#ffffff'
          }}
          onClick={isConfirmed ? handleReset : undefined}
        >
          {isConfirmed ? (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ animation: 'checkPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.4)' }}
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: `translateX(${progressRatio * 3}px)`,
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
          0% { transform: scale(0.4); opacity: 0; }
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
    height: '68px',
    background: '#ffffff',
    borderRadius: '999px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 4px 18px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03)',
    boxSizing: 'border-box',
    overflow: 'hidden'
  },
  fillTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: '999px',
    transition: 'background 0.3s ease',
    pointerEvents: 'none'
  },
  textLabel: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: '40px',
    fontSize: '15px',
    fontWeight: '500',
    color: '#71717a',
    letterSpacing: '-0.01em',
    pointerEvents: 'none',
    transition: 'opacity 0.16s ease'
  },
  confirmedText: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: '60px',
    gap: '8px',
    fontSize: '15px',
    fontWeight: '700',
    color: '#ffffff',
    cursor: 'pointer',
    zIndex: 4,
    animation: 'checkPop 0.3s ease'
  },
  resetPill: {
    fontSize: '11px',
    fontWeight: '600',
    background: 'rgba(255, 255, 255, 0.25)',
    padding: '3px 8px',
    borderRadius: '999px',
    color: '#ffffff'
  },
  knob: {
    position: 'absolute',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.16)',
    zIndex: 10,
    willChange: 'transform'
  }
};
