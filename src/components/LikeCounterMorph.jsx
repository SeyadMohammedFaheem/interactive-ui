import React, { useState, useRef } from 'react';

// Web Audio API pop & chime sounds
const playLikeSound = (isLiking) => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (isLiking) {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.11);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  } catch (e) {}
};

export default function LikeCounterMorph() {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(1300);
  const [heartAnim, setHeartAnim] = useState(false); // trigger pop scale
  const [particles, setParticles] = useState([]);
  const [floatingHearts, setFloatingHearts] = useState([]);
  const pillRef = useRef(null);

  const triggerLike = (e) => {
    e.stopPropagation();
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikeCount((prev) => (nextLiked ? prev + 1 : prev - 1));
    playLikeSound(nextLiked);

    if (nextLiked) {
      setHeartAnim(true);
      setTimeout(() => setHeartAnim(false), 500);

      // Generate burst particles
      const newParticles = Array.from({ length: 12 }, (_, i) => {
        const angle = (i * 360) / 12 + (Math.random() * 20 - 10);
        const rad = (angle * Math.PI) / 180;
        const dist = 28 + Math.random() * 18;
        return {
          id: Math.random(),
          x: Math.cos(rad) * dist,
          y: Math.sin(rad) * dist,
          color: ['#ff2b56', '#ff708f', '#ff9472', '#ffd166', '#a06cd5'][i % 5],
          size: 4 + Math.random() * 3
        };
      });
      setParticles(newParticles);
      setTimeout(() => setParticles([]), 700);

      // Floating heart effect
      const newFloating = {
        id: Math.random(),
        offsetX: (Math.random() - 0.5) * 30
      };
      setFloatingHearts((prev) => [...prev, newFloating]);
      setTimeout(() => {
        setFloatingHearts((prev) => prev.filter((h) => h.id !== newFloating.id));
      }, 1000);
    }
  };

  // Split number into digits for rolling digit odometer effect
  const formattedNumber = likeCount.toLocaleString();

  return (
    <div style={styles.stage}>
      {/* Floating Hearts stream */}
      {floatingHearts.map((h) => (
        <div
          key={h.id}
          style={{
            ...styles.floatingHeart,
            left: `calc(50% + ${h.offsetX}px)`
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#ff2b56">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      ))}

      {/* Main Pill Button */}
      <button
        ref={pillRef}
        className="like-pill-btn"
        style={styles.pillButton}
        onClick={triggerLike}
        title={isLiked ? 'Unlike' : 'Like'}
      >
        {/* Heart Container with Burst Particles */}
        <div style={styles.heartContainer}>
          {/* Particles Explosion */}
          {particles.map((p) => (
            <span
              key={p.id}
              style={{
                ...styles.particle,
                backgroundColor: p.color,
                width: `${p.size}px`,
                height: `${p.size}px`,
                '--tx': `${p.x}px`,
                '--ty': `${p.y}px`
              }}
            />
          ))}

          {/* Morphing Heart SVG */}
          <div
            style={{
              ...styles.heartIconWrapper,
              transform: heartAnim ? 'scale(1.35)' : 'scale(1)',
              transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.4)'
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={isLiked ? '#ff2b56' : 'none'}
              stroke={isLiked ? '#ff2b56' : '#18181b'}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transition: 'fill 0.22s ease, stroke 0.22s ease',
                display: 'block'
              }}
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
        </div>

        {/* Counter with Odometer Tick Transition */}
        <div style={styles.counterRow}>
          {formattedNumber.split('').map((char, index) => {
            const isLastDigit = index === formattedNumber.length - 1;
            return (
              <span
                key={`${index}-${char}`}
                style={{
                  ...styles.digitChar,
                  animation: isLastDigit && heartAnim ? 'digitRoll 0.36s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
                  color: isLiked ? '#18181b' : '#18181b'
                }}
              >
                {char}
              </span>
            );
          })}
        </div>
      </button>

      {/* Global CSS for particle burst and digit roll */}
      <style>{`
        @keyframes digitRoll {
          0% {
            transform: translateY(12px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes burstParticle {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(var(--tx), var(--ty)) scale(0);
          }
        }
        @keyframes floatUpFade {
          0% {
            transform: translateY(0) scale(0.7);
            opacity: 1;
          }
          100% {
            transform: translateY(-75px) scale(1.2);
            opacity: 0;
          }
        }
        .like-pill-btn:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04);
        }
        .like-pill-btn:active {
          transform: translateY(0) scale(0.96);
        }
      `}</style>
    </div>
  );
}

const styles = {
  stage: {
    width: '100%',
    height: '100%',
    minHeight: '260px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    position: 'relative',
    userSelect: 'none'
  },
  pillButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#ffffff',
    border: 'none',
    borderRadius: '999px',
    padding: '14px 28px',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
    transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease',
    outline: 'none',
    position: 'relative'
  },
  heartContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px'
  },
  heartIconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    willChange: 'transform'
  },
  particle: {
    position: 'absolute',
    borderRadius: '50%',
    pointerEvents: 'none',
    opacity: 0,
    animation: 'burstParticle 0.65s cubic-bezier(0.25, 1, 0.5, 1) forwards'
  },
  counterRow: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '20px',
    fontWeight: '600',
    color: '#18181b',
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '-0.02em',
    lineHeight: 1
  },
  digitChar: {
    display: 'inline-block'
  },
  floatingHeart: {
    position: 'absolute',
    bottom: '50%',
    pointerEvents: 'none',
    animation: 'floatUpFade 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    zIndex: 20
  }
};
