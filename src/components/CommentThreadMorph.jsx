import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';

// SVG Icons matching exact reference image
const CommentIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ResetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

const INITIAL_MESSAGES = [
  {
    id: 'msg-1',
    author: 'Mike',
    time: '13 hours ago',
    text: 'Is it just me, or is the font size on this page designed for ants?',
    avatarBg: '#ffedd5',
    emoji: '🧢'
  }
];

const AUTO_REPLIES = [
  'Ah, that fixed it perfectly! Thanks Emily! 🙌',
  'Whoa, super helpful! CMD + 0 worked like magic ✨',
  'Nice! That made everything crystal clear! 🚀',
  'Thanks for the tip! Appreciate it! 👍'
];

export default function CommentThreadMorph() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('Just do CMD + 0');
  const [isTyping, setIsTyping] = useState(false);

  const cardRef = useRef(null);
  const msgRefs = useRef({});

  const animateNewMessage = (id) => {
    const el = msgRefs.current[id];
    if (el && cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { boxShadow: '0 12px 32px -6px rgba(0, 0, 0, 0.06)' },
        { boxShadow: '0 20px 48px -8px rgba(0, 0, 0, 0.1)', duration: 0.45, ease: 'power3.out' }
      );

      gsap.fromTo(
        el,
        { opacity: 0, y: 14, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'back.out(1.4)' }
      );
    }
  };

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userText = inputText.trim();
    const emilyMsgId = `emily-${Date.now()}`;
    const newEmilyMsg = {
      id: emilyMsgId,
      author: 'Emily',
      time: 'just now',
      text: userText,
      avatarBg: '#fce7f3',
      emoji: '👩🏽'
    };

    setMessages((prev) => [...prev, newEmilyMsg]);
    setInputText('');

    setTimeout(() => {
      animateNewMessage(emilyMsgId);
    }, 10);

    // Simulate Mike typing indicator
    setTimeout(() => {
      setIsTyping(true);
    }, 400);

    // Simulate Mike reply
    setTimeout(() => {
      setIsTyping(false);
      const mikeReplyId = `mike-${Date.now()}`;
      const randomReply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
      const newMikeMsg = {
        id: mikeReplyId,
        author: 'Mike',
        time: 'just now',
        text: randomReply,
        avatarBg: '#ffedd5',
        emoji: '🧢'
      };

      setMessages((prev) => [...prev, newMikeMsg]);
      setTimeout(() => {
        animateNewMessage(mikeReplyId);
      }, 10);
    }, 1500);
  };

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
    setInputText('Just do CMD + 0');
    setIsTyping(false);
  };

  const isInputActive = inputText.trim().length > 0 && !isTyping;

  return (
    <div style={styles.container}>
      <div style={styles.widgetWrapper}>
        {/* Main Comment Thread Card */}
        <div ref={cardRef} style={styles.commentCard}>
          {/* Header */}
          <div style={styles.cardHeader}>
            <div style={styles.headerTitleGroup}>
              <CommentIcon />
              <span style={styles.headerTitle}>Comment</span>
            </div>
            <div style={styles.headerActions}>
              {messages.length > 1 && (
                <button style={styles.iconBtn} onClick={handleReset} title="Reset Thread">
                  <ResetIcon />
                </button>
              )}
              <button style={styles.iconBtn} title="Mark resolved">
                <CheckIcon />
              </button>
              <button style={styles.iconBtn} title="Close">
                <CloseIcon />
              </button>
            </div>
          </div>

          {/* Thread List */}
          <div style={styles.threadContent}>
            {messages.map((msg, index) => (
              <div
                key={msg.id}
                ref={(el) => (msgRefs.current[msg.id] = el)}
                style={{
                  ...styles.commentItem,
                  marginTop: index > 0 ? '22px' : '0'
                }}
              >
                <div style={{ ...styles.avatar, background: msg.avatarBg }}>
                  <span style={{ fontSize: '21px' }}>{msg.emoji}</span>
                </div>
                <div style={styles.commentBody}>
                  <div style={styles.authorMeta}>
                    <span style={styles.authorName}>{msg.author}</span>
                    <span style={msg.time === 'just now' ? styles.timeBadge : styles.timeAgo}>
                      {msg.time}
                    </span>
                  </div>
                  <p style={styles.commentText}>{msg.text}</p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div style={styles.typingIndicatorRow}>
                <div style={{ ...styles.avatar, background: '#ffedd5' }}>
                  <span style={{ fontSize: '19px' }}>🧢</span>
                </div>
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
          <div style={{ ...styles.avatarSmall, background: '#fce7f3' }}>
            <span style={{ fontSize: '19px' }}>👩🏽</span>
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
              background: isInputActive ? '#ccff00' : '#e2e8f0',
              color: isInputActive ? '#0f172a' : '#94a3b8',
              cursor: isInputActive ? 'pointer' : 'default',
              boxShadow: isInputActive ? '0 4px 18px rgba(204, 255, 0, 0.55)' : 'none'
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
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    userSelect: 'none',
    padding: '24px'
  },
  widgetWrapper: {
    width: '100%',
    maxWidth: '510px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  commentCard: {
    background: '#ffffff',
    borderRadius: '28px',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    boxShadow: '0 16px 40px -8px rgba(0, 0, 0, 0.07), 0 4px 12px rgba(0, 0, 0, 0.02)',
    padding: '22px 26px 26px 26px',
    overflow: 'hidden',
    transition: 'box-shadow 0.45s ease'
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
    fontSize: '17px',
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: '-0.01em'
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  iconBtn: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.15s ease'
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
  avatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  avatarSmall: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginLeft: '4px'
  },
  commentBody: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  authorMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  authorName: {
    fontSize: '16.5px',
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: '-0.01em'
  },
  timeAgo: {
    fontSize: '14.5px',
    fontWeight: '500',
    color: '#94a3b8'
  },
  timeBadge: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
    background: '#f1f5f9',
    padding: '2px 9px',
    borderRadius: '999px'
  },
  commentText: {
    fontSize: '16px',
    lineHeight: '1.45',
    fontWeight: '500',
    color: '#334155',
    letterSpacing: '-0.01em',
    marginTop: '2px'
  },
  typingIndicatorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginTop: '22px'
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
    height: '58px',
    background: '#ffffff',
    borderRadius: '999px',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.02)',
    padding: '6px 6px 6px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  replyInput: {
    flex: 1,
    height: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '16px',
    fontWeight: '500',
    color: '#0f172a',
    letterSpacing: '-0.01em'
  },
  sendBtn: {
    height: '46px',
    padding: '0 26px',
    borderRadius: '999px',
    border: 'none',
    outline: 'none',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '15.5px',
    fontWeight: '800',
    letterSpacing: '-0.01em',
    transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
  }
};
