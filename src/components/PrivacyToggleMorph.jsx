import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(CustomEase);
  try {
    CustomEase.create('markerBounceSmooth', 'M0,0 C0.16,1.38 0.3,1 1,1');
  } catch (e) {}
}

// Crisp solid Apple-style lock icon matching reference photo
const LockIcon = ({ color = '#000000' }) => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill={color}>
    <path d="M12 2C9.24 2 7 4.24 7 7V10H6C4.9 10 4 10.9 4 12V19C4 20.1 4.9 21 6 21H18C19.1 21 20 20.1 20 19V12C20 10.9 19.1 10 18 10H17V7C17 4.24 14.76 2 12 2ZM9 7C9 5.34 10.34 4 12 4C13.66 4 15 5.34 15 7V10H9V7Z" />
  </svg>
);

const GlobeIcon = ({ color = '#7c7c82' }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <line x1="3.6" y1="9" x2="20.4" y2="9" />
    <line x1="3.6" y1="15" x2="20.4" y2="15" />
    <path d="M11.5 3a17 17 0 0 0 0 18M12.5 3a17 17 0 0 1 0 18" />
  </svg>
);

const ChevronIcon = ({ color = '#7c7c82' }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export default function PrivacyToggleMorph() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [privacyMode, setPrivacyMode] = useState('private'); // 'private' | 'public'

  const containerRef = useRef(null);
  const triggerBtnRef = useRef(null);
  const popoverRef = useRef(null);
  const sliderPillRef = useRef(null);
  const chevronRef = useRef(null);

  // Animate slider pill when privacyMode changes
  useEffect(() => {
    if (!sliderPillRef.current) return;
    const targetLeft = privacyMode === 'private' ? 5 : 141;

    gsap.to(sliderPillRef.current, {
      left: targetLeft,
      duration: 0.38,
      ease: 'markerBounceSmooth',
      overwrite: 'auto'
    });
  }, [privacyMode]);

  // Animate popover expand / collapse
  useEffect(() => {
    if (!popoverRef.current || !chevronRef.current) return;

    if (isExpanded) {
      // Rotate chevron 180deg
      gsap.to(chevronRef.current, {
        rotation: 180,
        duration: 0.32,
        ease: 'power2.out'
      });

      // Pop in outer bubble with bouncy spring
      gsap.fromTo(
        popoverRef.current,
        { opacity: 0, y: 16, scale: 0.84 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.48,
          ease: 'markerBounceSmooth',
          overwrite: 'auto'
        }
      );
    } else {
      // Rotate chevron back
      gsap.to(chevronRef.current, {
        rotation: 0,
        duration: 0.28,
        ease: 'power2.out'
      });

      // Collapse bubble
      gsap.to(popoverRef.current, {
        opacity: 0,
        y: 12,
        scale: 0.88,
        duration: 0.22,
        ease: 'power2.in',
        overwrite: 'auto'
      });
    }
  }, [isExpanded]);

  const handleSelectMode = (mode) => {
    setPrivacyMode(mode);
    setTimeout(() => {
      setIsExpanded(false);
    }, 280);
  };

  return (
    <div style={styles.container}>
      {/* Click-away Backdrop */}
      {isExpanded && (
        <div style={styles.backdrop} onClick={() => setIsExpanded(false)} />
      )}

      <div ref={containerRef} style={styles.wrapper}>
        {/* Floating Popover Speech Bubble Bar */}
        <div
          ref={popoverRef}
          style={{
            ...styles.popoverBar,
            pointerEvents: isExpanded ? 'auto' : 'none',
            opacity: isExpanded ? 1 : 0
          }}
        >
          {/* Active White Slider Card */}
          <div ref={sliderPillRef} style={styles.sliderPill} />

          {/* Private Option Button */}
          <button
            style={{
              ...styles.optionBtn,
              color: privacyMode === 'private' ? '#000000' : '#7c7c82',
              fontWeight: privacyMode === 'private' ? '700' : '600'
            }}
            onClick={() => handleSelectMode('private')}
          >
            <LockIcon color={privacyMode === 'private' ? '#000000' : '#7c7c82'} />
            <span>Private</span>
          </button>

          {/* Public Option Button */}
          <button
            style={{
              ...styles.optionBtn,
              color: privacyMode === 'public' ? '#000000' : '#7c7c82',
              fontWeight: privacyMode === 'public' ? '700' : '600'
            }}
            onClick={() => handleSelectMode('public')}
          >
            <GlobeIcon color={privacyMode === 'public' ? '#000000' : '#7c7c82'} />
            <span>Public</span>
          </button>

          {/* Downward Speech Bubble Pointer Tail */}
          <div style={styles.tailArrow} />
        </div>

        {/* Bottom Trigger Pill Button */}
        <button
          ref={triggerBtnRef}
          style={styles.triggerBtn}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span style={styles.triggerIcon}>
            {privacyMode === 'private' ? (
              <LockIcon color="#7c7c82" />
            ) : (
              <GlobeIcon color="#7c7c82" />
            )}
          </span>
          <span style={styles.triggerLabel}>
            {privacyMode === 'private' ? 'Private' : 'Public'}
          </span>
          <span ref={chevronRef} style={styles.chevronWrapper}>
            <ChevronIcon color="#7c7c82" />
          </span>
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'auto',
    background: 'transparent',
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    userSelect: 'none'
  },
  backdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 10,
    background: 'transparent'
  },
  wrapper: {
    position: 'relative',
    zIndex: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  popoverBar: {
    position: 'absolute',
    bottom: '72px',
    width: '280px',
    height: '56px',
    background: '#ffffff',
    borderRadius: '999px',
    padding: '5px',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.10), 0 2px 8px -2px rgba(0, 0, 0, 0.04)',
    border: '1px solid rgba(0, 0, 0, 0.04)',
    transformOrigin: 'bottom center'
  },
  sliderPill: {
    position: 'absolute',
    top: '5px',
    left: '5px',
    width: '134px',
    height: '46px',
    background: '#f4f4f5',
    borderRadius: '999px',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.06)',
    zIndex: 1
  },
  optionBtn: {
    position: 'relative',
    zIndex: 2,
    flex: 1,
    height: '46px',
    border: 'none',
    background: 'transparent',
    outline: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '17px',
    letterSpacing: '-0.015em',
    transition: 'color 0.2s ease'
  },
  tailArrow: {
    position: 'absolute',
    bottom: '-6px',
    left: '50%',
    transform: 'translateX(-50%) rotate(45deg)',
    width: '12px',
    height: '12px',
    background: '#ffffff',
    borderRight: '1px solid rgba(0, 0, 0, 0.04)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
    borderRadius: '2px',
    zIndex: 0
  },
  triggerBtn: {
    height: '52px',
    padding: '0 24px',
    background: '#ffffff',
    borderRadius: '999px',
    border: '1px solid rgba(0, 0, 0, 0.04)',
    boxShadow: '0 4px 14px -2px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.02)',
    outline: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'transform 0.15s ease, box-shadow 0.2s ease'
  },
  triggerIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  triggerLabel: {
    fontSize: '17px',
    fontWeight: '600',
    color: '#18181b',
    letterSpacing: '-0.015em'
  },
  chevronWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '2px'
  }
};
