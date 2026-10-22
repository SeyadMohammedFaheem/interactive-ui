import React, { useState, useRef, useEffect, useCallback } from 'react';

const INITIAL_CARDS = [
  {
    id: 'textile',
    title: 'Textile',
    image: '/images/card_mesh.jpg',
    accent: '#ff2d55'
  },
  {
    id: 'sculpture',
    title: 'Sculpture',
    image: '/images/card_stipple.jpg',
    accent: '#27272a'
  },
  {
    id: 'mountain',
    title: 'Mountain',
    image: '/images/card_mountain.jpg',
    accent: '#ff5e3a'
  },
  {
    id: 'flora',
    title: 'Flora',
    image: '/images/card_botanical.jpg',
    accent: '#34c759'
  }
];

// Play delicate high-end sound effect using Web Audio API
const playSwapSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.13);
  } catch (e) {
    // Ignore audio context errors on muted browsers
  }
};

export default function CardSwapMorph({ auto = false, speed = 4, sound = true, theme = 'Light' }) {
  const [cards, setCards] = useState(INITIAL_CARDS);
  const [animatingCard, setAnimatingCard] = useState(null); // card id currently flying out
  const [exitDirection, setExitDirection] = useState({ x: -1, y: 0.3, dx: -180, dy: 60 });
  const [isPlaying, setIsPlaying] = useState(auto);
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef(null);
  const cardsRef = useRef(cards);
  cardsRef.current = cards;
  const isSwappingRef = useRef(false);
  const autoPlayTimerRef = useRef(null);

  // Dragging refs
  const dragStartRef = useRef({ x: 0, y: 0 });
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);

  useEffect(() => {
    setIsPlaying(auto);
  }, [auto]);

  // Trigger swap interaction: front card swoops out and tucks into the back
  const swapNext = useCallback((exitDir = { x: -1, y: 0.3, dx: -180, dy: 60 }) => {
    if (isSwappingRef.current) return;
    const currentFront = cardsRef.current[0];
    if (!currentFront) return;

    isSwappingRef.current = true;
    if (sound) playSwapSound();
    setExitDirection(exitDir);
    setAnimatingCard(currentFront.id);

    // After fly-out half of cycle, rotate array so front card is at the back
    setTimeout(() => {
      setCards((prev) => {
        if (!prev || prev.length < 2) return prev;
        const [first, ...rest] = prev;
        return [...rest, first];
      });
      setAnimatingCard(null);
      setDragOffset({ x: 0, y: 0 });
      dragOffsetRef.current = { x: 0, y: 0 };

      // Reset swap lock
      setTimeout(() => {
        isSwappingRef.current = false;
      }, 140);
    }, 380);
  }, [sound]);

  // Direct jump to card when clicked in stack
  const bringToFront = (index) => {
    if (index === 0) {
      swapNext();
      return;
    }
    if (isSwappingRef.current) return;
    isSwappingRef.current = true;
    if (sound) playSwapSound();

    setCards((prev) => {
      const selected = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [selected, ...rest];
    });

    setTimeout(() => {
      isSwappingRef.current = false;
    }, 250);
  };

  // Autoplay functionality
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = Math.max(1000, (speed || 4) * 1000);
      autoPlayTimerRef.current = setInterval(() => {
        swapNext();
      }, intervalMs);
    } else {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    }
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isPlaying, speed, swapNext]);

  // 3D Parallax tilt tracking on hover
  const handleMouseMove = (e) => {
    if (isDraggingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseTilt({ x: x * 10, y: -y * 10 });
  };

  const handleMouseLeave = () => {
    if (!isDraggingRef.current) {
      setMouseTilt({ x: 0, y: 0 });
    }
  };

  // Pointer dragging on front card
  const handlePointerDown = (e) => {
    if (isSwappingRef.current) return;
    if (e.button !== undefined && e.button !== 0) return; // Only primary pointer

    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    dragOffsetRef.current = { x: 0, y: 0 };
    setIsDragging(true);

    const onPointerMove = (moveEvent) => {
      if (!isDraggingRef.current) return;
      const dx = moveEvent.clientX - dragStartRef.current.x;
      const dy = moveEvent.clientY - dragStartRef.current.y;
      if (Math.hypot(dx, dy) > 5) {
        hasMovedRef.current = true;
      }
      dragOffsetRef.current = { x: dx, y: dy };
      setDragOffset({ x: dx, y: dy });
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);

      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsDragging(false);

      const { x, y } = dragOffsetRef.current;
      const dist = Math.hypot(x, y);

      // If dragged sufficiently in any direction, trigger fluid swap
      if (dist > 50 || Math.abs(x) > 40 || y < -40) {
        const dirX = x >= 0 ? 1 : -1;
        const dirY = y / (Math.abs(x) || 1);
        swapNext({ x: dirX, y: dirY, dx: x, dy: y });
      } else {
        // Snap back to normal stacked position
        setDragOffset({ x: 0, y: 0 });
        dragOffsetRef.current = { x: 0, y: 0 };
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  const handleCardClick = (idx) => {
    // Suppress click event if this was a drag gesture
    if (hasMovedRef.current) {
      hasMovedRef.current = false;
      return;
    }
    bringToFront(idx);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={styles.stage}
    >
      <div
        style={{
          ...styles.deckPerspectiveWrapper,
          transform: `perspective(1100px) rotateX(${10 + mouseTilt.y}deg) rotateY(${-12 + mouseTilt.x}deg) rotateZ(-3deg)`
        }}
      >
        {cards.map((card, idx) => {
          const isFront = idx === 0;
          const isExiting = animatingCard === card.id;

          // 3D isometric fan offsets matching reference image exactly
          const stepX = 40;
          const stepY = -22;
          const stepZ = -38;
          const baseRotZ = idx * -0.5;

          let transform = '';
          let opacity = 1;
          let zIndex = cards.length - idx;

          if (isExiting) {
            // Directional swooping arc exit
            const isRight = exitDirection.x >= 0;
            const exitX = isRight
              ? Math.max(220, (exitDirection.dx || 0) + 180)
              : Math.min(-220, (exitDirection.dx || 0) - 180);
            const exitY = (exitDirection.dy || 0) + 50;
            const exitRot = isRight ? 20 : -20;

            transform = `translate3d(${exitX}px, ${exitY}px, 80px) rotateZ(${exitRot}deg) rotateY(${isRight ? 18 : -18}deg) scale(0.92)`;
            opacity = 0;
            zIndex = 50;
          } else if (isFront && isDragging) {
            // Actively dragging front card
            const rotateDeg = dragOffset.x * 0.08;
            const rotateYDeg = dragOffset.x * 0.04;
            transform = `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 40px) rotateZ(${rotateDeg}deg) rotateY(${rotateYDeg}deg) scale(1.03)`;
            zIndex = 60;
          } else {
            // Normal stacking position with subtle reactive lift if front card is being dragged
            const dragProgress = isDragging ? Math.min(1, Math.hypot(dragOffset.x, dragOffset.y) / 120) : 0;
            const liftBonus = idx === 1 ? dragProgress * 0.45 : 0;

            const effectiveIdx = idx - liftBonus;
            const tx = effectiveIdx * stepX;
            const ty = effectiveIdx * stepY;
            const tz = effectiveIdx * stepZ;
            transform = `translate3d(${tx}px, ${ty}px, ${tz}px) rotateZ(${baseRotZ}deg)`;
          }

          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(idx)}
              onPointerDown={isFront ? handlePointerDown : undefined}
              style={{
                ...styles.cardWrapper,
                transform,
                opacity,
                zIndex,
                cursor: isFront ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
                transition: isDragging && isFront
                  ? 'none'
                  : 'transform 0.44s cubic-bezier(0.34, 1.4, 0.64, 1), opacity 0.36s ease'
              }}
            >
              <div
                style={{
                  ...styles.cardFrame,
                  boxShadow: isFront && isDragging
                    ? '0 24px 48px -10px rgba(0, 0, 0, 0.32), 0 4px 14px rgba(0, 0, 0, 0.1)'
                    : '0 14px 34px -8px rgba(0, 0, 0, 0.22), 0 2px 8px rgba(0, 0, 0, 0.06)'
                }}
              >
                <img
                  src={card.image}
                  alt={card.title}
                  draggable={false}
                  style={styles.cardImage}
                />

                {/* Subtle glass reflection highlight */}
                <div style={styles.cardGloss} />

                {/* Title badge inside front card */}
                {isFront && (
                  <div
                    style={{
                      ...styles.cardBadge,
                      opacity: isExiting ? 0 : 1,
                      transform: isExiting ? 'translateY(10px) scale(0.85)' : 'translateY(0) scale(1)'
                    }}
                  >
                    <span>{card.title}</span>
                  </div>
                )}
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
    padding: '24px',
    boxSizing: 'border-box'
  },
  deckPerspectiveWrapper: {
    position: 'relative',
    width: '190px',
    height: '254px',
    transformStyle: 'preserve-3d',
    transition: 'transform 0.16s ease-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '-36px',
    marginTop: '12px'
  },
  cardWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '190px',
    height: '254px',
    transformStyle: 'preserve-3d',
    willChange: 'transform, opacity',
    touchAction: 'none'
  },
  cardFrame: {
    width: '100%',
    height: '100%',
    borderRadius: '20px',
    border: '3.5px solid #ffffff',
    overflow: 'hidden',
    position: 'relative',
    background: '#ffffff',
    boxSizing: 'border-box',
    transition: 'box-shadow 0.2s ease'
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    userSelect: 'none',
    pointerEvents: 'none'
  },
  cardGloss: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0) 55%)',
    pointerEvents: 'none'
  },
  cardBadge: {
    position: 'absolute',
    bottom: '14px',
    left: '14px',
    background: '#ffffff',
    color: '#18181b',
    padding: '6px 14px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: '700',
    letterSpacing: '-0.01em',
    boxShadow: '0 3px 12px rgba(0, 0, 0, 0.14)',
    transition: 'transform 0.28s cubic-bezier(0.34, 1.4, 0.64, 1), opacity 0.22s ease',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  }
};
