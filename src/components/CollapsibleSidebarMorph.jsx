import React, { useState, useRef, useEffect, useCallback } from 'react';

// Delicate haptic click sounds
const playSidebarSound = (type = 'click') => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'collapse') {
      const now = ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.08);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.11);
    } else if (type === 'expand') {
      const now = ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.08);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.11);
    } else {
      const now = ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(620, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.045);
    }
  } catch (e) {}
};

const NAV_ITEMS = [
  {
    id: 'home',
    label: 'Home',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    )
  },
  {
    id: 'inbox',
    label: 'Inbox',
    badge: 3,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
        <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
      </svg>
    )
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    )
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="3" ry="3" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    )
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="6" />
        <circle cx="8" cy="12" r="2.5" fill="currentColor" />
      </svg>
    )
  }
];

export default function CollapsibleSidebarMorph({
  auto = false,
  speed = 4,
  sound = true,
  theme = 'Light'
}) {
  const [activeId, setActiveId] = useState('home');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [brandName, setBrandName] = useState('Linear');
  const [isEditingName, setIsEditingName] = useState(false);

  const cardRef = useRef(null);
  const nameInputRef = useRef(null);

  // Toggle Collapse / Expand
  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      if (sound) playSidebarSound(next ? 'collapse' : 'expand');
      return next;
    });
  }, [sound]);

  // Handle Tab Select
  const handleSelectTab = (id) => {
    if (sound && activeId !== id) playSidebarSound('click');
    setActiveId(id);
  };

  // Autoplay cycle
  useEffect(() => {
    if (!auto) return;
    const interval = setInterval(() => {
      setActiveId((curr) => {
        const idx = NAV_ITEMS.findIndex((n) => n.id === curr);
        const nextIdx = (idx + 1) % NAV_ITEMS.length;
        if (sound) playSidebarSound('click');
        return NAV_ITEMS[nextIdx].id;
      });
    }, (1000 / Math.max(1, speed)) * 6);

    return () => clearInterval(interval);
  }, [auto, speed, sound]);

  // 3D perspective mouse tilt
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseTilt({ x: x * 6, y: -y * 6 });
  };

  const handleMouseLeave = () => {
    setMouseTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div style={styles.stage}>
      {/* Floating Sidebar Card */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          ...styles.card,
          width: isCollapsed ? '66px' : '224px',
          transform: `perspective(1000px) rotateX(${mouseTilt.y}deg) rotateY(${mouseTilt.x}deg) scale(${isHovered ? 1.012 : 1})`,
          transition: 'width 0.32s cubic-bezier(0.16, 1, 0.3, 1), transform 0.22s ease, box-shadow 0.22s ease'
        }}
      >
        {/* Workspace Brand Header */}
        <div
          style={{
            ...styles.brandRow,
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            paddingLeft: isCollapsed ? '0' : '10px'
          }}
          title={isEditingName ? 'Type brand name and press Enter' : `Workspace: ${brandName} (Click to rename)`}
        >
          {/* Sunset Orange Sphere Logo */}
          <div style={styles.brandLogo} />

          {/* Brand Name (Fades out when collapsed, editable on click) */}
          {isEditingName && !isCollapsed ? (
            <input
              ref={nameInputRef}
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape') {
                  setIsEditingName(false);
                }
              }}
              style={{
                ...styles.brandInput,
                marginLeft: '10px'
              }}
              autoFocus
            />
          ) : (
            <span
              onClick={(e) => {
                if (!isCollapsed) {
                  e.stopPropagation();
                  setIsEditingName(true);
                }
              }}
              style={{
                ...styles.brandName,
                opacity: isCollapsed ? 0 : 1,
                maxWidth: isCollapsed ? '0' : '130px',
                marginLeft: isCollapsed ? '0' : '10px',
                cursor: isCollapsed ? 'default' : 'pointer'
              }}
              title="Click to rename"
            >
              {brandName}
            </span>
          )}
        </div>

        {/* Navigation Items List */}
        <div style={styles.navList}>
          {NAV_ITEMS.map((item) => {
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                style={{
                  ...styles.navItem,
                  background: isActive ? '#f4f4f5' : 'transparent',
                  color: isActive ? '#18181b' : '#71717a',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  padding: isCollapsed ? '10px 0' : '10px 14px'
                }}
                title={item.label}
              >
                {/* Icon */}
                <span
                  style={{
                    ...styles.itemIcon,
                    color: isActive ? '#18181b' : '#71717a'
                  }}
                >
                  {item.icon}
                </span>

                {/* Label & Badge */}
                {!isCollapsed && (
                  <div style={styles.labelContainer}>
                    <span
                      style={{
                        ...styles.itemLabel,
                        fontWeight: isActive ? '700' : '500',
                        color: isActive ? '#18181b' : '#71717a'
                      }}
                    >
                      {item.label}
                    </span>

                    {/* Red Notification Badge (Inbox 3) */}
                    {item.badge && (
                      <span style={styles.redBadge}>{item.badge}</span>
                    )}
                  </div>
                )}

                {/* Compact dot for badge when collapsed */}
                {isCollapsed && item.badge && (
                  <span style={styles.collapsedBadgeDot} />
                )}
              </button>
            );
          })}
        </div>

        {/* Divider Line */}
        <div style={styles.divider} />

        {/* Bottom Collapse Action Button */}
        <button
          onClick={toggleCollapse}
          style={{
            ...styles.collapseBtn,
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            padding: isCollapsed ? '10px 0' : '10px 14px'
          }}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {/* Collapse Icon */}
          <span style={styles.itemIcon}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#71717a"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: isCollapsed ? 'scaleX(-1)' : 'none',
                transition: 'transform 0.25s ease'
              }}
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 3v18" />
            </svg>
          </span>

          {/* Label */}
          <span
            style={{
              ...styles.itemLabel,
              opacity: isCollapsed ? 0 : 1,
              maxWidth: isCollapsed ? '0' : '100px',
              marginLeft: isCollapsed ? '0' : '12px',
              fontWeight: '500',
              color: '#71717a'
            }}
          >
            Collapse
          </span>
        </button>
      </div>
    </div>
  );
}

const styles = {
  stage: {
    width: '100%',
    height: '100%',
    minHeight: '460px',
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
    background: '#ffffff',
    borderRadius: '24px',
    padding: '16px 12px',
    boxSizing: 'border-box',
    boxShadow: '0 18px 45px -10px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.02)',
    border: '1px solid rgba(0, 0, 0, 0.04)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Plus Jakarta Sans', sans-serif"
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    height: '36px',
    marginBottom: '10px',
    overflow: 'hidden',
    boxSizing: 'border-box'
  },
  brandLogo: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'radial-gradient(circle at 35% 30%, #fb923c 0%, #f97316 48%, #ea580c 80%, #c2410c 100%)',
    boxShadow: '0 3px 8px rgba(249, 115, 22, 0.35)',
    flexShrink: 0
  },
  brandName: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#18181b',
    letterSpacing: '-0.02em',
    whiteSpace: 'nowrap',
    transition: 'opacity 0.2s ease, max-width 0.25s ease, margin 0.25s ease'
  },
  brandInput: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#18181b',
    letterSpacing: '-0.02em',
    background: '#f4f4f5',
    border: '1px solid #e4e4e7',
    borderRadius: '6px',
    padding: '2px 6px',
    outline: 'none',
    width: '110px',
    fontFamily: "'Plus Jakarta Sans', sans-serif"
  },
  navList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px'
  },
  navItem: {
    width: '100%',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
    transition: 'background 0.16s ease, color 0.16s ease'
  },
  itemIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    flexShrink: 0
  },
  labelContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    marginLeft: '12px',
    overflow: 'hidden'
  },
  itemLabel: {
    fontSize: '14px',
    letterSpacing: '-0.01em',
    whiteSpace: 'nowrap',
    transition: 'opacity 0.2s ease, max-width 0.25s ease, margin 0.25s ease'
  },
  redBadge: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
    boxShadow: '0 2px 5px rgba(239, 68, 68, 0.4)'
  },
  collapsedBadgeDot: {
    position: 'absolute',
    top: '8px',
    right: '16px',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#ef4444'
  },
  divider: {
    width: '100%',
    height: '1px',
    backgroundColor: '#f4f4f5',
    margin: '10px 0'
  },
  collapseBtn: {
    width: '100%',
    borderRadius: '12px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
    transition: 'background 0.15s ease'
  }
};
