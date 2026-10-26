import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';

// Singleton shared AudioContext to prevent frame-drops and garbage collection lag
let sharedAudioCtx = null;
const getAudioContext = () => {
  try {
    if (!sharedAudioCtx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        sharedAudioCtx = new AudioCtx();
      }
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume();
    }
    return sharedAudioCtx;
  } catch (e) {
    return null;
  }
};

// Subtle, tactile mechanical tick sound
const playTickSound = (isMajor = false) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const t = ctx.currentTime;
    osc.type = isMajor ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(isMajor ? 920 : 1350, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.025);

    gain.gain.setValueAtTime(isMajor ? 0.045 : 0.022, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.03);
  } catch (e) {
    // Ignore audio restrictions
  }
};

// Dimensions & Physics Constants: Infinite 24-Hour Continuous Spin Round
const PIXELS_PER_5MIN = 16; // 16px per 5-min tick gives ideal tactile breathing room
const MINUTES_IN_DAY = 1440; // Full 24 Hours (24 * 60)

export default function TimeRulerMorph({
  auto = false,
  speed = 4,
  sound = true,
  theme = 'Light'
}) {
  // Initial time: 8:55 AM (8 * 60 + 55 = 535 mins)
  const initialMinutes = 8 * 60 + 55;
  const [currentMinutes, setCurrentMinutes] = useState(initialMinutes);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef(null);
  const minutesRef = useRef(initialMinutes);
  minutesRef.current = currentMinutes;

  const lastSoundMinuteRef = useRef(initialMinutes);
  const animFrameRef = useRef(null);
  const autoAnimRef = useRef(null);
  const wheelTimeoutRef = useRef(null);

  // Velocity tracking for organic momentum / fling
  const velocityTrackerRef = useRef({
    lastX: 0,
    lastTime: 0,
    vx: 0 // px per ms
  });

  const startXRef = useRef(0);
  const startMinutesRef = useRef(initialMinutes);

  // Play haptic tick sound when passing a 5-minute mark across all 24 hours
  const checkTickSound = useCallback((mins) => {
    if (!sound) return;
    const rounded5 = Math.round(mins / 5) * 5;
    if (rounded5 !== lastSoundMinuteRef.current) {
      const normalized = ((rounded5 % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY;
      const isHour = normalized % 60 === 0;
      playTickSound(isHour);
      lastSoundMinuteRef.current = rounded5;
    }
  }, [sound]);

  // Format digital readout (tabular numerals) for continuous 24-hr round cycle
  const timeData = useMemo(() => {
    const rounded5 = Math.round(currentMinutes / 5) * 5;
    const normalizedMins = ((rounded5 % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY;
    const hours24 = Math.floor(normalizedMins / 60);
    const mins = normalizedMins % 60;

    const isPM = hours24 >= 12;
    let hours12 = hours24 % 12;
    if (hours12 === 0) hours12 = 12;

    const formattedMins = mins < 10 ? `0${mins}` : `${mins}`;
    const period = isPM ? 'PM' : 'AM';

    return {
      time: `${hours12}:${formattedMins}`,
      period
    };
  }, [currentMinutes]);

  // Dynamic Virtualized Tick Window for infinite round spin without hard stops
  const centerIndex = Math.floor(currentMinutes / 5);
  const ticks = useMemo(() => {
    const list = [];
    const radius = 26; // 53 ticks total (~850px buffer, effortlessly covers the 320px viewport)
    for (let offset = -radius; offset <= radius; offset++) {
      const tickIndex = centerIndex + offset;
      const minsAtTick = tickIndex * 5;
      const normalized = ((minsAtTick % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY;
      const hour24 = Math.floor(normalized / 60);
      const minuteInHour = normalized % 60;

      const isHour = minuteInHour === 0;
      const isHalfHour = minuteInHour === 30;
      const isQuarterHour = minuteInHour === 15 || minuteInHour === 45;

      let height = 10;
      let color = '#a1a1aa';
      let width = 1.2;

      if (isHour) {
        height = 22;
        color = '#18181b';
        width = 2.0;
      } else if (isHalfHour) {
        height = 16;
        color = '#3f3f46';
        width = 1.6;
      } else if (isQuarterHour) {
        height = 13;
        color = '#71717a';
        width = 1.4;
      }

      let hourLabel = null;
      if (isHour) {
        let displayHour = hour24 % 12;
        if (displayHour === 0) displayHour = 12;
        const period = hour24 >= 12 ? 'PM' : 'AM';
        hourLabel = `${displayHour} ${period}`;
      }

      list.push({
        key: tickIndex,
        x: tickIndex * PIXELS_PER_5MIN,
        height,
        color,
        width,
        hourLabel
      });
    }
    return list;
  }, [centerIndex]);

  // Smooth critically-damped spring to nearest 5 minutes with no boundary walls
  const springSnapTo = useCallback((targetMins, initialVelocityMins = 0) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const target = Math.round(targetMins / 5) * 5;
    let current = minutesRef.current;
    let vel = initialVelocityMins; // in minutes per second
    let lastTime = performance.now();

    const springLoop = (now) => {
      const dt = Math.min(0.032, (now - lastTime) / 1000);
      lastTime = now;

      // Spring constants
      const stiffness = 180;
      const damping = 24;

      const displacement = current - target;
      const springForce = -stiffness * displacement;
      const dampingForce = -damping * vel;
      const accel = springForce + dampingForce;

      vel += accel * dt;
      current += vel * dt;

      checkTickSound(current);
      setCurrentMinutes(current);

      if (Math.abs(displacement) < 0.15 && Math.abs(vel) < 0.8) {
        setCurrentMinutes(target);
        checkTickSound(target);
        animFrameRef.current = null;
        return;
      }

      animFrameRef.current = requestAnimationFrame(springLoop);
    };

    animFrameRef.current = requestAnimationFrame(springLoop);
  }, [checkTickSound]);

  // Inertial momentum animation: spins continuously through 24-hr cycle without stopping
  const startInertialFling = useCallback((launchVelocityPxMs) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    // Convert px/ms to minutes/second
    let vMinsSec = (-launchVelocityPxMs / PIXELS_PER_5MIN) * 5 * 1000;
    let current = minutesRef.current;
    let lastTime = performance.now();
    const friction = 0.94; // Apple-like scroll friction

    const momentumLoop = (now) => {
      const dt = Math.min(0.032, (now - lastTime) / 1000);
      lastTime = now;

      // Exponential decay
      vMinsSec *= Math.pow(friction, dt * 60);
      current += vMinsSec * dt;

      // Infinite round spin: never stops or hits walls!
      checkTickSound(current);
      setCurrentMinutes(current);

      // When momentum slows down, smoothly snap to nearest 5-min mark
      if (Math.abs(vMinsSec) < 22) {
        springSnapTo(current, vMinsSec);
        return;
      }

      animFrameRef.current = requestAnimationFrame(momentumLoop);
    };

    animFrameRef.current = requestAnimationFrame(momentumLoop);
  }, [checkTickSound, springSnapTo]);

  // Pointer Drag Handlers: Infinite continuous round drag
  const handlePointerDown = (e) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (autoAnimRef.current) cancelAnimationFrame(autoAnimRef.current);

    setIsDragging(true);
    startXRef.current = e.clientX;
    startMinutesRef.current = minutesRef.current;

    velocityTrackerRef.current = {
      lastX: e.clientX,
      lastTime: performance.now(),
      vx: 0
    };

    if (e.target.setPointerCapture) {
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;

    const now = performance.now();
    const dt = Math.max(1, now - velocityTrackerRef.current.lastTime);
    const dx = e.clientX - velocityTrackerRef.current.lastX;

    // Moving average velocity filter for silky smooth fling
    const instantVx = dx / dt;
    velocityTrackerRef.current.vx = velocityTrackerRef.current.vx * 0.45 + instantVx * 0.55;
    velocityTrackerRef.current.lastX = e.clientX;
    velocityTrackerRef.current.lastTime = now;

    const totalDeltaX = e.clientX - startXRef.current;
    const deltaMins = (-totalDeltaX / PIXELS_PER_5MIN) * 5;
    const targetMins = startMinutesRef.current + deltaMins;

    // Free round spin without any wall stop
    checkTickSound(targetMins);
    setCurrentMinutes(targetMins);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const releaseVx = velocityTrackerRef.current.vx;
    if (Math.abs(releaseVx) > 0.12) {
      startInertialFling(releaseVx);
    } else {
      springSnapTo(minutesRef.current);
    }
  };

  // Wheel & Trackpad scroll support: infinite continuous 24-hr spin
  const handleWheel = (e) => {
    e.preventDefault();
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    const deltaMins = (delta / PIXELS_PER_5MIN) * 2.8;

    const nextMins = minutesRef.current + deltaMins;
    checkTickSound(nextMins);
    setCurrentMinutes(nextMins);

    if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
    wheelTimeoutRef.current = setTimeout(() => {
      springSnapTo(minutesRef.current);
    }, 110);
  };

  // Autoplay demonstration: spins forward 24 hrs round continuously without stopping
  useEffect(() => {
    if (!auto || isDragging) {
      if (autoAnimRef.current) cancelAnimationFrame(autoAnimRef.current);
      return;
    }

    let current = minutesRef.current;
    let lastTime = performance.now();

    const loop = (now) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Steady continuous forward spin through all 24 hours
      const rate = 55 / Math.max(1, speed || 4);
      current += rate * dt;

      checkTickSound(current);
      setCurrentMinutes(current);

      autoAnimRef.current = requestAnimationFrame(loop);
    };

    autoAnimRef.current = requestAnimationFrame(loop);

    return () => {
      if (autoAnimRef.current) cancelAnimationFrame(autoAnimRef.current);
    };
  }, [auto, speed, isDragging, checkTickSound]);

  // Center alignment: ruler offset aligns currentMinutes directly under the fixed center needle
  const rulerOffset = -(currentMinutes / 5) * PIXELS_PER_5MIN;

  return (
    <div style={styles.stage}>
      {/* Time Picker Pure White Card */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        style={{
          ...styles.card,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        {/* Top Digital Time Readout */}
        <div style={styles.timeHeader}>
          <span style={styles.timeDigits}>{timeData.time}</span>
          <span style={styles.periodText}>{timeData.period}</span>
        </div>

        {/* Ruler Section with Fixed Center Needle */}
        <div style={styles.rulerContainer}>
          {/* Fixed Center Red Needle Indicator */}
          <div style={styles.redNeedle}>
            <div style={styles.redNeedleCap} />
          </div>

          {/* Sliding Ruler Strip with hardware accelerated translate3d */}
          <div
            style={{
              ...styles.rulerTrack,
              transform: `translate3d(${rulerOffset}px, 0, 0)`
            }}
          >
            {ticks.map((t) => (
              <div
                key={t.key}
                style={{
                  ...styles.tickWrapper,
                  left: `${t.x}px`
                }}
              >
                {/* Vertical tick mark */}
                <div
                  style={{
                    ...styles.tickBar,
                    height: `${t.height}px`,
                    backgroundColor: t.color,
                    width: `${t.width}px`
                  }}
                />

                {/* Major Hour Label below tick */}
                {t.hourLabel && (
                  <span style={styles.hourLabel}>
                    {t.hourLabel}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Optical Edge Gradient Fade */}
          <div style={styles.gradientFadeLeft} />
          <div style={styles.gradientFadeRight} />
        </div>
      </div>
    </div>
  );
}

const styles = {
  stage: {
    width: '100%',
    height: '100%',
    minHeight: '360px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    userSelect: 'none',
    touchAction: 'none',
    padding: '24px',
    boxSizing: 'border-box'
  },
  card: {
    width: '320px',
    height: '180px',
    borderRadius: '32px',
    backgroundColor: '#ffffff',
    boxShadow: '0 18px 42px -8px rgba(0, 0, 0, 0.08), 0 3px 12px rgba(0, 0, 0, 0.03)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '22px 24px 18px 24px',
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    willChange: 'transform'
  },
  timeHeader: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: '16px',
    lineHeight: '1'
  },
  timeDigits: {
    fontSize: '44px',
    fontWeight: '700',
    color: '#18181b',
    letterSpacing: '-0.035em',
    fontVariantNumeric: 'tabular-nums',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Plus Jakarta Sans', sans-serif"
  },
  periodText: {
    fontSize: '15.5px',
    fontWeight: '700',
    color: '#4f6b88',
    letterSpacing: '0.015em',
    marginLeft: '6px',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Plus Jakarta Sans', sans-serif"
  },
  rulerContainer: {
    position: 'relative',
    width: '100%',
    height: '66px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    maskImage: 'linear-gradient(to right, transparent, black 16%, black 84%, transparent)',
    WebkitMaskImage: 'linear-gradient(to right, transparent, black 16%, black 84%, transparent)'
  },
  redNeedle: {
    position: 'absolute',
    left: '50%',
    top: '2px',
    width: '2.5px',
    height: '26px',
    borderRadius: '999px',
    backgroundColor: '#ef4444',
    transform: 'translateX(-50%)',
    zIndex: 10,
    pointerEvents: 'none',
    boxShadow: '0 0 7px rgba(239, 68, 68, 0.5)'
  },
  redNeedleCap: {
    position: 'absolute',
    top: '-1px',
    left: '50%',
    width: '4.5px',
    height: '4.5px',
    borderRadius: '50%',
    backgroundColor: '#ef4444',
    transform: 'translateX(-50%)'
  },
  rulerTrack: {
    position: 'absolute',
    left: '50%',
    top: '4px',
    height: '56px',
    willChange: 'transform'
  },
  tickWrapper: {
    position: 'absolute',
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    transform: 'translateX(-50%)',
    pointerEvents: 'none'
  },
  tickBar: {
    borderRadius: '999px'
  },
  hourLabel: {
    position: 'absolute',
    top: '30px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#71717a',
    whiteSpace: 'nowrap',
    letterSpacing: '-0.01em',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Plus Jakarta Sans', sans-serif"
  },
  gradientFadeLeft: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '40px',
    background: 'linear-gradient(to right, #ffffff 15%, rgba(255, 255, 255, 0) 100%)',
    pointerEvents: 'none',
    zIndex: 5
  },
  gradientFadeRight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: '40px',
    background: 'linear-gradient(to left, #ffffff 15%, rgba(255, 255, 255, 0) 100%)',
    pointerEvents: 'none',
    zIndex: 5
  }
};
