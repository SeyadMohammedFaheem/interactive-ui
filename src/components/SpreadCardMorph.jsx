import React, { useState, useRef } from 'react';

const INITIAL_CARDS = [
  {
    id: 'mountain',
    title: 'Himalayan Ridge',
    image: '/images/spread_mountain_v2.jpg'
  },
  {
    id: 'portrait',
    title: 'Avant-Garde Portrait',
    image: '/images/spread_portrait_v2.jpg'
  },
  {
    id: 'hills',
    title: 'Crimson Pilgrimage',
    image: '/images/spread_hills_v2.jpg'
  }
];

// Tactile audio feedback via Web Audio API
const playSpreadSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(340, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.13);
  } catch (e) {}
};

export default function SpreadCardMorph() {
  // Ordered slots: [leftCard, centerCard, rightCard]
  // Default: mountain on left, portrait in center, hills on right
  const [deck, setDeck] = useState(INITIAL_CARDS);
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef(null);
  const startXRef = useRef(0);

  // Clicking left card (slot 0) brings it to center
  const bringLeftToCenter = () => {
    playSpreadSound();
    setDeck((prev) => [prev[1], prev[0], prev[2]]);
  };

  // Clicking right card (slot 2) brings it to center
  const bringRightToCenter = () => {
    playSpreadSound();
    setDeck((prev) => [prev[0], prev[2], prev[1]]);
  };

  const handleCardClick = (slotIndex) => {
    if (slotIndex === 0) bringLeftToCenter();
    else if (slotIndex === 2) bringRightToCenter();
  };

  // 3D Parallax on hover
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseTilt({ x: x * 6, y: -y * 6 });
  };

  const handleMouseLeave = () => {
    setMouseTilt({ x: 0, y: 0 });
    setDragOffset(0);
  };

  // Drag / swipe gestures
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
    const dx = e.clientX - startXRef.current;
    setDragOffset(dx);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragOffset < -50) {
      bringRightToCenter();
    } else if (dragOffset > 50) {
      bringLeftToCenter();
    }
    setDragOffset(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={styles.stage}
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          ...styles.fanContainer,
          transform: `perspective(1000px) rotateX(${mouseTilt.y}deg) rotateY(${mouseTilt.x}deg)`
        }}
      >
        {deck.map((card, slotIndex) => {
          // Fixed slot styling:
          // Slot 0 (Left): -120px offset, -10deg tilt, 10px lower, z-index 10
          // Slot 1 (Center): 0px offset, 0deg tilt, z-index 25 (ALWAYS in front)
          // Slot 2 (Right): +120px offset, +10deg tilt, 10px lower, z-index 10
          const isCenter = slotIndex === 1;

          let tx = 0;
          let ty = 0;
          let rotZ = 0;
          let scale = 1.05;
          let zIndex = 25;

          if (slotIndex === 0) {
            tx = -120 + (isDragging ? dragOffset * 0.35 : 0);
            ty = 8;
            rotZ = -10 + (isDragging ? dragOffset / 15 : 0);
            scale = 0.93;
            zIndex = 10;
          } else if (slotIndex === 1) {
            tx = 0 + (isDragging ? dragOffset * 0.5 : 0);
            ty = 0;
            rotZ = 0 + (isDragging ? dragOffset / 20 : 0);
            scale = 1.05;
            zIndex = 25; // Center card is ALWAYS on top!
          } else if (slotIndex === 2) {
            tx = 120 + (isDragging ? dragOffset * 0.35 : 0);
            ty = 8;
            rotZ = 10 + (isDragging ? dragOffset / 15 : 0);
            scale = 0.93;
            zIndex = 10;
          }

          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(slotIndex)}
              style={{
                ...styles.cardWrapper,
                transform: `translateX(${tx}px) translateY(${ty}px) rotateZ(${rotZ}deg) scale(${scale})`,
                zIndex,
                cursor: isCenter ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
                transition: isDragging
                  ? 'none'
                  : 'transform 0.46s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease'
              }}
            >
              <div
                style={{
                  ...styles.cardFrame,
                  boxShadow: isCenter
                    ? '0 24px 48px -10px rgba(0, 0, 0, 0.35), 0 2px 8px rgba(0, 0, 0, 0.08)'
                    : '0 12px 28px -6px rgba(0, 0, 0, 0.22)'
                }}
              >
                <img
                  src={card.image}
                  alt={card.title}
                  draggable={false}
                  style={styles.cardImage}
                />
              </div>
            </div>
          );
        })}
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
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    position: 'relative',
    userSelect: 'none',
    touchAction: 'none',
    boxSizing: 'border-box',
    padding: '24px',
    overflow: 'visible'
  },
  fanContainer: {
    position: 'relative',
    width: '184px',
    height: '254px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.15s ease-out'
  },
  cardWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '184px',
    height: '254px',
    willChange: 'transform'
  },
  cardFrame: {
    width: '100%',
    height: '100%',
    borderRadius: '22px',
    overflow: 'hidden',
    position: 'relative',
    background: 'transparent',
    boxSizing: 'border-box'
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    borderRadius: '22px',
    userSelect: 'none',
    pointerEvents: 'none'
  }
};
