import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';

const MENU_ITEMS = [
  {
    id: 'learning',
    label: 'Learning',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
      </svg>
    )
  },
  {
    id: 'document',
    label: 'Document',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
      </svg>
    )
  },
  {
    id: 'music',
    label: 'Music',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="8" x2="9" y2="8"></line>
        <line x1="3" y1="12" x2="9" y2="12"></line>
        <line x1="3" y1="16" x2="9" y2="16"></line>
        <circle cx="15.5" cy="16.5" r="2.5"></circle>
        <path d="M18 16.5V6.5l4-1v4"></path>
      </svg>
    )
  },
  {
    id: 'video',
    label: 'Video',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="2" ry="2"></rect>
        <path d="M3 9h18"></path>
        <path d="M8 5l-2 4"></path>
        <path d="M13 5l-2 4"></path>
        <path d="M18 5l-2 4"></path>
      </svg>
    )
  },
  {
    id: 'image',
    label: 'Image',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="7" width="14" height="14" rx="2" ry="2"></rect>
        <path d="M8 3h11a2 2 0 0 1 2 2v11"></path>
        <circle cx="9.5" cy="11.5" r="1.5"></circle>
        <polyline points="19 17 14 12 7 19"></polyline>
      </svg>
    )
  }
];

export default function ExpandableFabMorph() {
  const [isOpen, setIsOpen] = useState(true); // Open by default to match screenshot view
  const [selectedItem, setSelectedItem] = useState(null);

  const containerRef = useRef(null);
  const fabRef = useRef(null);
  const plusIconRef = useRef(null);
  const itemRefs = useRef([]);

  itemRefs.current = [];
  const addToItemRefs = (el) => {
    if (el && !itemRefs.current.includes(el)) {
      itemRefs.current.push(el);
    }
  };

  // Vector offsets from each pill's resting position down to the FAB button origin
  const startOffsets = [
    { x: 68, y: 348 }, // Learning
    { x: 46, y: 278 }, // Document
    { x: 26, y: 208 }, // Music
    { x: 8,  y: 138 }, // Video
    { x: -8, y: 68 }   // Image
  ];

  useEffect(() => {
    const items = itemRefs.current;
    const plusEl = plusIconRef.current;
    const fabEl = fabRef.current;

    if (isOpen) {
      // FAB button rotation animation (+ to X)
      gsap.to(plusEl, {
        rotation: 135,
        duration: 0.45,
        ease: 'back.out(1.8)'
      });

      // Subtle spring pulse on FAB button
      gsap.fromTo(
        fabEl,
        { scale: 0.92 },
        { scale: 1, duration: 0.4, ease: 'back.out(2)' }
      );

      gsap.killTweensOf(items);

      // Fan out each menu item outward directly FROM THE FAB BUTTON origin
      items.forEach((item, idx) => {
        const offset = startOffsets[idx] || { x: 0, y: 20 };
        gsap.fromTo(
          item,
          {
            opacity: 0,
            scale: 0.2,
            x: offset.x,
            y: offset.y,
            filter: 'blur(3px)'
          },
          {
            opacity: 1,
            scale: 1,
            x: 0,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.48,
            delay: (items.length - 1 - idx) * 0.05,
            ease: 'back.out(1.6)'
          }
        );
      });
    } else {
      // Rotate back (X to +)
      gsap.to(plusEl, {
        rotation: 0,
        duration: 0.4,
        ease: 'power3.inOut'
      });

      // Collapse menu items back into the FAB button origin
      items.forEach((item, idx) => {
        const offset = startOffsets[idx] || { x: 0, y: 20 };
        gsap.to(item, {
          opacity: 0,
          scale: 0.25,
          x: offset.x,
          y: offset.y,
          filter: 'blur(3px)',
          duration: 0.35,
          delay: idx * 0.04,
          ease: 'power3.inOut'
        });
      });
    }
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (item) => {
    setSelectedItem(item.label);
    setIsOpen(false);
  };

  // Spacious radial arc positions with clean vertical separation (70px step, zero overlap)
  const positions = [
    { bottom: 372, left: -68, rotate: -16 }, // Learning
    { bottom: 302, left: -46, rotate: -12 }, // Document
    { bottom: 232, left: -26, rotate: -8 },  // Music
    { bottom: 162, left: -8,  rotate: -4 },  // Video
    { bottom: 92,  left: 8,   rotate: 0 }    // Image
  ];

  return (
    <div style={styles.stage} ref={containerRef}>
      {/* Background overlay */}
      {isOpen && (
        <div style={styles.backdrop} onClick={() => setIsOpen(false)} />
      )}

      {/* Selected Feedback Toast */}
      {selectedItem && !isOpen && (
        <div style={styles.badge}>
          Selected: <strong>{selectedItem}</strong>
        </div>
      )}

      <div style={styles.fabContainer}>
        {/* Radial Arc Menu Items */}
        {MENU_ITEMS.map((item, idx) => {
          const pos = positions[idx];
          return (
            <div
              key={item.id}
              ref={addToItemRefs}
              onClick={() => handleSelect(item)}
              style={{
                ...styles.pill,
                bottom: `${pos.bottom}px`,
                left: `${pos.left}px`,
                transform: `rotate(${pos.rotate}deg)`,
                pointerEvents: isOpen ? 'auto' : 'none',
                opacity: 1
              }}
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, { scale: 1.06, boxShadow: '0 16px 36px rgba(0,0,0,0.12)', duration: 0.2 });
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, { scale: 1, boxShadow: '0 10px 28px rgba(0,0,0,0.06)', duration: 0.2 });
              }}
            >
              <span style={styles.icon}>{item.icon}</span>
              <span style={styles.label}>{item.label}</span>
            </div>
          );
        })}

        {/* Main Floating Action Button (FAB) */}
        <button
          ref={fabRef}
          onClick={toggleMenu}
          style={styles.fab}
          aria-label={isOpen ? 'Close menu' : 'Open creation menu'}
        >
          <span ref={plusIconRef} style={styles.plusWrapper}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}

const styles = {
  stage: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    minHeight: '480px',
    background: 'transparent',
    overflow: 'visible',
    userSelect: 'none',
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
  },
  backdrop: {
    position: 'absolute',
    inset: 0,
    background: 'transparent',
    zIndex: 10
  },
  badge: {
    position: 'absolute',
    top: '20px',
    left: '24px',
    fontSize: '13px',
    color: '#475569',
    background: '#ffffff',
    padding: '6px 14px',
    borderRadius: '999px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    border: '1px solid rgba(0,0,0,0.04)',
    zIndex: 5
  },
  fabContainer: {
    position: 'absolute',
    bottom: '24px',
    right: '50%',
    transform: 'translateX(50%)',
    width: '64px',
    height: '64px',
    zIndex: 20
  },
  fab: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: '#ffffff',
    border: 'none',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    outline: 'none',
    position: 'relative',
    zIndex: 25,
    transition: 'box-shadow 0.25s ease'
  },
  plusWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px'
  },
  pill: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '11px 22px',
    borderRadius: '999px',
    background: '#ffffff',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.07), 0 2px 6px rgba(0, 0, 0, 0.03)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transformOrigin: 'center center',
    zIndex: 22,
    border: '1px solid rgba(0,0,0,0.04)'
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#0f172a'
  },
  label: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: '-0.01em'
  }
};
