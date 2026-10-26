import React, { useState, useRef, useEffect } from 'react';

// Delicate haptic audio clicks
const playFollowAudio = (type = 'follow') => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'follow') {
      const now = ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.045, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);
    } else {
      const now = ctx.currentTime;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.09);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.11);
    }
  } catch (e) {}
};

export default function ProfileCardMorph({
  auto = false,
  speed = 4,
  sound = true,
  theme = 'Light'
}) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isHoveredBtn, setIsHoveredBtn] = useState(false);
  const [followersCount, setFollowersCount] = useState(1284);
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });
  const [isCardHovered, setIsCardHovered] = useState(false);

  const cardRef = useRef(null);

  // Toggle follow status
  const handleToggleFollow = (e) => {
    if (e) e.stopPropagation();
    setIsFollowing((prev) => {
      const next = !prev;
      setFollowersCount((count) => (next ? count + 1 : count - 1));
      if (sound) playFollowAudio(next ? 'follow' : 'unfollow');
      return next;
    });
  };

  // Autoplay support
  useEffect(() => {
    if (!auto) return;
    const interval = setInterval(() => {
      setIsFollowing((prev) => {
        const next = !prev;
        setFollowersCount((count) => (next ? count + 1 : count - 1));
        if (sound) playFollowAudio(next ? 'follow' : 'unfollow');
        return next;
      });
    }, (1000 / Math.max(1, speed)) * 8);

    return () => clearInterval(interval);
  }, [auto, speed, sound]);

  // Subtle 3D tilt tracking
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseTilt({ x: x * 6, y: -y * 6 });
  };

  const handleMouseLeave = () => {
    setMouseTilt({ x: 0, y: 0 });
    setIsCardHovered(false);
  };

  return (
    <div style={styles.stage}>
      {/* Profile Card Container */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsCardHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          ...styles.card,
          transform: `perspective(1000px) rotateX(${mouseTilt.y}deg) rotateY(${mouseTilt.x}deg) scale(${isCardHovered ? 1.012 : 1})`,
          transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s ease'
        }}
      >
        {/* Top Header Row: 3D Gradient Avatar & Follow Button */}
        <div style={styles.topRow}>
          {/* Iridescent 3D Gradient Sphere Avatar (Matching screenshot) */}
          <div style={styles.avatarWrapper}>
            <div style={styles.avatarSphere} />
          </div>

          {/* Morphing Follow / Following Button */}
          <button
            onClick={handleToggleFollow}
            onMouseEnter={() => setIsHoveredBtn(true)}
            onMouseLeave={() => setIsHoveredBtn(false)}
            style={{
              ...styles.followBtn,
              background: isFollowing
                ? isHoveredBtn
                  ? '#fee2e2'
                  : '#f4f4f5'
                : '#18191f',
              color: isFollowing
                ? isHoveredBtn
                  ? '#ef4444'
                  : '#18181b'
                : '#ffffff',
              border: isFollowing
                ? isHoveredBtn
                  ? '1.5px solid #fca5a5'
                  : '1.5px solid #e4e4e7'
                : '1.5px solid transparent'
            }}
            title={isFollowing ? 'Click to unfollow' : 'Click to follow'}
          >
            {isFollowing ? (
              isHoveredBtn ? (
                'Unfollow'
              ) : (
                <span style={styles.followingContent}>
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ marginRight: '5px' }}
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Following
                </span>
              )
            ) : (
              'Follow'
            )}
          </button>
        </div>

        {/* Identity Details */}
        <div style={styles.identitySection}>
          <h2 style={styles.fullName}>Mara Lindqvist</h2>
          <span style={styles.handle}>@maralind</span>
        </div>

        {/* Bio Text (Exact wording from screenshot) */}
        <p style={styles.bioText}>
          Designing motion at a small studio in Lisbon. Springs over curves, always.
        </p>

        {/* Social Metrics Counter Row */}
        <div style={styles.statsRow}>
          <div style={styles.statItem}>
            <span style={styles.statNumber}>312</span>
            <span style={styles.statLabel}>Following</span>
          </div>

          <div style={styles.statItem}>
            <span style={styles.statNumber}>
              {followersCount.toLocaleString()}
            </span>
            <span style={styles.statLabel}>Followers</span>
          </div>
        </div>

        {/* Mutual Followers Social Proof Row */}
        <div style={styles.mutualsRow}>
          {/* Two overlapping gradient micro-avatars */}
          <div style={styles.miniAvatarsCluster}>
            <div style={styles.miniAvatarPink} />
            <div style={styles.miniAvatarCoral} />
          </div>

          <span style={styles.mutualsText}>Followed by Kai and Inês</span>
        </div>
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
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    position: 'relative',
    userSelect: 'none',
    boxSizing: 'border-box',
    padding: '24px'
  },
  card: {
    width: '316px',
    maxWidth: '92vw',
    background: '#ffffff',
    borderRadius: '28px',
    padding: '24px',
    boxSizing: 'border-box',
    boxShadow: '0 16px 42px -10px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.02)',
    border: '1px solid rgba(0, 0, 0, 0.04)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    fontFamily: "'Plus Jakarta Sans', sans-serif"
  },
  topRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%'
  },
  avatarWrapper: {
    width: '54px',
    height: '54px',
    borderRadius: '50%',
    position: 'relative',
    flexShrink: 0
  },
  avatarSphere: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    // High-fidelity 3D sphere gradient matching screenshot
    background: 'radial-gradient(circle at 36% 32%, #38bdf8 0%, #2563eb 42%, #4f46e5 72%, #7c3aed 100%)',
    boxShadow: '0 8px 22px -4px rgba(37, 99, 235, 0.42), inset -4px -4px 8px rgba(0, 0, 0, 0.22), inset 3px 3px 6px rgba(255, 255, 255, 0.45)',
    transition: 'transform 0.2s ease'
  },
  followBtn: {
    borderRadius: '999px',
    padding: '7.5px 20px',
    fontSize: '13.5px',
    fontWeight: '700',
    letterSpacing: '-0.01em',
    cursor: 'pointer',
    outline: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    minWidth: '82px'
  },
  followingContent: {
    display: 'inline-flex',
    alignItems: 'center'
  },
  identitySection: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '14px',
    gap: '2px'
  },
  fullName: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#18181b',
    letterSpacing: '-0.02em',
    lineHeight: 1.25
  },
  handle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#71717a',
    letterSpacing: '-0.01em'
  },
  bioText: {
    margin: '12px 0 16px 0',
    fontSize: '14px',
    fontWeight: '500',
    color: '#52525b',
    lineHeight: 1.48,
    letterSpacing: '-0.01em'
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px'
  },
  statItem: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '5px'
  },
  statNumber: {
    fontSize: '14.5px',
    fontWeight: '700',
    color: '#18181b',
    fontVariantNumeric: 'tabular-nums'
  },
  statLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#71717a'
  },
  mutualsRow: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: '2px'
  },
  miniAvatarsCluster: {
    display: 'flex',
    alignItems: 'center',
    marginRight: '8px'
  },
  miniAvatarPink: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
    border: '2px solid #ffffff',
    boxSizing: 'border-box',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  miniAvatarCoral: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
    border: '2px solid #ffffff',
    marginLeft: '-6px',
    boxSizing: 'border-box',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  mutualsText: {
    fontSize: '12.5px',
    fontWeight: '500',
    color: '#71717a',
    letterSpacing: '-0.01em'
  }
};
