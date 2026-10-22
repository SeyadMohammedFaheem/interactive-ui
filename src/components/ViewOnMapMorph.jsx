import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(CustomEase);
  try {
    CustomEase.create('markerBounceSmooth', 'M0,0 C0.16,1.38 0.3,1 1,1');
  } catch (e) {}
}

export default function ViewOnMapMorph() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const widgetRef = useRef(null);
  const pillContentRef = useRef(null);
  const mapContentRef = useRef(null);
  const mapImageRef = useRef(null);
  const closeBtnRef = useRef(null);
  const morphTlRef = useRef(null);

  // Pan tracking state refs
  const panOffset = useRef({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });
  const isPointerDown = useRef(false);

  // Max pan boundaries (since image is scaled to 160% of container)
  const MAX_PAN = 90;

  useEffect(() => {
    // Shared-element pill-to-square morph timeline
    const tl = gsap.timeline({
      paused: true,
      onStart: () => {
        setIsExpanded(true);
      },
      onReverseComplete: () => {
        setIsExpanded(false);
        // Reset pan position back to center on collapse
        panOffset.current = { x: 0, y: 0 };
        if (mapImageRef.current) {
          gsap.set(mapImageRef.current, { x: 0, y: 0 });
        }
      }
    });

    // 1. Continuous pill to square container morph:
    // From sleek pill (224px x 58px, radius 999px) -> Square map card (340px x 340px, radius 38px)
    tl.to(
      widgetRef.current,
      {
        width: 340,
        height: 340,
        borderRadius: 38,
        boxShadow: 'none',
        duration: 0.48,
        ease: 'markerBounceSmooth'
      },
      0
    );

    // 2. Pill label & icon fade out smoothly
    tl.to(
      pillContentRef.current,
      {
        opacity: 0,
        scale: 0.88,
        duration: 0.14,
        ease: 'power2.in'
      },
      0
    );

    // 3. Map layer zooms smoothly into place inside the morphing container
    tl.fromTo(
      mapContentRef.current,
      {
        opacity: 0,
        scale: 1.08,
        pointerEvents: 'none'
      },
      {
        opacity: 1,
        scale: 1.0,
        pointerEvents: 'auto',
        duration: 0.48,
        ease: 'markerBounceSmooth'
      },
      0.03
    );

    // 4. White circular close button pops in at top-right
    if (closeBtnRef.current) {
      tl.fromTo(
        closeBtnRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.32, ease: 'back.out(2)' },
        0.16
      );
    }

    morphTlRef.current = tl;

    return () => tl.kill();
  }, []);

  // Pointer drag panning handlers
  const handlePointerDown = (e) => {
    if (!isExpanded) return;
    if (e.target.closest('button')) return; // Don't trigger drag when clicking close button

    isPointerDown.current = true;
    setIsDragging(true);
    startPos.current = {
      x: e.clientX - panOffset.current.x,
      y: e.clientY - panOffset.current.y
    };
    e.target.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isPointerDown.current || !mapImageRef.current) return;

    let newX = e.clientX - startPos.current.x;
    let newY = e.clientY - startPos.current.y;

    // Clamp pan movement to keep map background visible
    newX = Math.max(-MAX_PAN, Math.min(MAX_PAN, newX));
    newY = Math.max(-MAX_PAN, Math.min(MAX_PAN, newY));

    panOffset.current = { x: newX, y: newY };

    gsap.to(mapImageRef.current, {
      x: newX,
      y: newY,
      duration: 0.1,
      ease: 'power1.out',
      overwrite: 'auto'
    });
  };

  const handlePointerUp = (e) => {
    if (!isPointerDown.current) return;
    isPointerDown.current = false;
    setIsDragging(false);
    e.target.releasePointerCapture?.(e.pointerId);
  };

  const handleExpand = () => {
    if (!isExpanded && morphTlRef.current) {
      morphTlRef.current.timeScale(1.0).play();
    }
  };

  const handleCollapse = (e) => {
    if (e) e.stopPropagation();
    if (morphTlRef.current) {
      morphTlRef.current.timeScale(1.2).reverse();
    }
  };

  return (
    <div style={styles.container}>
      {/* Dimmed backdrop when card is expanded */}
      <div
        style={{
          ...styles.backdrop,
          opacity: isExpanded ? 1 : 0,
          pointerEvents: isExpanded ? 'auto' : 'none'
        }}
        onClick={handleCollapse}
      />

      {/* Main Continuous Shared-Element Morphing Card */}
      <div
        ref={widgetRef}
        style={{
          ...styles.widget,
          cursor: isExpanded ? (isDragging ? 'grabbing' : 'grab') : 'pointer'
        }}
        onClick={!isExpanded ? handleExpand : undefined}
      >
        {/* MAP LAYER WITH SMOOTH DRAG PANNING */}
        <div
          ref={mapContentRef}
          style={styles.mapContent}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <img
            ref={mapImageRef}
            src="/images/map_bg.png"
            alt="Bayside Map"
            style={styles.mapImage}
            draggable={false}
          />

          {/* Floating White Circular Close (✕) Button */}
          <button
            ref={closeBtnRef}
            style={styles.closeBtn}
            onClick={handleCollapse}
            title="Close"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="3" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* COLLAPSED PILL CONTENT (Matches User Screenshot 1:1) */}
        <div ref={pillContentRef} style={styles.pillContent}>
          {/* Exact 3-Panel Folded Map Icon */}
          <svg width="22" height="20" viewBox="0 0 24 22" fill="none" style={styles.pillIcon}>
            <path
              d="M2.5 5.5C2.5 4.7 3.2 4.1 4 4.4L8 5.8V19.4L3.6 17.8C2.9 17.5 2.5 16.9 2.5 16.1V5.5Z"
              fill="#4a4e5a"
            />
            <path
              d="M9.2 6.1L14.8 3.8V17.4L9.2 19.7V6.1Z"
              fill="#3e424e"
            />
            <path
              d="M16 3.8L20 5C20.8 5.3 21.5 6 21.5 6.8V17.4C21.5 18.2 20.8 18.8 20 18.5L16 17.4V3.8Z"
              fill="#525666"
            />
          </svg>
          <span style={styles.pillLabel}>View on Map</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    userSelect: 'none',
    overflow: 'hidden',
    borderRadius: '28px'
  },
  backdrop: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.12)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    transition: 'opacity 0.28s ease',
    borderRadius: '28px',
    zIndex: 10
  },
  // Master Morphing Shape: Starts as exact pill -> Expands to square map card (340px x 340px)
  widget: {
    position: 'relative',
    zIndex: 20,
    width: '224px',
    height: '56px',
    borderRadius: '999px',
    background: '#ffffff',
    border: '1px solid rgba(0, 0, 0, 0.04)',
    boxShadow: '0 4px 14px -2px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.02)',
    overflow: 'hidden',
    transformOrigin: 'center center',
    transform: 'translateZ(0)',
    cursor: 'pointer',
    willChange: 'width, height, border-radius, box-shadow'
  },
  pillContent: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '0 22px',
    background: '#ffffff',
    borderRadius: '999px',
    zIndex: 5,
    pointerEvents: 'none',
    willChange: 'opacity, transform'
  },
  pillIcon: {
    flexShrink: 0
  },
  pillLabel: {
    fontSize: '17px',
    fontWeight: '600',
    color: '#1c1f26',
    letterSpacing: '-0.015em',
    whiteSpace: 'nowrap'
  },
  mapContent: {
    position: 'absolute',
    inset: 0,
    opacity: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
    borderRadius: 'inherit',
    transformOrigin: 'center center',
    willChange: 'opacity, transform',
    touchAction: 'none'
  },
  // Larger map image scaled so panning is smooth without showing blank edges
  mapImage: {
    position: 'absolute',
    top: '-30%',
    left: '-30%',
    width: '160%',
    height: '160%',
    objectFit: 'cover',
    objectPosition: 'center',
    display: 'block',
    userSelect: 'none',
    pointerEvents: 'none'
  },
  closeBtn: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: '#ffffff',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.16)',
    zIndex: 50
  }
};
