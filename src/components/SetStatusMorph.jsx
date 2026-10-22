import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(CustomEase);
  try {
    CustomEase.create('fluidSpring', 'M0,0 C0.16,1.38 0.3,1 1,1');
  } catch (e) {}
}

const STATUSES = [
  { id: 'vacation', image: '/images/status_palm.png', label: 'On Vacation' },
  { id: 'sick', image: '/images/status_sick.png', label: 'Feeling Sick' },
  { id: 'meeting', image: '/images/status_calendar.png', label: 'In a Meeting' },
  { id: 'exercising', image: '/images/status_sneaker.png', label: 'Be Right Back' },
  { id: 'commuting', image: '/images/status_bus.png', label: 'Commuting' },
  { id: 'more', label: 'More Options', isMore: true }
];

export default function SetStatusMorph() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredStatus, setHoveredStatus] = useState(STATUSES[1]); // Feeling Sick
  const [selectedStatus, setSelectedStatus] = useState(null);

  const triggerBtnRef = useRef(null);
  const popupBarRef = useRef(null);
  const tooltipRef = useRef(null);
  const itemRefs = useRef({});

  const updateTooltipPosition = (status) => {
    setHoveredStatus(status);

    const targetEl = itemRefs.current[status.id];
    const popupEl = popupBarRef.current;
    const tooltipEl = tooltipRef.current;

    if (targetEl && popupEl && tooltipEl) {
      const targetRect = targetEl.getBoundingClientRect();
      const popupRect = popupEl.getBoundingClientRect();
      const centerX = targetRect.left + targetRect.width / 2 - popupRect.left;

      gsap.to(tooltipEl, {
        left: centerX,
        duration: 0.26,
        ease: 'fluidSpring',
        overwrite: 'auto'
      });
    }
  };

  useEffect(() => {
    if (!popupBarRef.current) return;

    if (isExpanded) {
      gsap.fromTo(
        popupBarRef.current,
        { opacity: 0, y: 24, scale: 0.82 },
        { opacity: 1, y: 0, scale: 1, duration: 0.48, ease: 'fluidSpring', overwrite: 'auto' }
      );

      const circles = Object.values(itemRefs.current).filter(Boolean);
      if (circles.length) {
        gsap.fromTo(
          circles,
          { opacity: 0, y: 20, scale: 0.65 },
          { opacity: 1, y: 0, scale: 1, duration: 0.48, ease: 'fluidSpring', stagger: 0.035, delay: 0.03, overwrite: 'auto' }
        );
      }

      if (tooltipRef.current) {
        gsap.fromTo(
          tooltipRef.current,
          { opacity: 0, y: 18, scale: 0.75 },
          { opacity: 1, y: 0, scale: 1, duration: 0.48, ease: 'fluidSpring', delay: 0.1, overwrite: 'auto' }
        );
      }

      setTimeout(() => {
        updateTooltipPosition(STATUSES[1]);
      }, 50);
    } else {
      gsap.to(popupBarRef.current, {
        opacity: 0,
        y: 12,
        scale: 0.85,
        duration: 0.2,
        ease: 'power2.in',
        overwrite: 'auto'
      });
    }
  }, [isExpanded]);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSelectStatus = (status) => {
    if (status.isMore) return;
    setSelectedStatus(status);

    if (triggerBtnRef.current) {
      gsap.fromTo(
        triggerBtnRef.current,
        { scale: 0.9 },
        { scale: 1, duration: 0.4, ease: 'back.out(2)' }
      );
    }

    setIsExpanded(false);
  };

  const handleClearStatus = (e) => {
    e.stopPropagation();
    setSelectedStatus(null);
  };

  return (
    <div style={styles.viewportWrapper}>
      {isExpanded && (
        <div style={styles.backdrop} onClick={() => setIsExpanded(false)} />
      )}

      <div style={styles.componentStack}>
        {/* EXPANDED POPUP BAR & TOOLTIP */}
        <div
          ref={popupBarRef}
          style={{
            ...styles.popupBarWrapper,
            pointerEvents: isExpanded ? 'auto' : 'none'
          }}
        >
          {/* Speech Bubble Tooltip */}
          <div ref={tooltipRef} style={styles.tooltipBubble}>
            <span>{hoveredStatus ? hoveredStatus.label : 'Feeling Sick'}</span>
            <div style={styles.tooltipTail} />
          </div>

          {/* Emoji Capsule Bar */}
          <div style={styles.emojiCapsule}>
            {STATUSES.map((status) => (
              <button
                key={status.id}
                ref={(el) => (itemRefs.current[status.id] = el)}
                style={styles.emojiCircle}
                onMouseEnter={() => updateTooltipPosition(status)}
                onClick={() => handleSelectStatus(status)}
              >
                {status.isMore ? (
                  <span style={styles.moreDots}>•••</span>
                ) : (
                  <img
                    src={status.image}
                    alt={status.label}
                    style={styles.pngIcon}
                    draggable="false"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN TRIGGER BUTTON: "Set Status" Pill */}
        <button
          ref={triggerBtnRef}
          style={{
            ...styles.setStatusBtn,
            background: '#ffffff',
            border: selectedStatus ? '1.5px solid #e2e8f0' : '1px solid rgba(0, 0, 0, 0.04)',
            boxShadow: '0 4px 14px -2px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.02)'
          }}
          onClick={handleToggle}
        >
          {selectedStatus ? (
            <>
              <img
                src={selectedStatus.image}
                alt={selectedStatus.label}
                style={styles.pngIconSmall}
                draggable="false"
              />
              <span style={styles.btnLabel}>{selectedStatus.label}</span>
              <span
                style={styles.clearIcon}
                onClick={handleClearStatus}
                title="Clear Status"
              >
                ✕
              </span>
            </>
          ) : (
            <>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={styles.statusSvg}>
                <circle cx="12" cy="12" r="3.5" fill="#8e92a2" />
                <circle
                  cx="12"
                  cy="12"
                  r="8.5"
                  stroke="#8e92a2"
                  strokeWidth="2.2"
                  strokeDasharray="3.8 3.2"
                  strokeLinecap="round"
                />
              </svg>
              <span style={styles.btnLabel}>Set Status</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

const styles = {
  viewportWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'auto',
    background: 'transparent',
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    userSelect: 'none',
    overflow: 'hidden'
  },
  backdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 10
  },
  componentStack: {
    position: 'relative',
    zIndex: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '14px'
  },
  popupBarWrapper: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    opacity: 0,
    transformOrigin: 'center bottom'
  },
  tooltipBubble: {
    position: 'absolute',
    top: '-52px',
    transform: 'translateX(-50%)',
    background: '#ffffff',
    color: '#18181b',
    padding: '8px 18px',
    borderRadius: '20px',
    fontSize: '14.5px',
    fontWeight: '600',
    letterSpacing: '-0.015em',
    whiteSpace: 'nowrap',
    boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.10), 0 2px 6px -2px rgba(0, 0, 0, 0.04)',
    border: '1px solid rgba(0, 0, 0, 0.04)',
    pointerEvents: 'none',
    zIndex: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transformOrigin: 'center bottom'
  },
  tooltipTail: {
    position: 'absolute',
    bottom: '-6px',
    left: '50%',
    transform: 'translateX(-50%) rotate(45deg)',
    width: '10px',
    height: '10px',
    background: '#ffffff',
    borderRight: '1px solid rgba(0, 0, 0, 0.04)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
    borderRadius: '2px'
  },
  emojiCapsule: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '7px 9px',
    background: '#ffffff',
    borderRadius: '999px',
    border: '1.5px solid #edeef4',
    boxShadow: '0 12px 36px -4px rgba(0, 0, 0, 0.07), 0 4px 12px rgba(0, 0, 0, 0.02)'
  },
  emojiCircle: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: '#f4f5f9',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.25s cubic-bezier(0.16, 1.38, 0.3, 1)',
    transformOrigin: 'center center',
    overflow: 'hidden'
  },
  pngIcon: {
    width: '34px',
    height: '34px',
    objectFit: 'contain',
    borderRadius: '50%',
    mixBlendMode: 'multiply',
    pointerEvents: 'none'
  },
  pngIconSmall: {
    width: '28px',
    height: '28px',
    objectFit: 'contain',
    borderRadius: '50%',
    mixBlendMode: 'multiply',
    pointerEvents: 'none'
  },
  moreDots: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#8e92a2',
    letterSpacing: '1px'
  },
  setStatusBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '0 28px',
    height: '56px',
    borderRadius: '999px',
    cursor: 'pointer',
    outline: 'none',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
    transition: 'all 0.35s cubic-bezier(0.16, 1.38, 0.3, 1)'
  },
  statusSvg: {
    flexShrink: 0
  },
  btnLabel: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: '-0.02em',
    whiteSpace: 'nowrap'
  },
  clearIcon: {
    fontSize: '13px',
    fontWeight: '800',
    color: '#94a3b8',
    marginLeft: '6px',
    padding: '4px',
    cursor: 'pointer'
  }
};
