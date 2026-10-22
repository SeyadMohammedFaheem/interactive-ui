import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

const CHROMATIC_PALETTES = [
  { bg: '#e6f7f2', color: '#059669', name: 'Mint Green' },
  { bg: '#fde8ed', color: '#e11d48', name: 'Pastel Rose' },
  { bg: '#eef2ff', color: '#4f46e5', name: 'Pastel Indigo' },
  { bg: '#f4f8e8', color: '#65a30d', name: 'Pastel Lime' },
  { bg: '#fff2e6', color: '#ea580c', name: 'Pastel Peach' },
  { bg: '#f5f3ff', color: '#7c3aed', name: 'Pastel Purple' }
];

export default function ChromaticThinkingMorph() {
  const [isThinking, setIsThinking] = useState(false);
  const [paletteIdx, setPaletteIdx] = useState(0);

  const btnRef = useRef(null);
  const iconRef = useRef(null);
  const textRef = useRef(null);
  const timerRef = useRef(null);

  const rotateTweenRef = useRef(null);

  // Continuous rotation for thinking star icon
  useEffect(() => {
    if (isThinking && iconRef.current) {
      rotateTweenRef.current = gsap.to(iconRef.current, {
        rotation: 360,
        duration: 2.5,
        repeat: -1,
        ease: 'none'
      });
    } else {
      if (rotateTweenRef.current) {
        rotateTweenRef.current.kill();
        rotateTweenRef.current = null;
      }
      if (iconRef.current) {
        gsap.to(iconRef.current, { rotation: 0, duration: 0.3, ease: 'power2.out' });
      }
    }
    return () => {
      if (rotateTweenRef.current) {
        rotateTweenRef.current.kill();
      }
    };
  }, [isThinking]);

  // Cycle chromatic colors continuously when in thinking state
  useEffect(() => {
    if (isThinking) {
      timerRef.current = setInterval(() => {
        setPaletteIdx((prev) => (prev + 1) % CHROMATIC_PALETTES.length);
      }, 1200);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isThinking]);

  // Animate button container background and text/icon colors with GSAP
  useEffect(() => {
    const btnEl = btnRef.current;
    const iconEl = iconRef.current;
    const textEl = textRef.current;

    if (!btnEl) return;

    if (isThinking) {
      const currentPalette = CHROMATIC_PALETTES[paletteIdx];
      
      gsap.to(btnEl, {
        backgroundColor: currentPalette.bg,
        duration: 0.8,
        ease: 'power2.inOut'
      });

      gsap.to([iconEl, textEl], {
        color: currentPalette.color,
        fill: currentPalette.color,
        stroke: currentPalette.color,
        duration: 0.8,
        ease: 'power2.inOut'
      });
    } else {
      gsap.to(btnEl, {
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 16px -2px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.02)',
        duration: 0.5,
        ease: 'power2.out'
      });

      gsap.to([iconEl, textEl], {
        color: '#0f172a',
        fill: '#0f172a',
        stroke: '#0f172a',
        scale: 1,
        duration: 0.5,
        ease: 'power2.out'
      });
    }
  }, [isThinking, paletteIdx]);

  const toggleThinking = () => {
    const nextState = !isThinking;

    // Scale bounce on button click
    gsap.fromTo(
      btnRef.current,
      { scale: 0.94 },
      { scale: 1, duration: 0.35, ease: 'back.out(2.2)' }
    );

    // Text slide crossfade
    if (textRef.current) {
      gsap.fromTo(
        textRef.current,
        { y: nextState ? 6 : -6, opacity: 0.2 },
        { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }
      );
    }

    // Icon scale & rotation morph
    if (iconRef.current) {
      gsap.fromTo(
        iconRef.current,
        { scale: 0.4, rotation: nextState ? -45 : 45 },
        { scale: 1, rotation: 0, duration: 0.4, ease: 'back.out(2.4)' }
      );
    }

    setIsThinking(nextState);
  };

  return (
    <div style={styles.container}>
      <button
        ref={btnRef}
        style={styles.button}
        onClick={toggleThinking}
        title={isThinking ? 'Click to finish' : 'Click to generate'}
      >
        {/* Left Icon (Single 4-Point Star Icon) */}
        <span ref={iconRef} style={styles.iconWrapper}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C12 7.5 16.5 12 22 12C16.5 12 12 16.5 12 22C12 16.5 7.5 12 2 12C7.5 12 12 7.5 12 2Z"></path>
          </svg>
        </span>

        {/* Dynamic Text Label */}
        <span ref={textRef} style={styles.textLabel}>
          {isThinking ? 'Thinking' : 'Generate'}
        </span>
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 'auto',
    background: 'transparent',
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    userSelect: 'none',
    padding: '24px 0'
  },
  button: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 28px',
    borderRadius: '999px',
    background: '#ffffff',
    border: '1px solid rgba(0, 0, 0, 0.04)',
    boxShadow: '0 4px 16px -2px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.02)',
    cursor: 'pointer',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'box-shadow 0.25s ease, transform 0.15s ease'
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#0f172a',
    transition: 'transform 0.2s ease'
  },
  textLabel: {
    fontSize: '16.5px',
    fontWeight: '600',
    color: '#0f172a',
    letterSpacing: '-0.01em',
    lineHeight: 1
  }
};
