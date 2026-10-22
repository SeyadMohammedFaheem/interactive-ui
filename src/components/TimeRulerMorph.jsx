import React, { useState, useRef, useEffect, useCallback } from 'react';

// Delicate high-precision mechanical tick sound via Web Audio API
const playTickSound = (isMajor = false) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isMajor ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(isMajor ? 880 : 1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + (isMajor ? 0.05 : 0.03));

    gain.gain.setValueAtTime(isMajor ? 0.06 : 0.035, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (isMajor ? 0.05 : 0.03));

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  } catch (e) {
    // Ignore audio restriction
  }
};

// Configuration
const PIXELS_PER_5MIN = 10; // 10px per 5-min tick
const PIXELS_PER_HOUR = PIXELS_PER_5MIN * 12; // 120px per hour
const START_HOUR = 6;  // 6 AM
const END_HOUR = 22;   // 10 PM
const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60;

export default function TimeRulerMorph({
  auto = false,
  speed = 4,
  sound = true,
  theme = 'Light'
}) {
  // Initial time: 9:30 AM (matching reference screenshot)
  const initialTotalMinutes = (9 - START_HOUR) * 60 + 30; // 210 minutes from 6 AM
  const [currentMinutes, setCurrentMinutes] = useState(initialTotalMinutes);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef(null);
  const startXRef = useRef(0);
  const startMinutesRef = useRef(initialTotalMinutes);
  const lastSoundMinuteRef = useRef(initialTotalMinutes);
  const autoAnimRef = useRef(null);
  const autoDirRef = useRef(1);

  // Convert total minutes from START_HOUR into display time string
  const formatTimeDisplay = (minsFromStart) => {
    const totalMins = START_HOUR * 60 + minsFromStart;
    let hours24 = Math.floor(totalMins / 60) % 24;
    const mins = Math.floor(totalMins % 60);

    const isPM = hours24 >= 12;
    let hours12 = hours24 % 12;
    if (hours12 === 0) hours12 = 12;

    const formattedMins = mins < 10 ? `0${mins}` : `${mins}`;
    const period = isPM ? 'PM' : 'AM';

    return {
      time: `${hours12}:${formattedMins}`,
      period
    };
  };

  // Drag logic
  const handlePointerDown = (e) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    startMinutesRef.current = currentMinutes;

    if (e.target.setPointerCapture) {
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startXRef.current;
    // Moving finger right drags ruler right, which decreases time (earlier); finger left moves forward
    const deltaMins = (-deltaX / PIXELS_PER_5MIN) * 5;
    const newMins = Math.max(0, Math.min(TOTAL_MINUTES, startMinutesRef.current + deltaMins));
    setCurrentMinutes(newMins);

    // Snap sound check every 5 minutes
    const rounded5 = Math.round(newMins / 5) * 5;
    if (sound && rounded5 !== lastSoundMinuteRef.current) {
      const isHour = (START_HOUR * 60 + rounded5) % 60 === 0;
      playTickSound(isHour);
      lastSoundMinuteRef.current = rounded5;
    }
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    // Smooth magnetic snap to closest 5 minutes
    const snapped = Math.round(currentMinutes / 5) * 5;
    setCurrentMinutes(snapped);
  };

  // Autoplay demonstration scroll
  useEffect(() => {
    if (!auto || isDragging) {
      if (autoAnimRef.current) cancelAnimationFrame(autoAnimRef.current);
      return;
    }

    let current = currentMinutes;
    let lastTime = performance.now();

    const loop = (now) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      const rate = (60 / Math.max(1, speed || 4)) * autoDirRef.current;
      current += rate * delta;

      const minBound = (8 - START_HOUR) * 60; // 8:00 AM
      const maxBound = (11 - START_HOUR) * 60; // 11:00 AM

      if (current >= maxBound) {
        current = maxBound;
        autoDirRef.current = -1;
      } else if (current <= minBound) {
        current = minBound;
        autoDirRef.current = 1;
      }

      setCurrentMinutes(current);

      const rounded5 = Math.round(current / 5) * 5;
      if (sound && rounded5 !== lastSoundMinuteRef.current) {
        const isHour = (START_HOUR * 60 + rounded5) % 60 === 0;
        playTickSound(isHour);
        lastSoundMinuteRef.current = rounded5;
      }

      autoAnimRef.current = requestAnimationFrame(loop);
    };

    autoAnimRef.current = requestAnimationFrame(loop);

    return () => {
      if (autoAnimRef.current) cancelAnimationFrame(autoAnimRef.current);
    };
  }, [auto, speed, isDragging, currentMinutes, sound]);

  // Center alignment: ruler offset so currentMinutes aligns directly under the red needle
  const rulerOffset = -(currentMinutes / 5) * PIXELS_PER_5MIN;
  const timeData = formatTimeDisplay(currentMinutes);

  // Generate tick marks
  const totalTicks = (TOTAL_MINUTES / 5) + 1;
  const ticks = [];
  for (let i = 0; i < totalTicks; i++) {
    const minsFromStart = i * 5;
    const currentAbsHour = START_HOUR + Math.floor(minsFromStart / 60);
    const minuteInHour = minsFromStart % 60;

    const isHour = minuteInHour === 0;
    const isHalfHour = minuteInHour === 30;
    const isQuarterHour = minuteInHour === 15 || minuteInHour === 45;

    let height = 10;
    let color = '#d4d4d8';
    let width = 1.4;

    if (isHour) {
      height = 22;
      color = '#18181b';
      width = 2.0;
    } else if (isHalfHour) {
      height = 17;
      color = '#18181b';
      width = 1.6;
    } else if (isQuarterHour) {
      height = 13;
      color = '#71717a';
      width = 1.4;
    } else {
      height = 10;
      color = '#a1a1aa';
      width = 1.2;
    }

    // Label for hour
    let hourLabel = null;
    if (isHour) {
      let displayHour = currentAbsHour % 12;
      if (displayHour === 0) displayHour = 12;
      const period = currentAbsHour >= 12 ? 'PM' : 'AM';
      hourLabel = `${displayHour} ${period}`;
    }

    ticks.push({
      index: i,
      x: i * PIXELS_PER_5MIN,
      height,
      color,
      width,
      hourLabel
    });
  }

  return (
    <div style={styles.stage}>
      {/* Time Picker Pure White Card */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
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
          <div style={styles.redNeedle} />

          {/* Sliding Ruler Strip */}
          <div
            style={{
              ...styles.rulerTrack,
              transform: `translate3d(${rulerOffset}px, 0, 0)`,
              transition: isDragging ? 'none' : 'transform 0.12s ease-out'
            }}
          >
            {ticks.map((t) => (
              <div
                key={t.index}
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

          {/* Gradient fade overlay on left and right edges */}
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
    height: '175px',
    borderRadius: '32px',
    backgroundColor: '#ffffff',
    boxShadow: '0 16px 40px -8px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.03)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px 24px 18px 24px',
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid rgba(0, 0, 0, 0.04)'
  },
  timeHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: '14px',
    lineHeight: '1'
  },
  timeDigits: {
    fontSize: '40px',
    fontWeight: '700',
    color: '#18181b',
    letterSpacing: '-0.03em',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif"
  },
  periodText: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#71717a',
    letterSpacing: '0.01em',
    marginLeft: '6px',
    marginTop: '4px',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif"
  },
  rulerContainer: {
    position: 'relative',
    width: '100%',
    height: '62px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  redNeedle: {
    position: 'absolute',
    left: '50%',
    top: '4px',
    width: '2.5px',
    height: '24px',
    borderRadius: '999px',
    backgroundColor: '#ef4444',
    transform: 'translateX(-50%)',
    zIndex: 10,
    pointerEvents: 'none',
    boxShadow: '0 0 6px rgba(239, 68, 68, 0.4)'
  },
  rulerTrack: {
    position: 'absolute',
    left: '50%',
    top: '6px',
    height: '52px',
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
    borderRadius: '999px',
    transition: 'background-color 0.1s ease'
  },
  hourLabel: {
    position: 'absolute',
    top: '28px',
    fontSize: '12.5px',
    fontWeight: '600',
    color: '#71717a',
    whiteSpace: 'nowrap',
    letterSpacing: '-0.01em',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"
  },
  gradientFadeLeft: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '42px',
    background: 'linear-gradient(to right, #ffffff 15%, rgba(255, 255, 255, 0) 100%)',
    pointerEvents: 'none',
    zIndex: 5
  },
  gradientFadeRight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: '42px',
    background: 'linear-gradient(to left, #ffffff 15%, rgba(255, 255, 255, 0) 100%)',
    pointerEvents: 'none',
    zIndex: 5
  }
};
