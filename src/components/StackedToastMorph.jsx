import React, { useState, useRef } from 'react';

const INITIAL_TOASTS = [
  {
    id: 't1',
    type: 'success',
    title: 'brand-kit.zip uploaded',
    subtitle: 'Saved to Launch week.',
    icon: 'check',
    hasAction: false
  },
  {
    id: 't2',
    type: 'info',
    title: 'Kai joined your bench',
    subtitle: 'They can comment and copy.',
    icon: 'info',
    hasAction: false
  },
  {
    id: 't3',
    type: 'error',
    title: 'Payment declined',
    subtitle: 'Try another card.',
    icon: 'error',
    hasAction: true,
    actionLabel: 'Retry'
  }
];

export default function StackedToastMorph() {
  const [toasts, setToasts] = useState(INITIAL_TOASTS);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retrySuccess, setRetrySuccess] = useState(false);

  // Sound effects
  const playPopSound = (freq = 400) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.11);
    } catch (e) {}
  };

  const handleDismiss = (e, id) => {
    e.stopPropagation();
    playPopSound(300);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleRetry = (e) => {
    e.stopPropagation();
    if (isRetrying || retrySuccess) return;
    setIsRetrying(true);
    playPopSound(520);

    setTimeout(() => {
      setIsRetrying(false);
      setRetrySuccess(true);
      playPopSound(660);

      // Mutate third toast to success state
      setToasts((prev) =>
        prev.map((t) =>
          t.id === 't3'
            ? {
                ...t,
                type: 'success',
                title: 'Payment approved',
                subtitle: 'Visa ending in 4242 charged.',
                icon: 'check',
                hasAction: false
              }
            : t
        )
      );
    }, 1100);
  };

  const resetToasts = (e) => {
    e.stopPropagation();
    setToasts(INITIAL_TOASTS);
    setRetrySuccess(false);
    setIsRetrying(false);
    playPopSound(450);
  };

  const toggleExpand = () => {
    playPopSound(isExpanded ? 360 : 480);
    setIsExpanded((prev) => !prev);
  };

  const renderIcon = (type) => {
    if (type === 'success') {
      return (
        <div style={{ ...styles.iconBadge, color: '#10b981' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12l2.5 2.5L16 9" />
          </svg>
        </div>
      );
    }
    if (type === 'info') {
      return (
        <div style={{ ...styles.iconBadge, color: '#6b7280' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" strokeWidth="3" />
          </svg>
        </div>
      );
    }
    return (
      <div style={{ ...styles.iconBadge, color: '#ef4444' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </div>
    );
  };

  return (
    <div style={styles.stage} onClick={() => isExpanded && setIsExpanded(false)}>
      {/* Toast Stack / List Container */}
      <div
        style={styles.toastContainer}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        onClick={(e) => {
          e.stopPropagation();
          toggleExpand();
        }}
      >
        {toasts.length === 0 ? (
          <button style={styles.resetBtn} onClick={resetToasts}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <span>Restore Toasts</span>
          </button>
        ) : (
          toasts.map((toast, index) => {
            // In collapsed mode, the last item (Payment declined) is on top / in front
            // items earlier in array are stacked behind it with offset
            const reverseIndex = toasts.length - 1 - index;
            const isFront = reverseIndex === 0;

            let translateY = 0;
            let scale = 1;
            let opacity = 1;
            let zIndex = toasts.length - reverseIndex;
            let pointerEvents = 'auto';

            if (isExpanded) {
              // Expanded vertical list mode
              translateY = index * 76;
              scale = 1;
              opacity = 1;
              zIndex = index + 1;
            } else {
              // Collapsed stack mode (matching Image 1)
              // Peek above the front card:
              translateY = -reverseIndex * 9;
              scale = 1 - reverseIndex * 0.045;
              opacity = reverseIndex > 2 ? 0 : 1 - reverseIndex * 0.12;
              zIndex = 10 - reverseIndex;
              if (!isFront) {
                pointerEvents = 'none';
              }
            }

            return (
              <div
                key={toast.id}
                style={{
                  ...styles.toastCard,
                  transform: `translateY(${translateY}px) scale(${scale})`,
                  opacity,
                  zIndex,
                  pointerEvents,
                  boxShadow: isExpanded
                    ? '0 6px 18px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)'
                    : isFront
                    ? '0 12px 28px -4px rgba(0, 0, 0, 0.12), 0 4px 10px -2px rgba(0, 0, 0, 0.06)'
                    : '0 4px 14px -3px rgba(0, 0, 0, 0.06)'
                }}
              >
                {/* Left Icon */}
                {renderIcon(toast.type)}

                {/* Content */}
                <div style={styles.toastBody}>
                  <div style={styles.toastTitle}>{toast.title}</div>
                  <div style={styles.toastSubtitle}>{toast.subtitle}</div>
                </div>

                {/* Action Button (e.g. Retry) */}
                {toast.hasAction && (
                  <button
                    style={{
                      ...styles.actionBtn,
                      opacity: isRetrying ? 0.7 : 1
                    }}
                    onClick={handleRetry}
                    disabled={isRetrying}
                  >
                    {isRetrying ? (
                      <span style={styles.spinner} />
                    ) : (
                      toast.actionLabel
                    )}
                  </button>
                )}

                {/* Dismiss Button */}
                <button
                  style={styles.closeBtn}
                  onClick={(e) => handleDismiss(e, toast.id)}
                  title="Dismiss notification"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Interactive Helper Hint */}
      <div style={styles.hintBar}>
        <span style={styles.hintDot} />
        <span>{isExpanded ? 'Click or hover out to collapse' : 'Hover or tap to expand stack'}</span>
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
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    position: 'relative',
    userSelect: 'none',
    boxSizing: 'border-box',
    padding: '30px 20px'
  },
  toastContainer: {
    position: 'relative',
    width: '360px',
    maxWidth: '92vw',
    height: '240px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  toastCard: {
    position: 'absolute',
    top: '30px',
    left: 0,
    width: '100%',
    background: '#ffffff',
    borderRadius: '24px',
    padding: '14px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    boxSizing: 'border-box',
    border: '1px solid rgba(0, 0, 0, 0.04)',
    transition: 'transform 0.42s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.32s ease, box-shadow 0.32s ease',
    willChange: 'transform, opacity, box-shadow'
  },
  iconBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  toastBody: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    overflow: 'hidden'
  },
  toastTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#18181b',
    letterSpacing: '-0.015em',
    lineHeight: 1.25,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  },
  toastSubtitle: {
    fontSize: '13px',
    fontWeight: '400',
    color: '#6b7280',
    letterSpacing: '-0.01em',
    lineHeight: 1.25,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  },
  actionBtn: {
    background: '#f4f4f5',
    color: '#18181b',
    border: 'none',
    borderRadius: '999px',
    padding: '6px 14px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.16s ease'
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#9ca3af',
    padding: '4px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'color 0.16s ease'
  },
  resetBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#ffffff',
    color: '#18181b',
    border: '1px solid #e4e4e7',
    padding: '10px 20px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.18s ease'
  },
  hintBar: {
    position: 'absolute',
    bottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#9ca3af',
    letterSpacing: '0.01em',
    pointerEvents: 'none'
  },
  hintDot: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    background: '#a1a1aa'
  },
  spinner: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: '2px solid rgba(0, 0, 0, 0.15)',
    borderTopColor: '#18181b',
    animation: 'spin 0.6s linear infinite',
    display: 'inline-block'
  }
};
