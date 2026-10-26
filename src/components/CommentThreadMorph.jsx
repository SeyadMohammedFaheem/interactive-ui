import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';

// Web Audio API tactile feedback
const playSound = (type = 'send') => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const t = ctx.currentTime;
    if (type === 'send') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, t);
      osc.frequency.exponentialRampToValueAtTime(1080, t + 0.08);
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
    } else if (type === 'reply') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(720, t);
      osc.frequency.exponentialRampToValueAtTime(480, t + 0.1);
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.12);
    } else if (type === 'resolve') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(1320, t + 0.12);
      gain.gain.setValueAtTime(0.07, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    }
  } catch (e) {}
};

// Vector Illustrated Avatars Matching Screenshot Exactly
const MikeAvatar = ({ size = 46 }) => (
  <svg width={size} height={size} viewBox="0 0 46 46" fill="none" style={{ borderRadius: '50%', flexShrink: 0 }}>
    <circle cx="23" cy="23" r="23" fill="#ffeed8" />
    <g transform="translate(7, 8)">
      {/* Face outline / chin */}
      <circle cx="16" cy="19.5" r="9.5" fill="#fecba0" />
      {/* Ears */}
      <circle cx="6.5" cy="19.5" r="2.5" fill="#fecba0" />
      <circle cx="25.5" cy="19.5" r="2.5" fill="#fecba0" />
      {/* Blue Cap Dome */}
      <path
        d="M6 16.5 C6 8.5, 11 3.5, 16 3.5 C21 3.5, 26 8.5, 26 16.5 Z"
        fill="#0284c7"
      />
      {/* Button on top */}
      <circle cx="16" cy="3.5" r="1.5" fill="#0369a1" />
      {/* Curved Black Visor */}
      <path
        d="M4 16.5 C4 14.5, 28 14.5, 28 16.5 C28 19, 23 20.5, 16 20.5 C9 20.5, 4 19, 4 16.5 Z"
        fill="#18181b"
      />
      {/* Visor specular gleam */}
      <path
        d="M7 16.5 C10 18, 22 18, 25 16.5"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Minimal Eyes */}
      <circle cx="12" cy="22" r="1.3" fill="#18181b" />
      <circle cx="20" cy="22" r="1.3" fill="#18181b" />
      {/* Smile */}
      <path d="M14 25.5 Q16 27.2 18 25.5" stroke="#18181b" strokeWidth="1.3" strokeLinecap="round" fill="none" />
    </g>
  </svg>
);

const EmilyAvatar = ({ size = 38 }) => (
  <svg width={size} height={size} viewBox="0 0 38 38" fill="none" style={{ borderRadius: '50%', flexShrink: 0 }}>
    <circle cx="19" cy="19" r="19" fill="#fce7f3" />
    <g transform="translate(6, 6)">
      {/* Hair back */}
      <path d="M4 15 C4 6, 22 6, 22 15 C22 23, 19 25, 19 25 L7 25 C7 25, 4 23, 4 15 Z" fill="#3b2318" />
      {/* Warm skin face */}
      <circle cx="13" cy="14" r="8.5" fill="#c48e6c" />
      {/* Hair bangs / front with cute side waves */}
      <path d="M5 12 C8 7, 13 8, 13 11 C13 8, 18 7, 21 12 C22 15, 21 19, 21 19 C20 13, 17 11, 13 12 C9 11, 6 13, 5 19 Z" fill="#2d1a12" />
      {/* Eyes */}
      <circle cx="10" cy="14" r="1.2" fill="#18181b" />
      <circle cx="16" cy="14" r="1.2" fill="#18181b" />
      {/* Smile */}
      <path d="M11.5 17 Q13 18.5 14.5 17" stroke="#18181b" strokeWidth="1.1" strokeLinecap="round" fill="none" />
    </g>
  </svg>
);

// High-fidelity UI icons matching reference screenshot
const SpeechBubbleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const CheckmarkIcon = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? '#10b981' : '#8da2b8'} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const DismissIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8da2b8" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const INITIAL_MESSAGES = [
  {
    id: 'msg-1',
    author: 'Mike',
    time: '13 hours ago',
    text: 'Is it just me, or is the font size on this page designed for ants?',
    isMike: true
  }
];

const AUTO_REPLIES = [
  'Ah, that fixed it perfectly! Thanks Emily! 🙌',
  'Whoa, CMD + 0 worked like magic! Everything is readable now! ✨',
  'My eyes thank you immensely! 🐜 -> 🧑',
  'Haha wow, literally instant relief. Appreciate the tip! 🚀'
];

export default function CommentThreadMorph() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('Just do CMD + 0');
  const [isTyping, setIsTyping] = useState(false);
  const [isResolved, setIsResolved] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const cardRef = useRef(null);
  const msgRefs = useRef({});

  // Show playful toast
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2800);
  };

  const animateNewMessage = (id) => {
    const el = msgRefs.current[id];
    if (el) {
      gsap.fromTo(
        el,
        { opacity: 0, y: 16, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.42, ease: 'back.out(1.5)' }
      );
    }
  };

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    playSound('send');
    const userText = inputText.trim();
    const emilyMsgId = `emily-${Date.now()}`;
    const newEmilyMsg = {
      id: emilyMsgId,
      author: 'Emily',
      time: 'just now',
      text: userText,
      isMike: false
    };

    setMessages((prev) => [...prev, newEmilyMsg]);
    setInputText('');

    setTimeout(() => {
      animateNewMessage(emilyMsgId);
    }, 10);

    // If sending CMD + 0, trigger fun zoom celebration
    if (userText.toLowerCase().includes('cmd') || userText.includes('0')) {
      triggerToast('🔍 Zoom reset to 100%! Ants be gone! 🐜✨');
    }

    // Simulate Mike typing indicator
    setTimeout(() => {
      setIsTyping(true);
    }, 450);

    // Mike replies back
    setTimeout(() => {
      setIsTyping(false);
      playSound('reply');
      const mikeReplyId = `mike-${Date.now()}`;
      const randomReply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
      const newMikeMsg = {
        id: mikeReplyId,
        author: 'Mike',
        time: 'just now',
        text: randomReply,
        isMike: true
      };

      setMessages((prev) => [...prev, newMikeMsg]);
      setTimeout(() => {
        animateNewMessage(mikeReplyId);
      }, 10);
    }, 1600);
  };

  const handleToggleResolve = () => {
    playSound('resolve');
    setIsResolved((prev) => !prev);
    if (!isResolved) {
      triggerToast('Thread marked as resolved ✅');
    }
  };

  const handleResetThread = () => {
    playSound('reply');
    setMessages(INITIAL_MESSAGES);
    setInputText('Just do CMD + 0');
    setIsTyping(false);
    setIsResolved(false);
  };

  const isInputActive = inputText.trim().length > 0 && !isTyping;

  return (
    <div style={styles.container}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={styles.toastNotice}>
          {toastMessage}
        </div>
      )}

      <div style={styles.widgetWrapper}>
        {/* Main Comment Thread Card */}
        <div ref={cardRef} style={styles.commentCard}>
          {/* Card Header */}
          <div style={styles.cardHeader}>
            <div style={styles.headerTitleGroup}>
              <SpeechBubbleIcon />
              <span style={styles.headerTitle}>Comment</span>
              {isResolved && (
                <span style={styles.resolvedBadge}>
                  ✓ Resolved
                </span>
              )}
            </div>

            <div style={styles.headerActions}>
              <button
                style={{
                  ...styles.iconActionBtn,
                  backgroundColor: isResolved ? '#ecfdf5' : 'transparent'
                }}
                onClick={handleToggleResolve}
                title={isResolved ? 'Reopen thread' : 'Mark as resolved'}
              >
                <CheckmarkIcon active={isResolved} />
              </button>

              <button
                style={styles.iconActionBtn}
                onClick={handleResetThread}
                title="Reset conversation"
              >
                <DismissIcon />
              </button>
            </div>
          </div>

          {/* Thread Message Stream */}
          <div style={styles.threadContent}>
            {messages.map((msg, index) => (
              <div
                key={msg.id}
                ref={(el) => (msgRefs.current[msg.id] = el)}
                style={{
                  ...styles.commentItem,
                  marginTop: index > 0 ? '20px' : '0'
                }}
              >
                {/* Visual Avatar */}
                {msg.isMike ? (
                  <MikeAvatar size={46} />
                ) : (
                  <EmilyAvatar size={46} />
                )}

                {/* Comment Content */}
                <div style={styles.commentBody}>
                  <div style={styles.authorMeta}>
                    <span style={styles.authorName}>{msg.author}</span>
                    <span style={msg.time === 'just now' ? styles.timeBadgeNow : styles.timeAgo}>
                      {msg.time}
                    </span>
                  </div>
                  <p style={styles.commentText}>{msg.text}</p>
                </div>
              </div>
            ))}

            {/* Mike Typing Indicator */}
            {isTyping && (
              <div style={styles.typingIndicatorRow}>
                <MikeAvatar size={38} />
                <div style={styles.typingBubble}>
                  <span style={styles.typingDot1} />
                  <span style={styles.typingDot2} />
                  <span style={styles.typingDot3} />
                  <span style={styles.typingLabel}>Mike is typing...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Floating Reply Pill */}
        <form onSubmit={handleSend} style={styles.replyPillContainer}>
          <div style={styles.replyAvatarWrap}>
            <EmilyAvatar size={38} />
          </div>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isTyping ? 'Mike is replying...' : 'Reply...'}
            disabled={isTyping}
            style={{
              ...styles.replyInput,
              opacity: isTyping ? 0.6 : 1
            }}
          />

          <button
            type="submit"
            disabled={!isInputActive}
            style={{
              ...styles.sendBtn,
              background: isInputActive ? '#c6ff00' : '#e2e8f0',
              color: isInputActive ? '#0f172a' : '#94a3b8',
              cursor: isInputActive ? 'pointer' : 'default',
              boxShadow: isInputActive
                ? '0 4px 22px rgba(198, 255, 0, 0.65), 0 0 14px rgba(204, 255, 0, 0.4)'
                : 'none',
              transform: isInputActive ? 'scale(1)' : 'scale(0.98)'
            }}
          >
            Send
          </button>
        </form>
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
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Plus Jakarta Sans', sans-serif",
    userSelect: 'none',
    padding: '24px',
    position: 'relative'
  },
  toastNotice: {
    position: 'absolute',
    top: '-6px',
    background: '#18181b',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: '600',
    padding: '8px 18px',
    borderRadius: '999px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
    animation: 'toastFade 0.3s ease-out forwards',
    zIndex: 20,
    letterSpacing: '-0.01em'
  },
  widgetWrapper: {
    width: '100%',
    maxWidth: '490px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  commentCard: {
    background: '#ffffff',
    borderRadius: '28px',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    boxShadow: '0 16px 40px -8px rgba(0, 0, 0, 0.08), 0 3px 12px rgba(0, 0, 0, 0.02)',
    padding: '22px 26px 26px 26px',
    overflow: 'hidden',
    transition: 'all 0.35s ease'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '16px',
    borderBottom: '1px solid #f1f5f9'
  },
  headerTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  headerTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: '-0.02em'
  },
  resolvedBadge: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#059669',
    background: '#ecfdf5',
    padding: '3px 10px',
    borderRadius: '999px',
    letterSpacing: '0.01em'
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  iconActionBtn: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    padding: '7px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.18s ease'
  },
  threadContent: {
    paddingTop: '20px',
    display: 'flex',
    flexDirection: 'column'
  },
  commentItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px'
  },
  commentBody: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  authorMeta: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px'
  },
  authorName: {
    fontSize: '16.5px',
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: '-0.02em'
  },
  timeAgo: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#8da2b8',
    letterSpacing: '-0.01em'
  },
  timeBadgeNow: {
    fontSize: '12.5px',
    fontWeight: '600',
    color: '#3b82f6',
    background: '#eff6ff',
    padding: '2px 8px',
    borderRadius: '999px'
  },
  commentText: {
    fontSize: '16.5px',
    lineHeight: '1.45',
    fontWeight: '500',
    color: '#1e293b',
    letterSpacing: '-0.015em',
    marginTop: '2px',
    marginRight: '8px'
  },
  typingIndicatorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '20px'
  },
  typingBubble: {
    background: '#f1f5f9',
    borderRadius: '999px',
    padding: '8px 16px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px'
  },
  typingDot1: {
    width: '6px',
    height: '6px',
    background: '#94a3b8',
    borderRadius: '50%',
    animation: 'pulseDot 1s infinite alternate ease-in-out'
  },
  typingDot2: {
    width: '6px',
    height: '6px',
    background: '#94a3b8',
    borderRadius: '50%',
    animation: 'pulseDot 1s infinite alternate ease-in-out 0.2s'
  },
  typingDot3: {
    width: '6px',
    height: '6px',
    background: '#94a3b8',
    borderRadius: '50%',
    animation: 'pulseDot 1s infinite alternate ease-in-out 0.4s'
  },
  typingLabel: {
    fontSize: '13px',
    color: '#64748b',
    fontWeight: '600',
    marginLeft: '6px'
  },
  replyPillContainer: {
    height: '60px',
    background: '#ffffff',
    borderRadius: '999px',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    boxShadow: '0 10px 30px -4px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.02)',
    padding: '6px 6px 6px 10px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  replyAvatarWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  replyInput: {
    flex: 1,
    height: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Plus Jakarta Sans', sans-serif",
    fontSize: '16px',
    fontWeight: '500',
    color: '#0f172a',
    letterSpacing: '-0.015em'
  },
  sendBtn: {
    height: '46px',
    padding: '0 26px',
    borderRadius: '999px',
    border: 'none',
    outline: 'none',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Plus Jakarta Sans', sans-serif",
    fontSize: '15px',
    fontWeight: '800',
    letterSpacing: '-0.01em',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
  }
};

