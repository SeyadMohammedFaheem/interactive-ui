import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(CustomEase);
  try {
    CustomEase.create('markerBounceSmooth', 'M0,0 C0.16,1.38 0.3,1 1,1');
  } catch (e) {
    // Already created
  }
}

const PARTICIPANTS = [
  { id: 'p0', name: 'Oğuz', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', isSpeaking: true },
  { id: 'p1', name: 'Ashish', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', isSpeaking: false },
  { id: 'p2', name: 'Mariana', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80', isSpeaking: false },
  { id: 'p3', name: 'MDS', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80', isSpeaking: false },
  { id: 'p4', name: 'Ana', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', isSpeaking: false },
  { id: 'p5', name: 'Natko', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80', isSpeaking: true },
  { id: 'p6', name: 'Afshin', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80', isSpeaking: false }
];

const POS_COLLAPSED = {
  p0: { x: 18, y: 9, opacity: 1, scale: 1 },
  p1: { x: 61, y: 9, opacity: 1, scale: 1 },
  p2: { x: 104, y: 9, opacity: 1, scale: 1 },
  p3: { x: 147, y: 9, opacity: 1, scale: 1 },
  p4: { x: 61, y: 9, opacity: 0, scale: 0.5 },
  p5: { x: 104, y: 9, opacity: 0, scale: 0.5 },
  p6: { x: 147, y: 9, opacity: 0, scale: 0.5 }
};

const POS_EXPANDED = {
  p0: { x: 20, y: 76, opacity: 1, scale: 1 },
  p1: { x: 107, y: 76, opacity: 1, scale: 1 },
  p2: { x: 194, y: 76, opacity: 1, scale: 1 },
  p3: { x: 281, y: 76, opacity: 1, scale: 1 },
  p4: { x: 20, y: 178, opacity: 1, scale: 1 },
  p5: { x: 107, y: 178, opacity: 1, scale: 1 },
  p6: { x: 194, y: 178, opacity: 1, scale: 1 }
};

export default function VoiceChatMorph() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const containerRef = useRef(null);
  const widgetRef = useRef(null);
  const backdropRef = useRef(null);
  const micBadgeRef = useRef(null);
  const countTagRef = useRef(null);
  const headerRef = useRef(null);
  const actionRef = useRef(null);
  const pRefs = useRef({});
  const nameRefs = useRef({});
  const badgeRefs = useRef({});
  const morphTlRef = useRef(null);

  useEffect(() => {
    const fluidEase = 'markerBounceSmooth';
    const springEase = 'markerBounceSmooth';

    // Set initial positions
    Object.keys(POS_COLLAPSED).forEach((key) => {
      const el = pRefs.current[key];
      if (el) gsap.set(el, POS_COLLAPSED[key]);
    });

    const tl = gsap.timeline({
      paused: true,
      defaults: { ease: fluidEase },
      onStart: () => {
        setIsExpanded(true);
      },
      onReverseComplete: () => {
        setIsExpanded(false);
      }
    });

    // 1. Card container morph (0.48s medium)
    tl.to(widgetRef.current, {
      width: 360,
      height: 426,
      borderRadius: 32,
      boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.16)',
      duration: 0.48,
      ease: fluidEase
    }, 0);

    // 2. Row 1 avatars glide (0.48s medium)
    ['p0', 'p1', 'p2', 'p3'].forEach((id, i) => {
      tl.to(pRefs.current[id], {
        x: POS_EXPANDED[id].x,
        y: POS_EXPANDED[id].y,
        duration: 0.48,
        ease: springEase
      }, i * 0.015);
    });

    // 3. Row 2 avatars slide down and scale (0.48s medium)
    ['p4', 'p5', 'p6'].forEach((id, i) => {
      tl.to(pRefs.current[id], {
        x: POS_EXPANDED[id].x,
        y: POS_EXPANDED[id].y,
        opacity: 1,
        scale: 1,
        duration: 0.48,
        ease: springEase
      }, 0.04 + i * 0.015);
    });

    // 4. Fade out for collapsed badges (0.14s)
    tl.to(countTagRef.current, { opacity: 0, scale: 0.7, x: '+=6', duration: 0.14, ease: 'power2.in' }, 0);
    tl.to(micBadgeRef.current, { opacity: 0, scale: 0.5, duration: 0.14, ease: 'power2.in' }, 0);

    // 5. Mini speaking badges reveal (0.24s)
    const speakingBadges = ['p0', 'p5'].map(id => badgeRefs.current[id]).filter(Boolean);
    if (speakingBadges.length) {
      tl.to(speakingBadges, {
        opacity: 1,
        scale: 1,
        duration: 0.24,
        ease: 'markerBounceSmooth'
      }, 0.18);
    }

    // 6. Participant names (0.24s)
    const names = Object.values(nameRefs.current).filter(Boolean);
    tl.to(names, {
      opacity: 1,
      y: 0,
      duration: 0.24,
      stagger: 0.015,
      ease: fluidEase
    }, 0.15);

    // 7. Header and Action section (0.3s)
    tl.to(headerRef.current, {
      opacity: 1,
      y: 0,
      pointerEvents: 'auto',
      duration: 0.3,
      ease: fluidEase
    }, 0.1);

    tl.to(actionRef.current, {
      opacity: 1,
      y: 0,
      pointerEvents: 'auto',
      duration: 0.3,
      ease: fluidEase
    }, 0.12);

    morphTlRef.current = tl;

    return () => {
      tl.kill();
    };
  }, []);

  const handleCardClick = () => {
    if (!isExpanded && morphTlRef.current) {
      morphTlRef.current.timeScale(1.0).play();
    }
  };

  const handleClose = (e) => {
    e.stopPropagation();
    if (morphTlRef.current) {
      morphTlRef.current.timeScale(1.1).reverse();
    }
  };

  const handleJoinClick = (e) => {
    e.stopPropagation();
    setIsConnected(!isConnected);
  };

  return (
    <div style={styles.viewportWrapper} ref={containerRef}>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        style={{
          ...styles.backdrop,
          opacity: isExpanded ? 1 : 0,
          pointerEvents: isExpanded ? 'auto' : 'none'
        }}
        onClick={handleClose}
      />

      {/* Main Morphing Widget */}
      <div
        ref={widgetRef}
        style={{
          ...styles.voiceWidget,
          cursor: isExpanded ? 'default' : 'pointer'
        }}
        onClick={handleCardClick}
      >
        {/* Floating Mic Wave Badge (Collapsed) */}
        <div ref={micBadgeRef} style={styles.micBadge}>
          <div style={{ ...styles.waveBar, height: '12px', animationDelay: '0.1s' }} />
          <div style={{ ...styles.waveBar, height: '20px', animationDelay: '0.3s' }} />
          <div style={{ ...styles.waveBar, height: '16px', animationDelay: '0.0s' }} />
          <div style={{ ...styles.waveBar, height: '9px', animationDelay: '0.4s' }} />
        </div>

        {/* Count Tag (+3 ⌄) in Collapsed Pill */}
        <div ref={countTagRef} style={styles.countTag}>
          <span style={styles.countText}>+3</span>
          <svg style={styles.chevronIcon} viewBox="0 0 14 9" fill="none">
            <path d="M1.5 2L7 7.5L12.5 2" stroke="#717680" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Modal Header */}
        <div ref={headerRef} style={styles.modalHeader}>
          <span style={styles.modalTitle}>Voice Chat</span>
          <button style={styles.closeBtn} onClick={handleClose} title="Close">
            <svg style={styles.closeSvg} viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.4" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Participant Items */}
        {PARTICIPANTS.map((person, idx) => {
          const zIdx = 14 - idx;
          return (
            <div
              key={person.id}
              ref={(el) => (pRefs.current[person.id] = el)}
              style={{ ...styles.participantItem, zIndex: zIdx }}
            >
              <div style={styles.avatarWrap}>
                <img style={styles.avatarImg} src={person.avatar} alt={person.name} />
                {person.isSpeaking && (
                  <div
                    ref={(el) => (badgeRefs.current[person.id] = el)}
                    style={styles.miniSpeakingBadge}
                  >
                    <div style={{ ...styles.miniWave, animationDelay: '0.1s' }} />
                    <div style={{ ...styles.miniWave, animationDelay: '0.3s' }} />
                    <div style={{ ...styles.miniWave, animationDelay: '0.0s' }} />
                    <div style={{ ...styles.miniWave, animationDelay: '0.4s' }} />
                  </div>
                )}
              </div>
              <span
                ref={(el) => (nameRefs.current[person.id] = el)}
                style={styles.participantName}
              >
                {person.name}
              </span>
            </div>
          );
        })}

        {/* Modal Action Section */}
        <div ref={actionRef} style={styles.actionSection}>
          <button
            style={{
              ...styles.joinBtn,
              background: isConnected ? '#10B981' : '#111827'
            }}
            onClick={handleJoinClick}
          >
            {isConnected ? '✓ Connected' : 'Join Now'}
          </button>
          <span style={styles.mutedNote}>Mic will be muted initially.</span>
        </div>
      </div>

      <style>{`
        @keyframes pulseWave {
          0% { transform: scaleY(0.4); }
          100% { transform: scaleY(1.15); }
        }
        @keyframes miniPulse {
          0% { transform: scaleY(0.4); }
          100% { transform: scaleY(1.1); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  viewportWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    minHeight: 'auto',
    background: 'transparent',
    overflow: 'hidden',
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
  },
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.18)',
    backdropFilter: 'blur(5px)',
    WebkitBackdropFilter: 'blur(5px)',
    transition: 'opacity 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 10
  },
  voiceWidget: {
    position: 'relative',
    zIndex: 20,
    width: '300px',
    height: '76px',
    background: '#ffffff',
    borderRadius: '999px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 16px 36px -4px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(0, 0, 0, 0.04)',
    overflow: 'hidden',
    transformOrigin: 'center center',
    transform: 'translateZ(0)',
    WebkitMaskImage: 'radial-gradient(white, black)',
    maskImage: 'radial-gradient(white, black)',
    willChange: 'width, height, border-radius, transform'
  },
  micBadge: {
    position: 'absolute',
    top: '2px',
    left: '2px',
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: '#1e2025',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2.8px',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.22)',
    border: '3px solid #ffffff',
    zIndex: 30,
    pointerEvents: 'none'
  },
  waveBar: {
    width: '2.6px',
    background: '#ffffff',
    borderRadius: '2px',
    animation: 'pulseWave 0.9s ease-in-out infinite alternate'
  },
  countTag: {
    position: 'absolute',
    top: '24px',
    left: '218px',
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    zIndex: 15,
    pointerEvents: 'none',
    whiteSpace: 'nowrap'
  },
  countText: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#717680',
    letterSpacing: '-0.03em',
    lineHeight: '1',
    userSelect: 'none'
  },
  chevronIcon: {
    width: '14px',
    height: '9px',
    display: 'block',
    marginTop: '2px'
  },
  modalHeader: {
    position: 'absolute',
    top: '22px',
    left: 0,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 24px',
    opacity: 0,
    pointerEvents: 'none',
    transform: 'translateY(-8px)',
    zIndex: 25
  },
  modalTitle: {
    fontSize: '19px',
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: '-0.02em'
  },
  closeBtn: {
    position: 'absolute',
    right: '22px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#f1f5f9',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s ease, transform 0.15s ease'
  },
  closeSvg: {
    width: '14px',
    height: '14px'
  },
  participantItem: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '58px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 20,
    willChange: 'transform, opacity'
  },
  avatarWrap: {
    position: 'relative',
    width: '58px',
    height: '58px',
    borderRadius: '50%',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #ffffff',
    display: 'block'
  },
  miniSpeakingBadge: {
    position: 'absolute',
    top: '-2px',
    right: '-2px',
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    background: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1.5px',
    boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15)',
    border: '2px solid #ffffff',
    zIndex: 25,
    opacity: 0,
    transform: 'scale(0.5)'
  },
  miniWave: {
    width: '1.8px',
    height: '10px',
    background: '#1e293b',
    borderRadius: '1px',
    animation: 'miniPulse 0.8s ease-in-out infinite alternate'
  },
  participantName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#334155',
    letterSpacing: '-0.015em',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    marginTop: '8px',
    opacity: 0,
    transform: 'translateY(-4px)',
    pointerEvents: 'none',
    userSelect: 'none'
  },
  actionSection: {
    position: 'absolute',
    bottom: '24px',
    left: '24px',
    right: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    opacity: 0,
    transform: 'translateY(16px)',
    pointerEvents: 'none',
    zIndex: 25
  },
  joinBtn: {
    width: '100%',
    height: '52px',
    borderRadius: '16px',
    color: '#ffffff',
    border: 'none',
    outline: 'none',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    letterSpacing: '-0.015em',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.25s ease, transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease',
    boxShadow: '0 4px 12px rgba(17, 24, 39, 0.15)'
  },
  mutedNote: {
    fontSize: '13.5px',
    fontWeight: '500',
    color: '#94a3b8',
    letterSpacing: '-0.01em',
    textAlign: 'center'
  }
};
