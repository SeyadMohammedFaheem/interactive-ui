import React, { useState, useRef, useEffect, useCallback, useId } from 'react';

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
  const [cardSize, setCardSize] = useState({ width: 280, height: 420 });

  // Spring physics states for flexing divider line
  const [curveData, setCurveData] = useState({
    topX: 140,
    bottomX: 140,
    knobX: 140,
    knobY: 210,
    controlX: 140,
    tiltDeg: 0,
    linePathD: 'M 140 0 Q 140 210 140 420',
    clipPathD: 'M 0 0 L 140 0 Q 140 210 140 420 L 0 420 Z'
  });

  const rawId = useId();
  const clipId = `flex-clip-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  const containerRef = useRef(null);
  const lastSoundPos = useRef(50);
  const autoDirection = useRef(1); // 1 = moving right, -1 = moving left
  const animFrameRef = useRef(null);

  // Physics animation refs
  const topXRef = useRef(140);
  const topVelRef = useRef(0);
  const bottomXRef = useRef(140);
  const bottomVelRef = useRef(0);
  const knobXRef = useRef(140);
  const knobYRef = useRef(210);
  const targetXRef = useRef(140);
  const targetYRef = useRef(210);
  const isDraggingRef = useRef(false);

  // Measure card dimensions on mount and resize
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      const rect = containerRef.current.getBoundingClientRect();
      const w = Math.round(rect.width) || 280;
      const h = Math.round(rect.height) || 420;
      setCardSize({ width: w, height: h });
      if (!isDraggingRef.current) {
        const initialX = (sliderPos / 100) * w;
        topXRef.current = initialX;
        bottomXRef.current = initialX;
        knobXRef.current = initialX;
        knobYRef.current = h / 2;
        targetXRef.current = initialX;
        targetYRef.current = h / 2;
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Update position from pointer coordinate
  const updatePositionFromPointer = useCallback((clientX, clientY) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const w = rect.width || cardSize.width;
    const h = rect.height || cardSize.height;

    const rawX = clientX - rect.left;
    const rawY = clientY !== undefined ? clientY - rect.top : h / 2;

    const clampedX = Math.max(10, Math.min(w - 10, rawX));
    const clampedY = Math.max(50, Math.min(h - 50, rawY));

    targetXRef.current = clampedX;
    targetYRef.current = clampedY;

    const percent = (clampedX / w) * 100;
    setSliderPos(percent);

    // Subtle audio tick when dragging past steps
    if (sound && Math.abs(percent - lastSoundPos.current) > 5) {
      playTickSound();
      lastSoundPos.current = percent;
    }
  }, [sound, cardSize.width, cardSize.height]);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    isDraggingRef.current = true;
    updatePositionFromPointer(e.clientX, e.clientY);
    if (e.target.setPointerCapture) {
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  const handlePointerMove = (e) => {
    if (isDraggingRef.current) {
      updatePositionFromPointer(e.clientX, e.clientY);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    isDraggingRef.current = false;
    // On release, target Y returns to center
    targetYRef.current = cardSize.height / 2;
  };

  // Subtle 3D tilt tracking on hover
  const handleMouseMove = (e) => {
    if (!containerRef.current || isDraggingRef.current) return;
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
    if (!auto || isDragging) return;

    let current = sliderPos;
    let lastTime = performance.now();
    let autoAnimId;

    const autoLoop = (now) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      const rate = (100 / Math.max(1.5, speed || 4)) * 0.85;
      current += autoDirection.current * rate * delta;

      if (current >= 82) {
        current = 82;
        autoDirection.current = -1;
      } else if (current <= 18) {
        current = 18;
        autoDirection.current = 1;
      }

      setSliderPos(current);
      const w = cardSize.width || 280;
      targetXRef.current = (current / 100) * w;
      targetYRef.current = cardSize.height / 2;

      autoAnimId = requestAnimationFrame(autoLoop);
    };

    autoAnimId = requestAnimationFrame(autoLoop);
    return () => cancelAnimationFrame(autoAnimId);
  }, [auto, speed, isDragging, cardSize.width, cardSize.height, sliderPos]);

  // Spring physics engine: computes the dynamic flexing arc of the line
  useEffect(() => {
    let animId;
    const SPRING_K = 0.082; // Elastic tension
    const DAMPING = 0.77;   // Velocity decay

    const physicsLoop = () => {
      const w = cardSize.width || 280;
      const h = cardSize.height || 420;

      // Knob tracks target immediately with responsive ease
      knobXRef.current += (targetXRef.current - knobXRef.current) * (isDraggingRef.current ? 0.85 : 0.45);
      knobYRef.current += (targetYRef.current - knobYRef.current) * 0.25;

      const knobX = knobXRef.current;
      const knobY = knobYRef.current;

      // Anchors: when dragging, slight natural tension towards center adds juicy bow
      const targetAnchorX = isDraggingRef.current
        ? knobX * 0.90 + (w / 2) * 0.10
        : knobX;

      // Top anchor spring
      const forceTop = (targetAnchorX - topXRef.current) * SPRING_K;
      topVelRef.current = (topVelRef.current + forceTop) * DAMPING;
      topXRef.current += topVelRef.current;

      // Bottom anchor spring
      const forceBottom = (targetAnchorX - bottomXRef.current) * SPRING_K;
      bottomVelRef.current = (bottomVelRef.current + forceBottom) * DAMPING;
      bottomXRef.current += bottomVelRef.current;

      const topX = Math.max(-10, Math.min(w + 10, topXRef.current));
      const bottomX = Math.max(-10, Math.min(w + 10, bottomXRef.current));

      // Calculate Quadratic Bezier Control Point passing exactly through (knobX, knobY)
      // B(t) = (1-t)^2 * topX + 2(1-t)t * controlX + t^2 * bottomX
      const t = Math.max(0.12, Math.min(0.88, knobY / h));
      const denom = 2 * (1 - t) * t;
      const rawControlX = (knobX - Math.pow(1 - t, 2) * topX - Math.pow(t, 2) * bottomX) / denom;
      const controlX = Math.max(-40, Math.min(w + 40, rawControlX));

      // Knob tilt based on flex curvature
      const curvature = knobX - (topX + bottomX) / 2;
      const tiltDeg = Math.max(-14, Math.min(14, curvature * 0.25));

      // Build SVG paths
      const linePathD = `M ${topX.toFixed(1)} 0 Q ${controlX.toFixed(1)} ${knobY.toFixed(1)} ${bottomX.toFixed(1)} ${h}`;
      const clipPathD = `M 0 0 L ${topX.toFixed(1)} 0 Q ${controlX.toFixed(1)} ${knobY.toFixed(1)} ${bottomX.toFixed(1)} ${h} L 0 ${h} Z`;

      setCurveData({
        topX,
        bottomX,
        knobX,
        knobY,
        controlX,
        tiltDeg,
        linePathD,
        clipPathD
      });

      animId = requestAnimationFrame(physicsLoop);
    };

    animId = requestAnimationFrame(physicsLoop);
    return () => cancelAnimationFrame(animId);
  }, [cardSize.width, cardSize.height]);

  const { knobX, knobY, tiltDeg, linePathD, clipPathD, topX } = curveData;

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

        {/* Layer 2: Before (Desaturated / Monochrome Grayscale Sketch) Clipped to Flexing Curve */}
        <div
          style={{
            ...styles.imageLayer,
            clipPath: `url(#${clipId})`,
            WebkitClipPath: `url(#${clipId})`
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
            opacity: topX > 32 ? 1 : Math.max(0, (topX - 10) / 22)
          }}
        >
          Before
        </div>

        {/* Top-Right: "After" Pill Badge */}
        <div
          style={{
            ...styles.badgePill,
            ...styles.badgeAfter,
            opacity: topX < (cardSize.width - 32) ? 1 : Math.max(0, (cardSize.width - 10 - topX) / 22)
          }}
        >
          After
        </div>

        {/* Center Divider: Flexing SVG Line + ClipPath Defs */}
        <svg
          style={styles.svgOverlay}
          viewBox={`0 0 ${cardSize.width} ${cardSize.height}`}
        >
          <defs>
            <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
              <path d={clipPathD} />
            </clipPath>
          </defs>

          {/* Ambient soft drop shadow behind the flexing line */}
          <path
            d={linePathD}
            fill="none"
            stroke="rgba(0, 0, 0, 0.45)"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Crisp white flexing divider line */}
          <path
            d={linePathD}
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>

        {/* Circular Drag Handle Knob positioned exactly at the flex apex */}
        <div
          style={{
            ...styles.handleKnob,
            left: `${knobX}px`,
            top: `${knobY}px`,
            transform: `translate(-50%, -50%) scale(${isDragging ? 1.14 : 1}) rotate(${tiltDeg}deg)`,
            boxShadow: isDragging
              ? '0 12px 30px rgba(0, 0, 0, 0.38), 0 3px 10px rgba(0, 0, 0, 0.22)'
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
  svgOverlay: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 15
  },
  handleKnob: {
    position: 'absolute',
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
    transition: 'transform 0.1s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.16s ease'
  }
};
