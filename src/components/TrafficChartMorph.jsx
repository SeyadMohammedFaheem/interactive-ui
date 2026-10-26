import React, { useState, useRef, useEffect, useCallback } from 'react';

// Web Audio API subtle haptics
const playSound = (type = 'tick') => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'tick') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480 + Math.random() * 60, ctx.currentTime);
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0005, ctx.currentTime + 0.035);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } else if (type === 'toggle') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(680, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.11);
    }
  } catch (e) {}
};

// 20 days dataset precisely matching reference screenshot
const DAILY_DATA = [
  { day: 'Sep 22', yellow: 11, sky: 8, blue: 16, purple: 20, red: 10, total: 980, email: 295, direct: 282, bounced: 7 },
  { day: 'Sep 23', yellow: 17, sky: 6, blue: 22, purple: 26, red: 10, total: 1120, email: 338, direct: 322, bounced: 8 },
  { day: 'Sep 24', yellow: 9, sky: 14, blue: 13, purple: 24, red: 8, total: 1050, email: 317, direct: 302, bounced: 7 },
  { day: 'Sep 25', yellow: 20, sky: 11, blue: 24, purple: 34, red: 9, total: 1540, email: 465, direct: 443, bounced: 11 },
  { day: 'Sep 26', yellow: 18, sky: 9, blue: 18, purple: 26, red: 7, total: 1260, email: 380, direct: 362, bounced: 9 },
  { day: 'Sep 27', yellow: 6, sky: 7, blue: 11, purple: 17, red: 8, total: 720, email: 217, direct: 207, bounced: 5 },
  { day: 'Sep 28', yellow: 15, sky: 11, blue: 17, purple: 32, red: 12, total: 1310, email: 395, direct: 377, bounced: 9 },
  { day: 'Sep 29', yellow: 13, sky: 13, blue: 15, purple: 22, red: 8, total: 1080, email: 326, direct: 311, bounced: 8 },
  { day: 'Sep 30', yellow: 14, sky: 10, blue: 20, purple: 28, red: 15, total: 1420, email: 428, direct: 408, bounced: 10 },
  { day: 'Oct 01', yellow: 15, sky: 9, blue: 13, purple: 30, red: 9, total: 1190, email: 359, direct: 342, bounced: 9 },
  { day: 'Oct 2', yellow: 17, sky: 11, blue: 15, purple: 21, red: 10, total: 1116, email: 337, direct: 321, bounced: 8 }, // Exact values from screenshot!
  { day: 'Oct 03', yellow: 10, sky: 9, blue: 11, purple: 15, red: 8, total: 840, email: 253, direct: 241, bounced: 6 },
  { day: 'Oct 04', yellow: 7, sky: 8, blue: 8, purple: 13, red: 7, total: 690, email: 208, direct: 198, bounced: 5 },
  { day: 'Oct 05', yellow: 11, sky: 9, blue: 22, purple: 22, red: 8, total: 1180, email: 356, direct: 339, bounced: 8 },
  { day: 'Oct 06', yellow: 15, sky: 13, blue: 17, purple: 30, red: 11, total: 1350, email: 407, direct: 388, bounced: 10 },
  { day: 'Oct 07', yellow: 22, sky: 11, blue: 19, purple: 34, red: 17, total: 1680, email: 507, direct: 483, bounced: 12 },
  { day: 'Oct 08', yellow: 12, sky: 9, blue: 15, purple: 20, red: 13, total: 1090, email: 329, direct: 313, bounced: 8 },
  { day: 'Oct 09', yellow: 20, sky: 13, blue: 20, purple: 36, red: 14, total: 1620, email: 489, direct: 466, bounced: 12 },
  { day: 'Oct 10', yellow: 9, sky: 7, blue: 9, purple: 15, red: 5, total: 760, email: 229, direct: 218, bounced: 5 },
  { day: 'Oct 11', yellow: 7, sky: 6, blue: 11, purple: 13, red: 8, total: 842, email: 254, direct: 242, bounced: 6 }
];

const WEEKLY_DATA = [
  { day: 'Week 38', yellow: 13, sky: 9, blue: 16, purple: 21, red: 8, total: 39400, email: 11890, direct: 11340, bounced: 280 },
  { day: 'Week 39', yellow: 18, sky: 13, blue: 21, purple: 28, red: 14, total: 56850, email: 17150, direct: 16370, bounced: 410 },
  { day: 'Week 40', yellow: 16, sky: 11, blue: 18, purple: 24, red: 11, total: 48920, email: 14760, direct: 14080, bounced: 350 },
  { day: 'Week 41', yellow: 12, sky: 8, blue: 14, purple: 19, red: 7, total: 37280, email: 11250, direct: 10730, bounced: 260 }
];

export default function TrafficChartMorph({
  auto = false,
  speed = 4,
  sound = true,
  theme = 'Light'
}) {
  const [timeframe, setTimeframe] = useState('Day'); // 'Day' | 'Week'
  // Default to index 10 (Oct 2 matching screenshot!)
  const [selectedIndex, setSelectedIndex] = useState(10);
  const [isHovering, setIsHovering] = useState(false);

  const chartAreaRef = useRef(null);
  const columnRefs = useRef([]);

  const data = timeframe === 'Day' ? DAILY_DATA : WEEKLY_DATA;
  const activeIdx = Math.min(selectedIndex, data.length - 1);
  const activeItem = data[activeIdx] || data[0];

  const handleToggle = (mode) => {
    if (mode === timeframe) return;
    if (sound) playSound('toggle');
    setTimeframe(mode);
    setSelectedIndex(0);
  };

  const handleHover = useCallback((idx) => {
    if (idx !== selectedIndex) {
      if (sound) playSound('tick');
      setSelectedIndex(idx);
    }
    setIsHovering(true);
  }, [selectedIndex, sound]);

  // Autoplay support: glides smoothly across the chart columns
  useEffect(() => {
    if (!auto) return;
    const interval = setInterval(() => {
      setSelectedIndex((prev) => {
        const next = (prev + 1) % data.length;
        if (sound) playSound('tick');
        return next;
      });
    }, (1000 / Math.max(1, speed)) * 5);

    return () => clearInterval(interval);
  }, [auto, speed, sound, data.length]);

  // Dynamic height safety bounds
  const MAX_POS_HEIGHT = 80;
  const MAX_NEG_HEIGHT = 18;

  // Calculate pixel position of active bar for smooth sliding selection & tooltip
  const barWidth = timeframe === 'Day' ? 10 : 52;
  const totalCols = data.length;

  return (
    <div style={styles.stage}>
      {/* Main White Card matching screenshot */}
      <div style={styles.card}>
        {/* Header: Traffic & Segmented Toggle */}
        <div style={styles.header}>
          <div style={styles.titleGroup}>
            <span style={styles.title}>Traffic</span>
            <span style={styles.subtitle}>
              {timeframe === 'Day' ? 'Last 20 days' : 'Weekly Overview'}
            </span>
          </div>

          {/* Segmented Day/Week Toggle */}
          <div style={styles.toggleTrack}>
            <button
              style={{
                ...styles.toggleBtn,
                ...(timeframe === 'Day' ? styles.toggleBtnActive : {})
              }}
              onClick={() => handleToggle('Day')}
            >
              Day
            </button>
            <button
              style={{
                ...styles.toggleBtn,
                ...(timeframe === 'Week' ? styles.toggleBtnActive : {})
              }}
              onClick={() => handleToggle('Week')}
            >
              Week
            </button>
          </div>
        </div>

        {/* Primary Metric: 24,182 visits */}
        <div style={styles.metricRow}>
          <span style={styles.metricValue}>
            {timeframe === 'Day' ? '24,182' : '182,450'}
          </span>
          <span style={styles.metricLabel}>visits</span>
        </div>

        {/* Stacked Bar Chart with Smooth Sliding Tooltip & Active Bar Outline */}
        <div
          ref={chartAreaRef}
          style={styles.chartArea}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Smooth Sliding Tooltip Card (Matching Image 1) */}
          <div
            style={{
              ...styles.tooltipCard,
              // Calculate center position of active bar column
              left: `${((activeIdx + 0.5) / totalCols) * 100}%`,
              transform: `translate(${activeIdx < 4 ? '-20%' : activeIdx > 15 ? '-80%' : '-50%'}, 0)`,
              transition: 'left 0.24s cubic-bezier(0.16, 1, 0.3, 1), transform 0.24s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Header: Oct 2 & 1,116 */}
            <div style={styles.tooltipHeader}>
              <span style={styles.tooltipDate}>{activeItem.day}</span>
              <span style={styles.tooltipTotal}>{activeItem.total.toLocaleString()}</span>
            </div>

            {/* Row 1: Email 337 (Yellow/Gold Swatch) */}
            <div style={styles.tooltipRow}>
              <div style={styles.tooltipRowLeft}>
                <span style={{ ...styles.colorSwatch, background: '#F6C453' }} />
                <span style={styles.channelName}>Email</span>
              </div>
              <span style={styles.channelValue}>{activeItem.email.toLocaleString()}</span>
            </div>

            {/* Row 2: Direct 321 (Purple/Lavender Swatch) */}
            <div style={styles.tooltipRow}>
              <div style={styles.tooltipRowLeft}>
                <span style={{ ...styles.colorSwatch, background: '#9D7BF6' }} />
                <span style={styles.channelName}>Direct</span>
              </div>
              <span style={styles.channelValue}>{activeItem.direct.toLocaleString()}</span>
            </div>

            {/* Row 3: Bounced 8 (Red Swatch) */}
            <div style={styles.tooltipRow}>
              <div style={styles.tooltipRowLeft}>
                <span style={{ ...styles.colorSwatch, background: '#EA4D4D' }} />
                <span style={styles.channelName}>Bounced</span>
              </div>
              <span style={styles.channelValue}>{activeItem.bounced.toLocaleString()}</span>
            </div>
          </div>

          {/* Smooth Sliding Selection Outline Box (Matching Image 1 around Oct 2) */}
          <div
            style={{
              ...styles.selectionBox,
              left: `${((activeIdx + 0.5) / totalCols) * 100}%`,
              width: `${barWidth + 6}px`,
              transform: 'translateX(-50%)',
              transition: 'left 0.24s cubic-bezier(0.16, 1, 0.3, 1), width 0.24s ease'
            }}
          />

          {/* 20 Vertical Stacked Bars */}
          {data.map((item, index) => {
            const isSelected = activeIdx === index;
            const borderRadius = timeframe === 'Day' ? '3px' : '5px';

            // Mathematically scale segments so the bar stack never overflows
            const posSum = item.yellow + item.sky + item.blue + item.purple;
            const posScale = posSum > MAX_POS_HEIGHT ? MAX_POS_HEIGHT / posSum : 1;
            const yellowH = Math.max(3, Math.round(item.yellow * posScale));
            const skyH = Math.max(3, Math.round(item.sky * posScale));
            const blueH = Math.max(3, Math.round(item.blue * posScale));
            const purpleH = Math.max(3, Math.round(item.purple * posScale));

            const negScale = item.red > MAX_NEG_HEIGHT ? MAX_NEG_HEIGHT / item.red : 1;
            const redH = Math.max(3, Math.round(item.red * negScale));

            return (
              <div
                key={index}
                ref={(el) => (columnRefs.current[index] = el)}
                style={{
                  ...styles.columnWrapper,
                  width: `${barWidth}px`,
                  opacity: isSelected ? 1 : 0.65,
                  transition: 'opacity 0.2s ease, transform 0.2s ease'
                }}
                onMouseEnter={() => handleHover(index)}
                onTouchStart={() => handleHover(index)}
              >
                {/* Positive Stack (Top down: Yellow, Sky Blue, Royal Blue, Purple) */}
                <div style={styles.positiveStack}>
                  <div
                    style={{
                      ...styles.segment,
                      height: `${yellowH}px`,
                      borderRadius,
                      backgroundColor: '#F6C453'
                    }}
                  />
                  <div
                    style={{
                      ...styles.segment,
                      height: `${skyH}px`,
                      borderRadius,
                      backgroundColor: '#8FB9E5'
                    }}
                  />
                  <div
                    style={{
                      ...styles.segment,
                      height: `${blueH}px`,
                      borderRadius,
                      backgroundColor: '#4E87F8'
                    }}
                  />
                  <div
                    style={{
                      ...styles.segment,
                      height: `${purpleH}px`,
                      borderRadius,
                      backgroundColor: '#9D7BF6'
                    }}
                  />
                </div>

                {/* Subtle Divider Seam */}
                <div style={styles.zeroLineGap} />

                {/* Negative Stack (Red bounces below baseline) */}
                <div style={styles.negativeStack}>
                  <div
                    style={{
                      ...styles.segment,
                      height: `${redH}px`,
                      borderRadius,
                      backgroundColor: '#EA4D4D'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* X-Axis Date Labels: Sep 22 & Oct 11 */}
        <div style={{ ...styles.xAxisRow, padding: timeframe === 'Week' ? '0 4px' : '0' }}>
          <span style={styles.xAxisLabel}>
            {timeframe === 'Day' ? 'Sep 22' : 'Week 38'}
          </span>
          <span style={styles.xAxisLabel}>
            {timeframe === 'Day' ? 'Oct 11' : 'Week 41'}
          </span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  stage: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    position: 'relative',
    userSelect: 'none',
    boxSizing: 'border-box',
    padding: '12px 16px 24px 16px',
    fontFamily: "'Plus Jakarta Sans', sans-serif"
  },
  card: {
    width: '356px',
    maxWidth: '92vw',
    background: '#ffffff',
    borderRadius: '28px',
    padding: '24px 24px 18px 24px',
    boxSizing: 'border-box',
    boxShadow: '0 16px 42px -10px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.02)',
    border: '1px solid rgba(0, 0, 0, 0.04)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '12px'
  },
  titleGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  title: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#18181b',
    letterSpacing: '-0.02em',
    lineHeight: 1.2
  },
  subtitle: {
    fontSize: '13px',
    color: '#8e8e93',
    fontWeight: '500'
  },
  toggleTrack: {
    background: '#f4f4f5',
    padding: '3px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '2px'
  },
  toggleBtn: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    borderRadius: '9px',
    padding: '4px 12px',
    fontSize: '12.5px',
    fontWeight: '500',
    color: '#71717a',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
    fontFamily: 'inherit'
  },
  toggleBtnActive: {
    background: '#ffffff',
    color: '#18181b',
    fontWeight: '700',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
  },
  metricRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    marginBottom: '18px'
  },
  metricValue: {
    fontSize: '35px',
    fontWeight: '800',
    color: '#18181b',
    letterSpacing: '-0.03em',
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums'
  },
  metricLabel: {
    fontSize: '14px',
    color: '#8e8e93',
    fontWeight: '500'
  },
  chartArea: {
    width: '100%',
    height: '130px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    marginBottom: '8px',
    paddingTop: '6px'
  },
  tooltipCard: {
    position: 'absolute',
    top: '-8px',
    width: '142px',
    background: '#ffffff',
    borderRadius: '14px',
    padding: '10px 12px',
    boxShadow: '0 10px 28px -4px rgba(0, 0, 0, 0.14), 0 2px 8px rgba(0, 0, 0, 0.04)',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    zIndex: 30,
    pointerEvents: 'none',
    boxSizing: 'border-box'
  },
  tooltipHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
    lineHeight: 1
  },
  tooltipDate: {
    fontSize: '12.5px',
    fontWeight: '500',
    color: '#8e8e93'
  },
  tooltipTotal: {
    fontSize: '13.5px',
    fontWeight: '700',
    color: '#18181b',
    fontVariantNumeric: 'tabular-nums'
  },
  tooltipRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '5px'
  },
  tooltipRowLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px'
  },
  colorSwatch: {
    width: '8px',
    height: '8px',
    borderRadius: '2.5px',
    flexShrink: 0
  },
  channelName: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#52525b'
  },
  channelValue: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#18181b',
    fontVariantNumeric: 'tabular-nums'
  },
  selectionBox: {
    position: 'absolute',
    top: '12px',
    bottom: '4px',
    borderRadius: '7px',
    border: '1.5px solid #27272a',
    pointerEvents: 'none',
    zIndex: 25,
    boxSizing: 'border-box'
  },
  columnWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'center',
    height: '100%',
    cursor: 'pointer',
    position: 'relative',
    flexShrink: 0
  },
  positiveStack: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-end',
    gap: '2px',
    height: '88px',
    flexShrink: 0
  },
  zeroLineGap: {
    width: '100%',
    height: '3px',
    flexShrink: 0
  },
  negativeStack: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    gap: '2px',
    height: '22px',
    flexShrink: 0
  },
  segment: {
    width: '100%',
    flexShrink: 0,
    display: 'block'
  },
  xAxisRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '6px'
  },
  xAxisLabel: {
    fontSize: '11.5px',
    color: '#8e8e93',
    fontWeight: '500'
  }
};
