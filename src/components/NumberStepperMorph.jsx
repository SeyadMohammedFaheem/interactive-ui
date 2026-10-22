import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';

export default function NumberStepperMorph() {
  const [value, setValue] = useState(110);
  const [activeBtn, setActiveBtn] = useState(null); // 'minus' | 'plus' | null
  const numberRef = useRef(null);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const dragStartX = useRef(null);
  const dragStartVal = useRef(110);

  // Clear any active hold timers
  const stopAutoHold = () => {
    setActiveBtn(null);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    return () => stopAutoHold();
  }, []);

  const animateNumber = (direction = 1) => {
    if (numberRef.current) {
      gsap.fromTo(
        numberRef.current,
        {
          y: direction > 0 ? 6 : -6,
          scale: 1.14,
          opacity: 0.7
        },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 0.22,
          ease: 'back.out(2)'
        }
      );
    }
  };

  const increment = () => {
    setValue((prev) => {
      const next = prev + 1;
      animateNumber(1);
      return next;
    });
  };

  const decrement = () => {
    setValue((prev) => {
      const next = Math.max(0, prev - 1);
      animateNumber(-1);
      return next;
    });
  };

  const handleStartHold = (type) => {
    setActiveBtn(type);
    if (type === 'plus') increment();
    else decrement();

    timeoutRef.current = setTimeout(() => {
      let speed = 90;
      intervalRef.current = setInterval(() => {
        if (type === 'plus') {
          setValue((p) => p + 1);
          animateNumber(1);
        } else {
          setValue((p) => Math.max(0, p - 1));
          animateNumber(-1);
        }
      }, speed);
    }, 350);
  };

  // Horizontal touch/mouse scrub on the number
  const handlePointerDown = (e) => {
    dragStartX.current = e.clientX;
    dragStartVal.current = value;
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handlePointerMove = (e) => {
    if (dragStartX.current === null) return;
    const deltaX = e.clientX - dragStartX.current;
    const stepDelta = Math.round(deltaX / 10);
    const newVal = Math.max(0, dragStartVal.current + stepDelta);
    if (newVal !== value) {
      setValue(newVal);
      animateNumber(deltaX > 0 ? 1 : -1);
    }
  };

  const handlePointerUp = () => {
    dragStartX.current = null;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  };

  return (
    <div style={styles.container}>
      {/* Main Pill Wrapper */}
      <div style={styles.stepperPill}>
        {/* Decrement Button (-) */}
        <button
          style={{
            ...styles.stepperBtn,
            ...(activeBtn === 'minus' ? styles.stepperBtnActive : {})
          }}
          onPointerDown={() => handleStartHold('minus')}
          onPointerUp={stopAutoHold}
          onPointerLeave={stopAutoHold}
          title="Decrease number (hold to fast-scrub)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        {/* Center Number Display (Scrubbable) */}
        <div
          style={styles.numberWrapper}
          onPointerDown={handlePointerDown}
          title="Drag horizontally or use buttons to adjust"
        >
          <span ref={numberRef} style={styles.numberText}>
            {value}
          </span>
        </div>

        {/* Increment Button (+) */}
        <button
          style={{
            ...styles.stepperBtn,
            ...(activeBtn === 'plus' ? styles.stepperBtnActive : {})
          }}
          onPointerDown={() => handleStartHold('plus')}
          onPointerUp={stopAutoHold}
          onPointerLeave={stopAutoHold}
          title="Increase number (hold to fast-scrub)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 'auto',
    background: 'transparent',
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    userSelect: 'none',
    padding: '24px'
  },
  stepperPill: {
    display: 'inline-flex',
    alignItems: 'center',
    background: '#ffffff',
    borderRadius: '26px',
    padding: '7px 8px',
    boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.03)',
    gap: '4px'
  },
  stepperBtn: {
    width: '54px',
    height: '54px',
    borderRadius: '18px',
    background: '#f0f0f2',
    border: '2px solid transparent',
    color: '#18181b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    outline: 'none',
    padding: 0,
    transition: 'all 0.15s cubic-bezier(0.16, 1.4, 0.3, 1)',
    boxSizing: 'border-box'
  },
  stepperBtnActive: {
    background: '#ffffff',
    borderColor: '#2563eb',
    color: '#2563eb',
    transform: 'scale(0.94)',
    boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.15)'
  },
  numberWrapper: {
    minWidth: '80px',
    padding: '0 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'ew-resize'
  },
  numberText: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#18181b',
    letterSpacing: '-0.02em',
    display: 'inline-block',
    willChange: 'transform, opacity'
  }
};
