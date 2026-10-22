import React, { useState, useRef, useEffect, useCallback } from 'react';

// Delicate tick sound on slider drag
const playTickSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {
    // Ignore audio restrictions
  }
};

export default function BeforeAfterMorph({
  auto = false,
  speed = 4,
  sound = true,
  theme = 'Light'
}) {
  const [sliderPos, setSliderPos] = useState(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState(false);
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const containerRef = useRef(null);
  const lastSoundPos = useRef(50);
  const autoDirection = useRef(1); // 1 = moving right, -1 = moving left
  const animFrameRef = useRef(null);

  // Drag tracking
  const updatePositionFromClientX = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const rawPos = ((clientX - rect.left) / rect.width) * 100;
    const clamped = Math.max(3, Math.min(97, rawPos));
    setSliderPos(clamped);

    // Subtle audio tick when dragging past steps
    if (sound && Math.abs(clamped - lastSoundPos.current) > 6) {
      playTickSound();
      lastSoundPos.current = clamped;
    }
  }, [sound]);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    updatePositionFromClientX(e.clientX);
    if (e.target.setPointerCapture) {
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  const handlePointerMove = (e) => {
    if (isDragging) {
      updatePositionFromClientX(e.clientX);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Subtle 3D tilt tracking on hover
  const handleMouseMove = (e) => {
    if (!containerRef.current || isDragging) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseTilt({ x: x * 8, y: -y * 8 });
  };

  const handleMouseLeave = () => {
    setMouseTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  // Autoplay oscillation
  useEffect(() => {
    if (!auto || isDragging) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let current = sliderPos;
    let lastTime = performance.now();

    const loop = (now) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Speed in percentage per second
      const rate = (100 / Math.max(1.5, speed || 4)) * 0.8;
      current += autoDirection.current * rate * delta;

      if (current >= 82) {
        current = 82;
        autoDirection.current = -1;
      } else if (current <= 18) {
        current = 18;
        autoDirection.current = 1;
      }

      setSliderPos(current);
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [auto, speed, isDragging]);

  return (
    <div style={styles.outerContainer}>
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          ...styles.cardWrapper,
          transform: `perspective(1000px) rotateX(${mouseTilt.y}deg) rotateY(${mouseTilt.x}deg) scale(${isHovered ? 1.015 : 1})`,
          cursor: isDragging ? 'grabbing' : 'ew-resize'
        }}
      >
        {/* Layer 1: After (Full Vibrant Color Painting) */}
        <div style={styles.imageLayer}>
          <img
            src="/images/yak_mountain_painting.jpg"
            alt="Color Oil Painting After"
            draggable={false}
            style={styles.cardImg}
          />
        </div>

        {/* Layer 2: Before (Desaturated / Monochrome Grayscale Sketch) */}
        <div
          style={{
            ...styles.imageLayer,
            clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`
          }}
        >
          <img
            src="/images/yak_mountain_painting.jpg"
            alt="Monochrome Sketch Before"
            draggable={false}
            style={{
              ...styles.cardImg,
              filter: 'grayscale(100%) contrast(1.15) brightness(0.92)'
            }}
          />
        </div>

        {/* Top-Left: "Before" Pill Badge */}
        <div
          style={{
            ...styles.badgePill,
            ...styles.badgeBefore,
            opacity: sliderPos > 12 ? 1 : Math.max(0, (sliderPos - 4) / 8)
          }}
        >
          Before
        </div>

        {/* Top-Right: "After" Pill Badge */}
        <div
          style={{
            ...styles.badgePill,
            ...styles.badgeAfter,
            opacity: sliderPos < 88 ? 1 : Math.max(0, (96 - sliderPos) / 8)
          }}
        >
          After
        </div>

        {/* Center Divider Vertical Line */}
        <div
          style={{
            ...styles.dividerLine,
            left: `${sliderPos}%`
          }}
        />

        {/* Circular Drag Handle Knob */}
        <div
          style={{
            ...styles.handleKnob,
            left: `${sliderPos}%`,
            transform: `translate(-50%, -50%) scale(${isDragging ? 1.12 : 1})`,
            boxShadow: isDragging
              ? '0 10px 28px rgba(0, 0, 0, 0.35), 0 2px 8px rgba(0, 0, 0, 0.2)'
              : '0 6px 20px rgba(0, 0, 0, 0.24), 0 1px 4px rgba(0, 0, 0, 0.12)'
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#18181b"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="8 7 3 12 8 17" />
            <polyline points="16 7 21 12 16 17" />
          </svg>
        </div>
      </div>
    </div>
  );
}

const styles = {
  outerContainer: {
    width: '100%',
    height: '100%',
    minHeight: '440px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    boxSizing: 'border-box',
    userSelect: 'none',
    touchAction: 'none'
  },
  cardWrapper: {
    position: 'relative',
    width: '280px',
    height: '420px',
    borderRadius: '30px',
    overflow: 'hidden',
    boxShadow: '0 24px 50px -12px rgba(0, 0, 0, 0.24), 0 4px 16px rgba(0, 0, 0, 0.08)',
    backgroundColor: '#18181b',
    transformStyle: 'preserve-3d',
    transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s ease'
  },
  imageLayer: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none'
  },
  cardImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    userSelect: 'none',
    pointerEvents: 'none'
  },
  badgePill: {
    position: 'absolute',
    top: '18px',
    padding: '6px 14px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: '-0.01em',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    pointerEvents: 'none',
    zIndex: 10,
    transition: 'opacity 0.18s ease'
  },
  badgeBefore: {
    left: '18px',
    background: 'rgba(30, 30, 32, 0.65)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)'
  },
  badgeAfter: {
    right: '18px',
    background: 'rgba(32, 84, 160, 0.75)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)'
  },
  dividerLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '2px',
    background: '#ffffff',
    transform: 'translateX(-50%)',
    zIndex: 15,
    pointerEvents: 'none',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.4)'
  },
  handleKnob: {
    position: 'absolute',
    top: '50%',
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    background: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    cursor: 'ew-resize',
    pointerEvents: 'none',
    transition: 'transform 0.16s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.16s ease'
  }
};
