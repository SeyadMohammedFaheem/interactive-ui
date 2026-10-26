import React, { useState, useRef, useEffect, useCallback } from 'react';

// Single source artwork: sheep with laptops
const IMAGE_SRC = '/images/sheep_laptops_square.jpg';

// 3 View Modes: Left = Landscape (16:9), Center = Square (1:1), Right = Portrait (3:4)
const VIEW_MODES = [
  {
    id: 'landscape',
    label: 'Landscape',
    ratio: '16:9',
    width: 256,
    height: 156,
    borderRadius: '20px',
    iconType: 'landscape'
  },
  {
    id: 'square',
    label: 'Square',
    ratio: '1:1',
    width: 232,
    height: 232,
    borderRadius: '24px',
    iconType: 'square'
  },
  {
    id: 'portrait',
    label: 'Portrait',
    ratio: '3:4',
    width: 194,
    height: 274,
    borderRadius: '22px',
    iconType: 'portrait'
  }
];

// Web Audio API soft haptic tick on morph
const playPageSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const now = ctx.currentTime;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(740, now + 0.05);
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  } catch (e) {}
};

export default function GlassyPaginationMorph({
  auto = false,
  speed = 4,
  sound = true,
  theme = 'Light'
}) {
  // Default to index 1: Square (center slot, matching user screenshot)
  const [activeModeIndex, setActiveModeIndex] = useState(1);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const cardRef = useRef(null);
  const startXRef = useRef(0);
  const activeMode = VIEW_MODES[activeModeIndex];

  const handleSelectMode = useCallback(
    (idx) => {
      if (sound && idx !== activeModeIndex) playPageSound();
      setActiveModeIndex(idx);
    },
    [sound, activeModeIndex]
  );

  // Swipe gesture handling across aspect ratio modes
  const handlePointerDown = (e) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    if (e.target.setPointerCapture) {
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const diff = e.clientX - startXRef.current;
    setDragOffset(diff * 0.35);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset < -28 && activeModeIndex < VIEW_MODES.length - 1) {
      handleSelectMode(activeModeIndex + 1);
    } else if (dragOffset > 28 && activeModeIndex > 0) {
      handleSelectMode(activeModeIndex - 1);
    }
    setDragOffset(0);
  };

  // Toggle on card tap
  const handleFrameClick = (e) => {
    if (Math.abs(dragOffset) > 5) return;
    const nextIdx = (activeModeIndex + 1) % VIEW_MODES.length;
    handleSelectMode(nextIdx);
  };

  // Autoplay support
  useEffect(() => {
    if (!auto) return;
    const interval = setInterval(() => {
      setActiveModeIndex((prev) => {
        const next = (prev + 1) % VIEW_MODES.length;
        if (sound) playPageSound();
        return next;
      });
    }, (1000 / Math.max(1, speed)) * 6);

    return () => clearInterval(interval);
  }, [auto, speed, sound]);

  // 3D perspective mouse tilt
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseTilt({ x: x * 6, y: -y * 6 });
  };

  const handleMouseLeave = () => {
    setMouseTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const SLOT_WIDTH = 38; // Width per pagination slot
  const SLOT_GAP = 6;    // Gap between slots
  const STEP = SLOT_WIDTH + SLOT_GAP; // Distance to translate active indicator

  return (
    <div style={styles.stage}>
      {/* Outer Shell Card */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          ...styles.card,
          transform: `perspective(1000px) rotateX(${mouseTilt.y}deg) rotateY(${mouseTilt.x}deg) scale(${isHovered ? 1.012 : 1})`,
          transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s ease'
        }}
      >
        {/* Artwork Display Area (Direct floating painting, no outer dark box) */}
        <div style={styles.artworkArea}>
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onClick={handleFrameClick}
            style={{
              ...styles.framedImageContainer,
              width: `${activeMode.width}px`,
              height: `${activeMode.height}px`,
              borderRadius: activeMode.borderRadius,
              transform: `translate(${dragOffset}px, 0) scale(${isDragging ? 0.98 : 1})`,
              transition: isDragging
                ? 'none'
                : 'width 0.44s cubic-bezier(0.16, 1, 0.3, 1), height 0.44s cubic-bezier(0.16, 1, 0.3, 1), border-radius 0.44s ease, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            title="Click or swipe to switch aspect ratio (Landscape, Square, Portrait)"
          >
            <img
              src={IMAGE_SRC}
              alt="Sheep with laptops artwork"
              draggable={false}
              style={styles.framedImage}
            />
          </div>
        </div>

        {/* Floating Glassy Pagination Bar (Landscape, Square, Portrait) */}
        <div style={styles.paginationTrack}>
          {/* Active Floating Circular Glass Indicator (Smooth Spring Translation) */}
          <div
            style={{
              ...styles.activeIndicatorDisc,
              transform: `translateX(${activeModeIndex * STEP}px)`,
              transition: 'transform 0.38s cubic-bezier(0.175, 0.885, 0.32, 1.25)'
            }}
          >
            {/* Active Inner Dynamic Aspect Ratio Icon */}
            <div
              style={{
                ...styles.activeIconBase,
                ...(activeMode.iconType === 'square'
                  ? styles.iconSquareActive
                  : activeMode.iconType === 'portrait'
                  ? styles.iconPortraitActive
                  : styles.iconLandscapeActive)
              }}
            />
          </div>

          {/* 3 Pagination Slots (Landscape, Square, Portrait) */}
          {VIEW_MODES.map((mode, idx) => {
            const isActive = idx === activeModeIndex;
            return (
              <button
                key={mode.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectMode(idx);
                }}
                style={{
                  ...styles.slotButton,
                  width: `${SLOT_WIDTH}px`,
                  height: `${SLOT_WIDTH}px`
                }}
                title={`${mode.label} (${mode.ratio})`}
              >
                {/* Inactive Icon outline */}
                {!isActive && (
                  <div
                    style={{
                      ...styles.inactiveIconBase,
                      ...(mode.iconType === 'square'
                        ? styles.iconSquareInactive
                        : mode.iconType === 'portrait'
                        ? styles.iconPortraitInactive
                        : styles.iconLandscapeInactive)
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles = {
  stage: {
    width: '100%',
    height: '100%',
    minHeight: '480px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    position: 'relative',
    userSelect: 'none',
    boxSizing: 'border-box',
    padding: '24px'
  },
  card: {
    width: '292px',
    background: 'transparent',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    fontFamily: "'Plus Jakarta Sans', sans-serif"
  },
  artworkArea: {
    width: '100%',
    height: '290px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  framedImageContainer: {
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 16px 36px -8px rgba(0, 0, 0, 0.18), 0 4px 12px rgba(0, 0, 0, 0.08)',
    cursor: 'pointer',
    touchAction: 'none',
    willChange: 'width, height, transform, border-radius'
  },
  framedImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    display: 'block',
    userSelect: 'none',
    pointerEvents: 'none'
  },
  paginationTrack: {
    marginTop: '18px',
    height: '46px',
    background: 'rgba(0, 0, 0, 0.06)',
    borderRadius: '999px',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    position: 'relative',
    boxSizing: 'border-box',
    boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.04)'
  },
  activeIndicatorDisc: {
    position: 'absolute',
    top: '4px',
    left: '4px',
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: '#ffffff',
    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.14), 0 1px 3px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    pointerEvents: 'none'
  },
  activeIconBase: {
    boxSizing: 'border-box',
    border: '2px solid #18181b',
    transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)'
  },
  iconSquareActive: {
    width: '12px',
    height: '12px',
    borderRadius: '3.5px'
  },
  iconPortraitActive: {
    width: '10px',
    height: '15px',
    borderRadius: '3.5px'
  },
  iconLandscapeActive: {
    width: '15px',
    height: '10px',
    borderRadius: '3px'
  },
  slotButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 5,
    padding: 0,
    margin: 0
  },
  inactiveIconBase: {
    boxSizing: 'border-box',
    border: '1.8px solid #71717a',
    opacity: 0.75,
    transition: 'opacity 0.2s ease, transform 0.2s ease'
  },
  iconSquareInactive: {
    width: '12px',
    height: '12px',
    borderRadius: '3.5px'
  },
  iconPortraitInactive: {
    width: '10px',
    height: '15px',
    borderRadius: '3.5px'
  },
  iconLandscapeInactive: {
    width: '15px',
    height: '10px',
    borderRadius: '3px'
  }
};
