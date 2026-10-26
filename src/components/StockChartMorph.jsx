import React, { useState, useRef, useMemo, useCallback } from 'react';

// Timeframe datasets with smooth spline points matching reference
const TIMEFRAMES = [
  {
    id: '1H',
    label: '1H',
    priceInteger: '$58,412',
    priceFraction: '.45',
    delta: '+342.10',
    percent: '0.6',
    time: '14:20',
    isPositive: true,
    // Smooth points for 1H view matching reference screenshot
    points: [
      { x: 10, y: 85 },
      { x: 50, y: 70 },
      { x: 90, y: 88 },
      { x: 130, y: 55 },
      { x: 170, y: 65 },
      { x: 210, y: 48 },
      { x: 250, y: 40 },
      { x: 290, y: 25 }
    ],
    defaultScrubberX: 112 // Position on the upward slope matching screenshot
  },
  {
    id: '4H',
    label: '4H',
    priceInteger: '$58,834',
    priceFraction: '.89',
    delta: '+1,204.60',
    percent: '2.1',
    time: '13:56',
    isPositive: true,
    points: [
      { x: 10, y: 88 },
      { x: 45, y: 68 },
      { x: 75, y: 92 },
      { x: 115, y: 64 },
      { x: 135, y: 74 },
      { x: 185, y: 58 },
      { x: 230, y: 52 },
      { x: 290, y: 32 }
    ],
    defaultScrubberX: 115
  },
  {
    id: '1D',
    label: '1D',
    priceInteger: '$59,620',
    priceFraction: '.15',
    delta: '+2,480.90',
    percent: '4.3',
    time: 'Yesterday',
    isPositive: true,
    points: [
      { x: 10, y: 95 },
      { x: 60, y: 82 },
      { x: 100, y: 72 },
      { x: 150, y: 60 },
      { x: 190, y: 48 },
      { x: 240, y: 38 },
      { x: 290, y: 18 }
    ],
    defaultScrubberX: 150
  }
];

// Build cubic Bezier spline segments matching Catmull-Rom formulation
function getSplineSegments(points) {
  if (!points || points.length < 2) return [];
  const segments = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    segments.push({
      p1,
      cp1: { x: cp1x, y: cp1y },
      cp2: { x: cp2x, y: cp2y },
      p2
    });
  }
  return segments;
}

// Generate smooth SVG cubic Bezier path from segments
function getSmoothPath(points) {
  const segments = getSplineSegments(points);
  if (segments.length === 0) return '';
  let d = `M ${segments[0].p1.x} ${segments[0].p1.y}`;
  for (const seg of segments) {
    d += ` C ${seg.cp1.x.toFixed(2)} ${seg.cp1.y.toFixed(2)}, ${seg.cp2.x.toFixed(2)} ${seg.cp2.y.toFixed(2)}, ${seg.p2.x.toFixed(2)} ${seg.p2.y.toFixed(2)}`;
  }
  return d;
}

// Evaluate cubic Bezier point at parameter t (0 <= t <= 1)
function evalCubicBezier(p1, cp1, cp2, p2, t) {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;

  return {
    x: mt3 * p1.x + 3 * mt2 * t * cp1.x + 3 * mt * t2 * cp2.x + t3 * p2.x,
    y: mt3 * p1.y + 3 * mt2 * t * cp1.y + 3 * mt * t2 * cp2.y + t3 * p2.y
  };
}

// Mathematically compute the EXACT point on the spline curve for any target X coordinate
function getPointAtX(points, targetX) {
  if (!points || points.length === 0) return { x: 0, y: 0 };
  const first = points[0];
  const last = points[points.length - 1];
  if (targetX <= first.x) return { x: first.x, y: first.y };
  if (targetX >= last.x) return { x: last.x, y: last.y };

  const segments = getSplineSegments(points);

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (targetX >= seg.p1.x && targetX <= seg.p2.x) {
      // High-precision binary search to locate parameter t for targetX
      let tLow = 0;
      let tHigh = 1;
      let tMid = 0.5;
      for (let iter = 0; iter < 14; iter++) {
        tMid = (tLow + tHigh) / 2;
        const pt = evalCubicBezier(seg.p1, seg.cp1, seg.cp2, seg.p2, tMid);
        if (pt.x < targetX) {
          tLow = tMid;
        } else {
          tHigh = tMid;
        }
      }
      return evalCubicBezier(seg.p1, seg.cp1, seg.cp2, seg.p2, tMid);
    }
  }

  return { x: targetX, y: first.y };
}

// Synthesize delicate scrubber clicks via Web Audio API
const playTickAudio = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(620, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(380, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.045);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {}
};

export default function StockChartMorph() {
  // Default to 1H to match reference screenshot
  const [activeTab, setActiveTab] = useState('1H');
  const [scrubberX, setScrubberX] = useState(112); // Exact horizontal coordinate from screenshot
  const [isScrubbing, setIsScrubbing] = useState(false);

  const svgRef = useRef(null);
  const lastTickXRef = useRef(0);

  const currentDataset = TIMEFRAMES.find((t) => t.id === activeTab) || TIMEFRAMES[0];
  const strokeColor = currentDataset.isPositive ? '#059669' : '#dc2626';

  const pathD = useMemo(() => {
    return getSmoothPath(currentDataset.points);
  }, [currentDataset.points]);

  // Compute EXACT position of the dot locked directly onto the spline curve
  const scrubberPos = useMemo(() => {
    return getPointAtX(currentDataset.points, scrubberX);
  }, [currentDataset.points, scrubberX]);

  // Handle pointer scrub along curve
  const handleScrubMove = useCallback((clientX) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = (clientX - rect.left) / rect.width;
    // Map to SVG viewBox X range [10, 290]
    const clampedX = Math.max(10, Math.min(290, relX * 300));
    setScrubberX(clampedX);

    if (Math.abs(clientX - lastTickXRef.current) > 22) {
      playTickAudio();
      lastTickXRef.current = clientX;
    }
  }, []);

  const handlePointerDown = (e) => {
    setIsScrubbing(true);
    handleScrubMove(e.clientX);
    if (e.target.setPointerCapture) {
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  const handlePointerMove = (e) => {
    if (!isScrubbing) return;
    handleScrubMove(e.clientX);
  };

  const handlePointerUp = () => {
    setIsScrubbing(false);
  };

  return (
    <div style={styles.stage}>
      {/* Chart Card */}
      <div style={styles.card}>
        {/* Header Price Section */}
        <div style={styles.priceHeader}>
          <div style={styles.priceRow}>
            <span style={styles.priceBig}>{currentDataset.priceInteger}</span>
            <span style={styles.priceSmall}>{currentDataset.priceFraction}</span>
          </div>

          <div style={styles.statsRow}>
            <span style={{ ...styles.statGreen, color: strokeColor }}>
              {currentDataset.delta}
            </span>
            <span style={styles.dotSeparator}>·</span>
            <span style={{ ...styles.statGreen, color: strokeColor }}>
              {currentDataset.percent} %
            </span>
            <span style={styles.timestamp}>{currentDataset.time}</span>
          </div>
        </div>

        {/* Interactive SVG Chart Line */}
        <div
          style={styles.chartCanvas}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <svg
            ref={svgRef}
            viewBox="0 0 300 120"
            style={styles.svg}
          >
            {/* The Green Spline Curve */}
            <path
              d={pathD}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Circular Scrubber Point (Perfect alignment centered on the curve) */}
            <circle
              cx={scrubberPos.x}
              cy={scrubberPos.y}
              r="5.5"
              fill="#ffffff"
              stroke={strokeColor}
              strokeWidth="2.8"
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.12))',
                cursor: 'grab'
              }}
            />
          </svg>
        </div>

        {/* Timeframe Selector Pills (Matching Screenshot with 1H active) */}
        <div style={styles.timeframesRow}>
          {TIMEFRAMES.map((tf) => {
            const isActive = activeTab === tf.id;
            return (
              <button
                key={tf.id}
                onClick={() => {
                  playTickAudio();
                  setActiveTab(tf.id);
                  setScrubberX(tf.defaultScrubberX);
                }}
                style={{
                  ...styles.timeframeBtn,
                  ...(isActive ? styles.timeframeBtnActive : styles.timeframeBtnInactive)
                }}
              >
                {tf.label}
              </button>
            );
          })}
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
    width: '320px',
    maxWidth: '92vw',
    background: '#ffffff',
    borderRadius: '28px',
    padding: '32px 28px 24px 28px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 8px 26px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03)',
    boxSizing: 'border-box'
  },
  priceHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '20px'
  },
  priceRow: {
    display: 'flex',
    alignItems: 'baseline',
    lineHeight: 1
  },
  priceBig: {
    fontSize: '35px',
    fontWeight: '700',
    color: '#09090b',
    letterSpacing: '-0.03em',
    fontVariantNumeric: 'tabular-nums'
  },
  priceSmall: {
    fontSize: '24px',
    fontWeight: '500',
    color: '#9ca3af',
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums'
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: '600',
    letterSpacing: '-0.01em',
    fontVariantNumeric: 'tabular-nums'
  },
  statGreen: {
    fontWeight: '700'
  },
  dotSeparator: {
    color: '#9ca3af',
    fontWeight: '700'
  },
  timestamp: {
    color: '#9ca3af',
    fontWeight: '500',
    marginLeft: '2px'
  },
  chartCanvas: {
    width: '100%',
    height: '110px',
    position: 'relative',
    cursor: 'pointer',
    touchAction: 'none',
    marginBottom: '24px'
  },
  svg: {
    width: '100%',
    height: '100%',
    overflow: 'visible'
  },
  timeframesRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 8px',
    width: '100%',
    boxSizing: 'border-box'
  },
  timeframeBtn: {
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '700',
    transition: 'all 0.16s ease',
    outline: 'none',
    boxSizing: 'border-box'
  },
  timeframeBtnActive: {
    background: 'transparent',
    color: '#09090b',
    border: '2px solid #09090b',
    borderRadius: '999px',
    padding: '7px 22px'
  },
  timeframeBtnInactive: {
    background: 'transparent',
    color: '#9ca3af',
    border: '2px solid transparent',
    padding: '7px 12px'
  }
};
