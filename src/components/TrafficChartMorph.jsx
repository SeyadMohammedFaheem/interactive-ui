import React, { useState } from 'react';

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
      osc.frequency.setValueAtTime(460 + Math.random() * 80, ctx.currentTime);
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
  { day: 'Sep 22', yellow: 11, sky: 8, blue: 16, purple: 20, red: 10, total: 980 },
  { day: 'Sep 23', yellow: 17, sky: 6, blue: 22, purple: 26, red: 10, total: 1120 },
  { day: 'Sep 24', yellow: 9, sky: 14, blue: 13, purple: 24, red: 8, total: 1050 },
  { day: 'Sep 25', yellow: 20, sky: 11, blue: 24, purple: 34, red: 9, total: 1540 },
  { day: 'Sep 26', yellow: 18, sky: 9, blue: 18, purple: 26, red: 7, total: 1260 },
  { day: 'Sep 27', yellow: 6, sky: 7, blue: 11, purple: 17, red: 8, total: 720 },
  { day: 'Sep 28', yellow: 15, sky: 11, blue: 17, purple: 32, red: 12, total: 1310 },
  { day: 'Sep 29', yellow: 13, sky: 13, blue: 15, purple: 22, red: 8, total: 1080 },
  { day: 'Sep 30', yellow: 14, sky: 10, blue: 20, purple: 28, red: 15, total: 1420 },
  { day: 'Oct 01', yellow: 15, sky: 9, blue: 13, purple: 30, red: 9, total: 1190 },
  { day: 'Oct 02', yellow: 17, sky: 11, blue: 15, purple: 21, red: 10, total: 1150 },
  { day: 'Oct 03', yellow: 10, sky: 9, blue: 11, purple: 15, red: 8, total: 840 },
  { day: 'Oct 04', yellow: 7, sky: 8, blue: 8, purple: 13, red: 7, total: 690 },
  { day: 'Oct 05', yellow: 11, sky: 9, blue: 22, purple: 22, red: 8, total: 1180 },
  { day: 'Oct 06', yellow: 15, sky: 13, blue: 17, purple: 30, red: 11, total: 1350 },
  { day: 'Oct 07', yellow: 22, sky: 11, blue: 19, purple: 34, red: 17, total: 1680 },
  { day: 'Oct 08', yellow: 12, sky: 9, blue: 15, purple: 20, red: 13, total: 1090 },
  { day: 'Oct 09', yellow: 20, sky: 13, blue: 20, purple: 36, red: 14, total: 1620 },
  { day: 'Oct 10', yellow: 9, sky: 7, blue: 9, purple: 15, red: 5, total: 760 },
  { day: 'Oct 11', yellow: 7, sky: 6, blue: 11, purple: 13, red: 8, total: 842 }
];

// Weekly aggregated dataset - scaled appropriately so bars fit cleanly
const WEEKLY_DATA = [
  { day: 'Week 38', yellow: 13, sky: 9, blue: 16, purple: 21, red: 8, total: 39400 },
  { day: 'Week 39', yellow: 18, sky: 13, blue: 21, purple: 28, red: 14, total: 56850 },
  { day: 'Week 40', yellow: 16, sky: 11, blue: 18, purple: 24, red: 11, total: 48920 },
  { day: 'Week 41', yellow: 12, sky: 8, blue: 14, purple: 19, red: 7, total: 37280 }
];

export default function TrafficChartMorph() {
  const [timeframe, setTimeframe] = useState('Day'); // 'Day' | 'Week'
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const data = timeframe === 'Day' ? DAILY_DATA : WEEKLY_DATA;
  const currentTotal = hoveredIndex !== null && data[hoveredIndex]
    ? data[hoveredIndex].total.toLocaleString()
    : (timeframe === 'Day' ? '24,182' : '182,450');

  const subtitle = timeframe === 'Day'
    ? (hoveredIndex !== null ? data[hoveredIndex].day : 'Last 20 days')
    : (hoveredIndex !== null ? data[hoveredIndex].day : 'Weeks');

  const handleToggle = (mode) => {
    if (mode === timeframe) return;
    playSound('toggle');
    setTimeframe(mode);
    setHoveredIndex(null);
  };

  const handleHover = (idx) => {
    if (idx !== hoveredIndex) {
      playSound('tick');
      setHoveredIndex(idx);
    }
  };

  // Dynamic height safety bounds: ensure stack never exceeds chart container
  const MAX_POS_HEIGHT = 80;
  const MAX_NEG_HEIGHT = 18;

  return (
    <div style={styles.stage}>
      {/* Main White Card matching screenshot */}
      <div style={styles.card}>
        {/* Header: Traffic & Segmented Toggle */}
        <div style={styles.header}>
          <div style={styles.titleGroup}>
            <span style={styles.title}>Traffic</span>
            <span style={styles.subtitle}>{subtitle}</span>
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

        {/* Primary Metric: 24,182 visits (Day) or 182,450 visits (Week) */}
        <div style={styles.metricRow}>
          <span style={styles.metricValue}>{currentTotal}</span>
          <span style={styles.metricLabel}>visits</span>
        </div>

        {/* Stacked Bar Chart */}
        <div
          style={styles.chartArea}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {data.map((item, index) => {
            const isHovered = hoveredIndex === index;
            const barWidth = timeframe === 'Day' ? 10 : 46;
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
                style={{
                  ...styles.columnWrapper,
                  width: `${barWidth}px`,
                  opacity: hoveredIndex !== null && !isHovered ? 0.45 : 1
                }}
                onMouseEnter={() => handleHover(index)}
                onTouchStart={() => handleHover(index)}
              >
                {/* Positive Stack (Top down: Yellow, Sky Blue, Royal Blue, Purple) */}
                <div style={styles.positiveStack}>
                  {/* Yellow Segment */}
                  <div
                    style={{
                      ...styles.segment,
                      height: `${yellowH}px`,
                      borderRadius,
                      backgroundColor: '#F6C453'
                    }}
                  />
                  {/* Sky Blue Segment */}
                  <div
                    style={{
                      ...styles.segment,
                      height: `${skyH}px`,
                      borderRadius,
                      backgroundColor: '#8FB9E5'
                    }}
                  />
                  {/* Royal Blue Segment */}
                  <div
                    style={{
                      ...styles.segment,
                      height: `${blueH}px`,
                      borderRadius,
                      backgroundColor: '#4E87F8'
                    }}
                  />
                  {/* Purple Segment (Base) */}
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

                {/* Hover Tooltip Float */}
                {isHovered && (
                  <div style={styles.tooltip}>
                    <div style={{ fontWeight: '600', fontSize: '11px', color: '#ffffff' }}>
                      {item.total.toLocaleString()} visits
                    </div>
                    <div style={{ fontSize: '9.5px', color: '#d4d4d8', marginTop: '2px' }}>
                      {item.day}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* X-Axis Date Labels: Sep 22 & Oct 11 or Week 38 & Week 41 */}
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
    padding: '12px 16px 24px 16px'
  },
  card: {
    width: '348px',
    maxWidth: '92vw',
    background: '#ffffff',
    borderRadius: '26px',
    padding: '20px 22px 16px 22px',
    boxSizing: 'border-box',
    boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.05), 0 2px 6px -2px rgba(0, 0, 0, 0.02)',
    border: '1px solid rgba(0, 0, 0, 0.03)',
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
    fontSize: '16.5px',
    fontWeight: '600',
    color: '#18181b',
    letterSpacing: '-0.015em',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  subtitle: {
    fontSize: '13px',
    color: '#9ca3af',
    fontWeight: '500',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
    padding: '4px 11px',
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
    fontWeight: '600',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
  },
  metricRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    marginBottom: '16px'
  },
  metricValue: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#18181b',
    letterSpacing: '-0.03em',
    lineHeight: 1,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  metricLabel: {
    fontSize: '14px',
    color: '#71717a',
    fontWeight: '500',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  chartArea: {
    width: '100%',
    height: '118px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    marginBottom: '8px'
  },
  columnWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'center',
    height: '100%',
    cursor: 'pointer',
    position: 'relative',
    transition: 'width 0.28s cubic-bezier(0.34, 1.25, 0.64, 1), opacity 0.18s ease',
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
    display: 'block',
    transition: 'height 0.3s cubic-bezier(0.34, 1.25, 0.64, 1), transform 0.16s ease'
  },
  tooltip: {
    position: 'absolute',
    top: '-34px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#18181b',
    padding: '4px 8px',
    borderRadius: '7px',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    zIndex: 20,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.18)',
    textAlign: 'center'
  },
  xAxisRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '4px'
  },
  xAxisLabel: {
    fontSize: '11.5px',
    color: '#9ca3af',
    fontWeight: '500',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  }
};
