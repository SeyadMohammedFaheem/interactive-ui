import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(CustomEase);
  try {
    CustomEase.create('markerBounceSmooth', 'M0,0 C0.16,1.38 0.3,1 1,1');
  } catch (e) {}
}

const MIN_VAL = 1;
const MAX_VAL = 100;
const STEP_WIDTH = 54; // pixels per integer (fits 7 numbers across ~378px)

const PointerBadge = () => (
  <div style={styles.pointerContainer}>
    {/* Soft Lavender Shield Badge */}
    <svg width="30" height="22" viewBox="0 0 30 22" fill="none">
      <path
        d="M 3 0 H 27 C 28.6 0 30 1.4 30 3 V 8 C 30 12.8 15 22 15 22 C 15 22 0 12.8 0 8 V 3 C 0 1.4 1.4 0 3 0 Z"
        fill="#cfd1e3"
      />
    </svg>
    {/* Downward Indicator Dot */}
    <div style={styles.pointerDot} />
  </div>
);

export default function RulerPickerMorph() {
  const [value, setValue] = useState(50);

  const isDragging = useRef(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const cardWidth = 378;

  const trackRef = useRef(null);

  // Center position offset calculation:
  // Center of card = 378 / 2 = 189px.
  // Item position for number V = (V - MIN_VAL) * STEP_WIDTH.
  // Center track offset for V = 189 - (V - MIN_VAL) * STEP_WIDTH.
  const getOffsetForValue = (val) => {
    return 189 - (val - MIN_VAL) * STEP_WIDTH;
  };

  const getValueFromOffset = (offset) => {
    const rawVal = MIN_VAL + (189 - offset) / STEP_WIDTH;
    return Math.max(MIN_VAL, Math.min(MAX_VAL, Math.round(rawVal)));
  };

  // Animate offset when value changes programmatically
  useEffect(() => {
    const targetOffset = getOffsetForValue(value);
    currentX.current = targetOffset;

    if (trackRef.current) {
      gsap.to(trackRef.current, {
        x: targetOffset,
        duration: 0.48,
        ease: 'markerBounceSmooth'
      });
    }
  }, [value]);

  // Pointer drag handlers
  const handlePointerDown = (e) => {
    isDragging.current = true;
    startX.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    if (trackRef.current) gsap.killTweensOf(trackRef.current);
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const delta = x - startX.current;
    startX.current = x;

    const minOffset = getOffsetForValue(MAX_VAL);
    const maxOffset = getOffsetForValue(MIN_VAL);

    currentX.current = Math.max(minOffset - 20, Math.min(maxOffset + 20, currentX.current + delta));

    if (trackRef.current) {
      gsap.set(trackRef.current, { x: currentX.current });
    }

    const currentVal = getValueFromOffset(currentX.current);
    if (currentVal !== value) {
      setValue(currentVal);
    }
  };

  const handlePointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const snappedVal = getValueFromOffset(currentX.current);
    const targetOffset = getOffsetForValue(snappedVal);
    currentX.current = targetOffset;
    setValue(snappedVal);

    if (trackRef.current) {
      gsap.to(trackRef.current, {
        x: targetOffset,
        duration: 0.48,
        ease: 'markerBounceSmooth'
      });
    }
  };

  // Generate range array
  const numbers = [];
  for (let i = MIN_VAL; i <= MAX_VAL; i++) {
    numbers.push(i);
  }

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Main Ruler Capsule Card */}
        <div style={styles.rulerCard}>
          {/* Top Lavender Pointer Marker (Straddles top edge) */}
          <PointerBadge />

          {/* Viewport container with rounded clipping */}
          <div
            style={styles.trackViewport}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
          >
            {/* Scrolling Track */}
            <div
              ref={trackRef}
              style={{
                ...styles.track,
                transform: `translateX(${getOffsetForValue(value)}px)`
              }}
            >
              {numbers.map((num) => {
                const isSelected = num === value;
                const dist = Math.abs(num - value);
                const opacity = dist === 0 ? 1 : dist === 1 ? 0.7 : dist === 2 ? 0.45 : dist === 3 ? 0.25 : 0.1;

                return (
                  <div
                    key={num}
                    style={{
                      ...styles.numItem,
                      left: `${(num - MIN_VAL) * STEP_WIDTH}px`
                    }}
                    onClick={() => setValue(num)}
                  >
                    {/* Number Label */}
                    <span
                      style={{
                        ...styles.numText,
                        color: isSelected ? '#000000' : '#71737c',
                        fontWeight: isSelected ? '700' : '500',
                        transform: isSelected ? 'scale(1.12)' : 'scale(0.96)',
                        opacity: opacity
                      }}
                    >
                      {num}
                    </span>

                    {/* Major Tall Tick Mark Under Number */}
                    <div style={styles.tickTall} />

                    {/* 7 Subdivision Ticks Between Integers */}
                    <div style={{ ...styles.tickShort, left: '6.75px' }} />
                    <div style={{ ...styles.tickShort, left: '13.5px' }} />
                    <div style={{ ...styles.tickShort, left: '20.25px' }} />
                    <div style={{ ...styles.tickMedium, left: '27px' }} />
                    <div style={{ ...styles.tickShort, left: '33.75px' }} />
                    <div style={{ ...styles.tickShort, left: '40.5px' }} />
                    <div style={{ ...styles.tickShort, left: '47.25px' }} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'auto',
    background: 'transparent',
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    userSelect: 'none',
    padding: '12px'
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  rulerCard: {
    position: 'relative',
    width: '378px',
    height: '88px',
    background: '#ffffff',
    borderRadius: '24px',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    boxShadow: '0 16px 36px -8px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.02)'
  },
  pointerContainer: {
    position: 'absolute',
    top: '-9px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    pointerEvents: 'none'
  },
  pointerDot: {
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    background: '#cfd1e3',
    marginTop: '3px'
  },
  trackViewport: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: '24px',
    overflow: 'hidden',
    cursor: 'grab'
  },
  track: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    willChange: 'transform'
  },
  numItem: {
    position: 'absolute',
    top: 0,
    width: '54px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: '22px',
    cursor: 'pointer'
  },
  numText: {
    fontSize: '27px',
    letterSpacing: '-0.02em',
    transition: 'color 0.2s ease, transform 0.2s ease, opacity 0.2s ease'
  },
  tickTall: {
    position: 'absolute',
    bottom: '0px',
    left: '0px',
    width: '2px',
    height: '24px',
    background: '#d1d4e2',
    borderRadius: '1px 1px 0 0'
  },
  tickMedium: {
    position: 'absolute',
    bottom: '0px',
    width: '1.6px',
    height: '16px',
    background: '#dadde8',
    borderRadius: '1px 1px 0 0'
  },
  tickShort: {
    position: 'absolute',
    bottom: '0px',
    width: '1.2px',
    height: '10px',
    background: '#e6e8f2',
    borderRadius: '1px 1px 0 0'
  }
};
