import React, { useState, useRef, useEffect, useCallback } from 'react';

const INITIAL_ITEMS = [
  {
    id: 'item-1',
    title: 'Springs that keep their velocity',
    source: 'motion',
    color: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
    shadow: 'rgba(139, 92, 246, 0.35)'
  },
  {
    id: 'item-2',
    title: 'Reduced motion, done properly',
    source: 'web.dev',
    color: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)',
    shadow: 'rgba(14, 165, 233, 0.35)'
  },
  {
    id: 'item-3',
    title: 'Layout animation with FLIP',
    source: 'css-tricks',
    color: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
    shadow: 'rgba(236, 72, 153, 0.35)'
  }
];

// Web Audio API tactile haptic sounds
const playListSound = (type = 'hover') => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const now = ctx.currentTime;
    if (type === 'drop') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.05);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, now);
      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    }
  } catch (e) {}
};

export default function ReorderListMorph({
  auto = false,
  speed = 4,
  sound = true,
  theme = 'Light'
}) {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [draggedId, setDraggedId] = useState(null);
  const [dragY, setDragY] = useState(0);
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const containerRef = useRef(null);
  const startYRef = useRef(0);
  const dragYRef = useRef(0);
  const itemsRef = useRef(INITIAL_ITEMS);
  const draggedIdRef = useRef(null);

  const ITEM_HEIGHT = 74; // Height + gap of each card item

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Pointer drag start
  const handlePointerDown = (id, e) => {
    setDraggedId(id);
    draggedIdRef.current = id;
    startYRef.current = e.clientY;
    dragYRef.current = 0;
    setDragY(0);
    if (sound) playListSound('hover');
    if (e.target.setPointerCapture) {
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!draggedIdRef.current) return;
      const currentDrag = e.clientY - startYRef.current;
      dragYRef.current = currentDrag;
      setDragY(currentDrag);

      // Calculate new target index based on drag displacement
      const currentIdx = itemsRef.current.findIndex((it) => it.id === draggedIdRef.current);
      if (currentIdx === -1) return;

      const offsetIdx = Math.round(currentDrag / ITEM_HEIGHT);
      const targetIdx = Math.max(0, Math.min(itemsRef.current.length - 1, currentIdx + offsetIdx));

      if (targetIdx !== currentIdx) {
        // Swap items in real time with FLIP spring transition
        const newArr = [...itemsRef.current];
        const [moved] = newArr.splice(currentIdx, 1);
        newArr.splice(targetIdx, 0, moved);
        setItems(newArr);
        startYRef.current = e.clientY;
        dragYRef.current = 0;
        setDragY(0);
        if (sound) playListSound('hover');
      }
    };

    const handlePointerUp = () => {
      if (!draggedIdRef.current) return;
      setDraggedId(null);
      draggedIdRef.current = null;
      setDragY(0);
      dragYRef.current = 0;
      if (sound) playListSound('drop');
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [ITEM_HEIGHT, sound]);

  // Autoplay support: periodically cycles cards using FLIP reordering
  useEffect(() => {
    if (!auto || draggedId) return;
    const interval = setInterval(() => {
      setItems((prev) => {
        const next = [...prev];
        const [first] = next.splice(0, 1);
        next.push(first);
        if (sound) playListSound('drop');
        return next;
      });
    }, (1000 / Math.max(1, speed)) * 8);

    return () => clearInterval(interval);
  }, [auto, speed, draggedId, sound]);

  // 3D perspective mouse tilt
  const handleMouseMove = (e) => {
    if (!containerRef.current || draggedId) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseTilt({ x: x * 6, y: -y * 6 });
  };

  const handleMouseLeave = () => {
    setMouseTilt({ x: 0, y: 0 });
    setIsCardHovered(false);
  };

  return (
    <div style={styles.stage}>
      {/* List of 3 Item Cards (No enclosing outer box) */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsCardHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          ...styles.listContainer,
          transform: `perspective(1000px) rotateX(${mouseTilt.y}deg) rotateY(${mouseTilt.x}deg) scale(${isCardHovered ? 1.012 : 1})`,
          transition: draggedId
            ? 'none'
            : 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {items.map((item, index) => {
          const isBeingDragged = draggedId === item.id;
          const isHovered = hoveredIndex === item.id;

          return (
            <div
              key={item.id}
              onPointerDown={(e) => handlePointerDown(item.id, e)}
              onMouseEnter={() => setHoveredIndex(item.id)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                ...styles.itemCard,
                transform: isBeingDragged
                  ? `translateY(${dragY}px) scale(1.03)`
                  : isHovered
                  ? 'translateY(-2px)'
                  : 'translateY(0)',
                zIndex: isBeingDragged ? 20 : 5,
                boxShadow: isBeingDragged
                  ? '0 18px 36px -4px rgba(0, 0, 0, 0.16), 0 6px 14px rgba(0, 0, 0, 0.06)'
                  : '0 8px 22px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.02)',
                cursor: isBeingDragged ? 'grabbing' : 'grab',
                transition: isBeingDragged
                  ? 'box-shadow 0.2s ease, transform 0.05s ease'
                  : 'transform 0.32s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease'
              }}
              title="Drag to reorder card"
            >
              {/* Title */}
              <h3 style={styles.itemTitle}>{item.title}</h3>

              {/* Meta Row: 3D Gradient Orb + Source Tag */}
              <div style={styles.metaRow}>
                {/* Glowing 3D Gradient Orb */}
                <div
                  style={{
                    ...styles.orbDot,
                    background: item.color,
                    boxShadow: `0 2px 6px ${item.shadow}`
                  }}
                />

                {/* Source Name */}
                <span style={styles.sourceText}>{item.source}</span>
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
    boxSizing: 'border-box',
    padding: '24px'
  },
  listContainer: {
    width: '288px',
    maxWidth: '92vw',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    position: 'relative',
    fontFamily: "'Plus Jakarta Sans', sans-serif"
  },
  itemCard: {
    width: '100%',
    background: '#ffffff',
    borderRadius: '18px',
    padding: '16px 18px',
    boxSizing: 'border-box',
    border: '1px solid rgba(0, 0, 0, 0.03)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    touchAction: 'none',
    willChange: 'transform, box-shadow'
  },
  itemTitle: {
    margin: 0,
    fontSize: '15px',
    fontWeight: '700',
    color: '#18181b',
    letterSpacing: '-0.015em',
    lineHeight: 1.3
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '2px'
  },
  orbDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    flexShrink: 0
  },
  sourceText: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#8e8e93',
    letterSpacing: '-0.01em'
  }
};
