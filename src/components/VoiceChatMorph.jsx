import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';

// Web Audio API tactile sound feedback
const playTactileSound = (type = 'expand') => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const t = ctx.currentTime;
    if (type === 'expand') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, t);
      osc.frequency.exponentialRampToValueAtTime(840, t + 0.1);
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.12);
    } else if (type === 'collapse') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(740, t);
      osc.frequency.exponentialRampToValueAtTime(360, t + 0.08);
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
    } else if (type === 'join') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(580, t);
      osc.frequency.exponentialRampToValueAtTime(1160, t + 0.12);
      gain.gain.setValueAtTime(0.07, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.14);
    }
  } catch (e) { }
};

// Participants matching the 4 visible individuals in the reference screenshot + 3 more
const PARTICIPANTS = [
  {
    id: 'p0',
    name: 'Marcus',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    fallbackBg: '#fee2e2',
    isSpeaking: true
  },
  {
    id: 'p1',
    name: 'David',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    fallbackBg: '#e0e7ff',
    isSpeaking: false
  },
  {
    id: 'p2',
    name: 'Elena',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    fallbackBg: '#fce7f3',
    isSpeaking: true
  },
  {
    id: 'p3',
    name: 'Ryan',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
    fallbackBg: '#fef3c7',
    isSpeaking: false
  },
  {
    id: 'p4',
    name: 'Sofia',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    fallbackBg: '#ede9fe',
    isSpeaking: false
  },
  {
    id: 'p5',
    name: 'Alex',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80',
    fallbackBg: '#ccfbf1',
    isSpeaking: false
  },
  {
    id: 'p6',
    name: 'Maya',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    fallbackBg: '#ffedd5',
    isSpeaking: false
  }
];

// Layout Coordinates for Collapsed vs Expanded States
const POS_COLLAPSED = {
  p0: { x: 20, y: 11, opacity: 1, scale: 1 },
  p1: { x: 58, y: 11, opacity: 1, scale: 1 },
  p2: { x: 96, y: 11, opacity: 1, scale: 1 },
  p3: { x: 134, y: 11, opacity: 1, scale: 1 },
  p4: { x: 96, y: 11, opacity: 0, scale: 0.4 },
  p5: { x: 134, y: 11, opacity: 0, scale: 0.4 },
  p6: { x: 134, y: 11, opacity: 0, scale: 0.4 }
};

const POS_EXPANDED = {
  p0: { x: 22, y: 76, opacity: 1, scale: 1 },
  p1: { x: 104, y: 76, opacity: 1, scale: 1 },
  p2: { x: 186, y: 76, opacity: 1, scale: 1 },
  p3: { x: 268, y: 76, opacity: 1, scale: 1 },
  p4: { x: 63, y: 182, opacity: 1, scale: 1 },
  p5: { x: 145, y: 182, opacity: 1, scale: 1 },
  p6: { x: 227, y: 182, opacity: 1, scale: 1 }
};

export default function VoiceChatMorph() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [handRaised, setHandRaised] = useState(false);

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
    // Initial placement in collapsed pill
    Object.keys(POS_COLLAPSED).forEach((key) => {
      const el = pRefs.current[key];
      if (el) gsap.set(el, POS_COLLAPSED[key]);
    });

    const easeCurve = 'power3.out';

    const tl = gsap.timeline({
      paused: true,
      defaults: { ease: easeCurve },
      onStart: () => {
        setIsExpanded(true);
        playTactileSound('expand');
      },
      onReverseComplete: () => {
        setIsExpanded(false);
        playTactileSound('collapse');
      }
    });

    // 1. Container morphs from pill (288x74) to modal (350x420)
    tl.to(widgetRef.current, {
      width: 350,
      height: 420,
      borderRadius: 32,
      boxShadow: '0 24px 56px -12px rgba(0, 0, 0, 0.18)',
      duration: 0.44,
      ease: 'back.out(1.15)'
    }, 0);

    // 2. Row 1 avatars glide into position
    ['p0', 'p1', 'p2', 'p3'].forEach((id, i) => {
      tl.to(pRefs.current[id], {
        x: POS_EXPANDED[id].x,
        y: POS_EXPANDED[id].y,
        duration: 0.42,
        ease: 'back.out(1.2)'
      }, i * 0.015);
    });

    // 3. Row 2 avatars reveal smoothly
    ['p4', 'p5', 'p6'].forEach((id, i) => {
      tl.to(pRefs.current[id], {
        x: POS_EXPANDED[id].x,
        y: POS_EXPANDED[id].y,
        opacity: 1,
        scale: 1,
        duration: 0.42,
        ease: 'back.out(1.2)'
      }, 0.06 + i * 0.015);
    });

    // 4. Fade out collapsed badges
    tl.to(countTagRef.current, { opacity: 0, scale: 0.7, duration: 0.15, ease: 'power2.in' }, 0);
    tl.to(micBadgeRef.current, { opacity: 0, scale: 0.5, duration: 0.15, ease: 'power2.in' }, 0);

    // 5. Reveal speaking badges on speakers
    const speakingBadges = ['p0', 'p2'].map(id => badgeRefs.current[id]).filter(Boolean);
    if (speakingBadges.length) {
      tl.to(speakingBadges, {
        opacity: 1,
        scale: 1,
        duration: 0.25,
        ease: 'back.out(1.8)'
      }, 0.2);
    }

    // 6. Reveal participant names
    const names = Object.values(nameRefs.current).filter(Boolean);
    tl.to(names, {
      opacity: 1,
      y: 0,
      duration: 0.25,
      stagger: 0.02,
      ease: 'power3.out'
    }, 0.18);

    // 7. Reveal Header and Action Controls
    tl.to(headerRef.current, {
      opacity: 1,
      y: 0,
      pointerEvents: 'auto',
      duration: 0.28,
      ease: 'power3.out'
    }, 0.12);

    tl.to(actionRef.current, {
      opacity: 1,
      y: 0,
      pointerEvents: 'auto',
      duration: 0.28,
      ease: 'power3.out'
    }, 0.15);

    morphTlRef.current = tl;

    return () => {
      tl.kill();
    };
  }, []);

  const handleCardClick = () => {
    if (!isExpanded && morphTlRef.current) {
      morphTlRef.current.play();
    }
  };

  const handleClose = (e) => {
    e.stopPropagation();
    if (morphTlRef.current) {
      morphTlRef.current.reverse();
    }
  };

  const handleJoinClick = (e) => {
    e.stopPropagation();
    playTactileSound('join');
    setIsConnected(!isConnected);
  };

  const handleToggleMute = (e) => {
    e.stopPropagation();
    playTactileSound('expand');
    setIsMuted(!isMuted);
  };

  const handleRaiseHand = (e) => {
    e.stopPropagation();
    playTactileSound('expand');
    setHandRaised(!handRaised);
  };

  return (
    <div style={styles.viewportWrapper} ref={containerRef}>
      {/* Blurred Backdrop */}
      <div
        ref={backdropRef}
        style={{
          ...styles.backdrop,
          opacity: isExpanded ? 1 : 0,
          pointerEvents: isExpanded ? 'auto' : 'none'
        }}
        onClick={handleClose}
      />

      {/* Main Morphing Pill Card */}
      <div
        ref={widgetRef}
        style={{
          ...styles.voiceWidget,
          cursor: isExpanded ? 'default' : 'pointer'
        }}
        onClick={handleCardClick}
      >
        {/* Floating Audio Waveform Badge (Collapsed Top-Left) */}
        <div ref={micBadgeRef} style={styles.micBadge}>
          <div style={{ ...styles.waveBar, height: '11px', animationDelay: '0.1s' }} />
          <div style={{ ...styles.waveBar, height: '18px', animationDelay: '0.3s' }} />
          <div style={{ ...styles.waveBar, height: '14px', animationDelay: '0.0s' }} />
          <div style={{ ...styles.waveBar, height: '8px', animationDelay: '0.4s' }} />
        </div>

        {/* Count Tag (+3 ⌄) in Collapsed Pill */}
        <div ref={countTagRef} style={styles.countTag}>
          <span style={styles.countText}>+3</span>
          <svg style={styles.chevronIcon} viewBox="0 0 14 9" fill="none">
            <path
              d="M1.5 2L7 7.5L12.5 2"
              stroke="#5e6b7d"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Modal Header (Expanded State) */}
        <div ref={headerRef} style={styles.modalHeader}>
          <div style={styles.headerTitleRow}>
            <span style={styles.modalTitle}>Design Sync</span>
            <span style={styles.liveIndicatorPill}>
              <span style={styles.livePulseDot} />
              7 online
            </span>
          </div>

          <button style={styles.closeBtn} onClick={handleClose} title="Close room">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Participant Items with Stacking */}
        {PARTICIPANTS.map((person, idx) => {
          // In collapsed state, stack order sits naturally left-to-right (idx + 1)
          const zIdx = idx + 2;
          return (
            <div
              key={person.id}
              ref={(el) => (pRefs.current[person.id] = el)}
              style={{ ...styles.participantItem, zIndex: zIdx }}
            >
              <div
                style={{
                  ...styles.avatarWrap,
                  boxShadow: person.isSpeaking && isExpanded
                    ? '0 0 0 2.5px #10b981, 0 4px 12px rgba(16, 185, 129, 0.35)'
                    : '0 3px 10px rgba(0, 0, 0, 0.08)'
                }}
              >
                <img
                  style={styles.avatarImg}
                  src={person.avatar}
                  alt={person.name}
                  loading="eager"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextSibling) {
                      e.currentTarget.nextSibling.style.display = 'flex';
                    }
                  }}
                />
                {/* Fallback initial avatar if image takes a second */}
                <div style={{ ...styles.avatarFallback, background: person.fallbackBg, display: 'none' }}>
                  {person.name[0]}
                </div>

                {/* Speaking Wave Badge in Expanded View */}
                {person.isSpeaking && (
                  <div
                    ref={(el) => (badgeRefs.current[person.id] = el)}
                    style={styles.miniSpeakingBadge}
                  >
                    <div style={{ ...styles.miniWave, height: '7px', animationDelay: '0.1s' }} />
                    <div style={{ ...styles.miniWave, height: '11px', animationDelay: '0.3s' }} />
                    <div style={{ ...styles.miniWave, height: '9px', animationDelay: '0.0s' }} />
                  </div>
                )}
              </div>

              {/* Participant Name under Avatar */}
              <span
                ref={(el) => (nameRefs.current[person.id] = el)}
                style={styles.participantName}
              >
                {person.name}
              </span>
            </div>
          );
        })}

        {/* Modal Action Controls (Expanded View) */}
        <div ref={actionRef} style={styles.actionSection}>
          <div style={styles.actionRow}>
            {/* Mute Button */}
            <button
              style={{
                ...styles.controlIconBtn,
                background: isMuted ? '#f1f5f9' : '#ecfdf5',
                color: isMuted ? '#64748b' : '#059669'
              }}
              onClick={handleToggleMute}
              title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isMuted ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                  <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              )}
            </button>

            {/* Raise Hand Reaction Button */}
            <button
              style={{
                ...styles.controlIconBtn,
                background: handRaised ? '#fef3c7' : '#f1f5f9'
              }}
              onClick={handleRaiseHand}
              title="Raise hand"
            >
              <span style={{ fontSize: '18px' }}>👋</span>
            </button>

            {/* Join / Leave Main Action */}
            <button
              style={{
                ...styles.joinBtn,
                background: isConnected ? '#ef4444' : '#111827',
                boxShadow: isConnected
                  ? '0 6px 18px rgba(239, 68, 68, 0.35)'
                  : '0 6px 18px rgba(17, 24, 39, 0.25)'
              }}
              onClick={handleJoinClick}
            >
              {isConnected ? 'Leave Space' : 'Join Discussion'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulseWave {
          0% { transform: scaleY(0.35); }
          100% { transform: scaleY(1.15); }
        }
        @keyframes liveBlink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
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
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Plus Jakarta Sans', sans-serif",
    userSelect: 'none'
  },
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.18)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    transition: 'opacity 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 10
  },
  voiceWidget: {
    position: 'relative',
    zIndex: 20,
    width: '286px',
    height: '74px',
    background: '#ffffff',
    borderRadius: '999px',
    boxShadow: '0 10px 32px -4px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.02)',
    border: '1px solid rgba(0, 0, 0, 0.04)',
    overflow: 'hidden',
    transformOrigin: 'center center',
    transform: 'translateZ(0)',
    willChange: 'width, height, border-radius, transform'
  },
  micBadge: {
    position: 'absolute',
    top: '7px',
    left: '8px',
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    background: '#1a1c22',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2.6px',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.22)',
    border: '2.5px solid #ffffff',
    zIndex: 25,
    pointerEvents: 'none'
  },
  waveBar: {
    width: '2.8px',
    background: '#ffffff',
    borderRadius: '999px',
    animation: 'pulseWave 0.85s ease-in-out infinite alternate'
  },
  countTag: {
    position: 'absolute',
    top: '24px',
    left: '202px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    zIndex: 15,
    pointerEvents: 'none',
    whiteSpace: 'nowrap'
  },
  countText: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#5e6b7d',
    letterSpacing: '-0.02em',
    lineHeight: '1',
    userSelect: 'none'
  },
  chevronIcon: {
    width: '13px',
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
    justifyContent: 'space-between',
    padding: '0 24px',
    opacity: 0,
    pointerEvents: 'none',
    transform: 'translateY(-8px)',
    zIndex: 25
  },
  headerTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: '-0.02em'
  },
  liveIndicatorPill: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#059669',
    background: '#ecfdf5',
    padding: '3px 9px',
    borderRadius: '999px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  livePulseDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    animation: 'liveBlink 1.5s infinite ease-in-out'
  },
  closeBtn: {
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
  participantItem: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '52px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    willChange: 'transform, opacity'
  },
  avatarWrap: {
    position: 'relative',
    width: '50px',
    height: '50px',
    borderRadius: '50%'
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2.5px solid #ffffff',
    display: 'block'
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    border: '2.5px solid #ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b'
  },
  miniSpeakingBadge: {
    position: 'absolute',
    top: '-2px',
    right: '-2px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: '#10b981',
    border: '2px solid #ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
    zIndex: 5
  },
  miniWave: {
    width: '2px',
    background: '#ffffff',
    borderRadius: '999px',
    animation: 'pulseWave 0.8s ease-in-out infinite alternate'
  },
  participantName: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
    marginTop: '6px',
    opacity: 0,
    transform: 'translateY(4px)',
    letterSpacing: '-0.01em',
    whiteSpace: 'nowrap'
  },
  actionSection: {
    position: 'absolute',
    bottom: '22px',
    left: '24px',
    right: '24px',
    opacity: 0,
    pointerEvents: 'none',
    transform: 'translateY(8px)',
    zIndex: 25
  },
  actionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  controlIconBtn: {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.18s ease'
  },
  joinBtn: {
    flex: 1,
    height: '46px',
    borderRadius: '999px',
    border: 'none',
    outline: 'none',
    color: '#ffffff',
    fontSize: '14.5px',
    fontWeight: '700',
    letterSpacing: '-0.01em',
    cursor: 'pointer',
    transition: 'all 0.22s ease'
  }
};
