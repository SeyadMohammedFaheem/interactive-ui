import React, { useState, useRef, useEffect, useCallback } from 'react';

const FLIGHTS = [
  {
    id: 'f1',
    from: 'SFO',
    fromCity: 'San Francisco',
    to: 'HND',
    toCity: 'Tokyo',
    flight: 'NH 107',
    gate: '28',
    boards: '11:15',
    seat: '2K',
    barcodePattern: [4, 1, 2, 3, 1, 4, 2, 1, 3, 4, 2, 1, 3, 1, 4, 2, 3, 1, 2, 4]
  },
  {
    id: 'f2',
    from: 'BCN',
    fromCity: 'Barcelona',
    to: 'TYO',
    toCity: 'Tokyo',
    flight: 'BN 204',
    gate: '12',
    boards: '09:40',
    seat: '3A',
    barcodePattern: [3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2]
  },
  {
    id: 'f3',
    from: 'JFK',
    fromCity: 'New York',
    to: 'LHR',
    toCity: 'London',
    flight: 'BA 178',
    gate: '04',
    boards: '18:25',
    seat: '1F',
    barcodePattern: [2, 3, 1, 4, 2, 1, 3, 4, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2]
  }
];

// Web Audio API paper tear, rip, and ticket chime sounds
const playTicketSound = (type = 'tear') => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'tear') {
      // Paper rip / tear texture synthesized from filtered white noise burst
      const bufferSize = ctx.sampleRate * 0.16;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.45));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.14);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } else if (type === 'snap') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(380, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(620, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } else if (type === 'scan') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.045);
    }
  } catch (e) {}
};

export default function BoardingPassMorph({
  auto = false,
  speed = 4,
  sound = true,
  theme = 'Light'
}) {
  const [flightIndex, setFlightIndex] = useState(0);
  const [isSplit, setIsSplit] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDraggingStub, setIsDraggingStub] = useState(false);
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });
  const [isScanning, setIsScanning] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const cardRef = useRef(null);
  const startPointerRef = useRef({ x: 0, y: 0 });
  const currentDragRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const isSplitRef = useRef(false);

  const currentFlight = FLIGHTS[flightIndex];

  useEffect(() => {
    isSplitRef.current = isSplit;
  }, [isSplit]);

  // Cycle flight routes
  const handleNextFlight = useCallback(() => {
    if (isDraggingRef.current) return;
    if (sound) playTicketSound('click');
    setFlightIndex((prev) => (prev + 1) % FLIGHTS.length);
  }, [sound]);

  // Trigger barcode scan effect
  const handleScanBarcode = (e) => {
    e.stopPropagation();
    if (sound) playTicketSound('scan');
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 800);
  };

  // Reattach ticket stub
  const handleReattach = (e) => {
    if (e) e.stopPropagation();
    setIsSplit(false);
    isSplitRef.current = false;
    setDragOffset({ x: 0, y: 0 });
    currentDragRef.current = { x: 0, y: 0 };
    if (sound) playTicketSound('snap');
  };

  // Pointer down on ticket stub initiates dragging to split
  const handleStubPointerDown = (e) => {
    e.stopPropagation();
    setIsDraggingStub(true);
    isDraggingRef.current = true;
    startPointerRef.current = {
      x: e.clientX - (isSplitRef.current ? 36 : 0),
      y: e.clientY
    };
  };

  // Global window pointer listeners for physics dragging
  useEffect(() => {
    const handleWindowPointerMove = (e) => {
      if (!isDraggingRef.current) return;
      const rawX = e.clientX - startPointerRef.current.x;
      const rawY = (e.clientY - startPointerRef.current.y) * 0.35;

      // Allow dragging rightwards to tear apart
      const clampedX = Math.max(-10, Math.min(120, rawX));
      const clampedY = Math.max(-25, Math.min(25, rawY));

      currentDragRef.current = { x: clampedX, y: clampedY };
      setDragOffset({ x: clampedX, y: clampedY });

      // If dragged past 42px threshold and not yet split: TRIGGER SPLIT!
      if (!isSplitRef.current && clampedX >= 42) {
        setIsSplit(true);
        isSplitRef.current = true;
        if (sound) playTicketSound('tear');
      }

      // If dragged back leftwards past -5px while split: REATTACH!
      if (isSplitRef.current && clampedX <= 8) {
        setIsSplit(false);
        isSplitRef.current = false;
        if (sound) playTicketSound('snap');
      }
    };

    const handleWindowPointerUp = () => {
      if (!isDraggingRef.current) return;
      setIsDraggingStub(false);
      isDraggingRef.current = false;

      // Final settling physics:
      if (isSplitRef.current) {
        // Settle cleanly in detached / split position
        setDragOffset({ x: 38, y: 4 });
        currentDragRef.current = { x: 38, y: 4 };
      } else {
        // Snap back to attached
        setDragOffset({ x: 0, y: 0 });
        currentDragRef.current = { x: 0, y: 0 };
      }
    };

    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('pointerup', handleWindowPointerUp);
    window.addEventListener('pointercancel', handleWindowPointerUp);

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
      window.removeEventListener('pointercancel', handleWindowPointerUp);
    };
  }, [sound]);

  // Autoplay demonstration: periodically splits and reattaches
  useEffect(() => {
    if (!auto) return;
    const interval = setInterval(() => {
      setIsSplit((prev) => {
        const next = !prev;
        if (sound) playTicketSound(next ? 'tear' : 'snap');
        setDragOffset(next ? { x: 38, y: 4 } : { x: 0, y: 0 });
        return next;
      });
    }, (1000 / Math.max(1, speed)) * 6);

    return () => clearInterval(interval);
  }, [auto, speed, sound]);

  // 3D perspective mouse tilt
  const handleMouseMove = (e) => {
    if (!cardRef.current || isDraggingRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseTilt({ x: x * 6, y: -y * 6 });
  };

  const handleMouseLeave = () => {
    setMouseTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  // Compute stub transform
  const stubX = isDraggingStub
    ? dragOffset.x
    : isSplit
    ? 38
    : 0;

  const stubY = isDraggingStub
    ? dragOffset.y
    : isSplit
    ? 4
    : 0;

  const stubRotation = isDraggingStub
    ? stubX * 0.1
    : isSplit
    ? 4.5
    : 0;

  return (
    <div style={styles.stage}>
      {/* 3D Boarding Pass Card Shell */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          ...styles.ticketContainer,
          transform: `perspective(1000px) rotateX(${mouseTilt.y}deg) rotateY(${mouseTilt.x}deg) scale(${isHovered ? 1.012 : 1})`,
          transition: isDraggingStub
            ? 'none'
            : 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s ease'
        }}
      >
        {/* Main Ticket Body (Left Section) */}
        <div
          onClick={handleNextFlight}
          style={{
            ...styles.mainBody,
            cursor: 'pointer'
          }}
          title="Click main ticket to switch routes"
        >
          {/* Header Label: BOARDING PASS */}
          <span style={styles.sectionHeader}>BOARDING PASS</span>

          {/* Route: SFO -> HND */}
          <div style={styles.routeRow}>
            <span style={styles.airportCode}>{currentFlight.from}</span>
            <span style={styles.arrowIcon}>→</span>
            <span style={styles.airportCode}>{currentFlight.to}</span>
          </div>

          {/* Flight Details: Flight, Gate, Boards */}
          <div style={styles.detailsGrid}>
            <div style={styles.detailCol}>
              <span style={styles.detailLabel}>Flight</span>
              <span style={styles.detailValue}>{currentFlight.flight}</span>
            </div>

            <div style={styles.detailCol}>
              <span style={styles.detailLabel}>Gate</span>
              <span style={styles.detailValue}>{currentFlight.gate}</span>
            </div>

            <div style={styles.detailCol}>
              <span style={styles.detailLabel}>Boards</span>
              <span style={styles.detailValue}>{currentFlight.boards}</span>
            </div>
          </div>
        </div>

        {/* Perforated Divider with Circular Notches (Fades out when split) */}
        <div
          style={{
            ...styles.perforationWrapper,
            opacity: isSplit ? 0 : Math.max(0, 1 - (stubX / 30))
          }}
        >
          <div style={styles.notchTop} />
          <div style={styles.dottedLine} />
          <div style={styles.notchBottom} />
        </div>

        {/* Draggable & Tearable Ticket Stub (Right Section) */}
        <div
          onPointerDown={handleStubPointerDown}
          onClick={isSplit ? handleReattach : undefined}
          style={{
            ...styles.stubBody,
            transform: `translateX(${stubX}px) translateY(${stubY}px) rotate(${stubRotation}deg)`,
            cursor: isDraggingStub ? 'grabbing' : isSplit ? 'pointer' : 'grab',
            boxShadow: isSplit
              ? '0 18px 36px -6px rgba(0, 0, 0, 0.16), 0 4px 10px rgba(0, 0, 0, 0.04)'
              : 'none',
            borderLeft: isSplit ? '1.5px dashed #cbd5e1' : 'none',
            transition: isDraggingStub
              ? 'none'
              : 'transform 0.36s cubic-bezier(0.175, 0.885, 0.32, 1.25), box-shadow 0.25s ease'
          }}
          title={isSplit ? 'Click to reattach stub' : 'Drag rightwards to tear/split ticket stub'}
        >
          {/* Header Label: SEAT */}
          <div style={styles.stubHeaderRow}>
            <span style={styles.sectionHeader}>SEAT</span>
            {isSplit && <span style={styles.tornBadge}>Torn</span>}
          </div>

          {/* Seat Value: 2K */}
          <span style={styles.seatCode}>{currentFlight.seat}</span>

          {/* Vertical Barcode */}
          <div
            style={styles.barcodeWrapper}
            onClick={handleScanBarcode}
            title="Click to scan barcode"
          >
            {currentFlight.barcodePattern.map((width, idx) => (
              <div
                key={idx}
                style={{
                  ...styles.barcodeBar,
                  width: `${width}px`,
                  marginRight: idx % 2 === 0 ? '2px' : '1.5px'
                }}
              />
            ))}

            {/* Glowing Laser Scanline on Click */}
            {isScanning && <div style={styles.laserScanner} />}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  stage: {
    width: '100%',
    height: '100%',
    minHeight: '340px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    position: 'relative',
    userSelect: 'none',
    boxSizing: 'border-box',
    padding: '24px'
  },
  ticketContainer: {
    width: '334px',
    maxWidth: '92vw',
    height: '172px',
    display: 'flex',
    boxSizing: 'border-box',
    position: 'relative',
    fontFamily: "'Plus Jakarta Sans', sans-serif"
  },
  mainBody: {
    flex: '1 1 68%',
    background: '#ffffff',
    borderRadius: '24px 0 0 24px',
    borderTop: '1px solid rgba(0, 0, 0, 0.04)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
    borderLeft: '1px solid rgba(0, 0, 0, 0.04)',
    boxShadow: '0 16px 42px -10px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.02)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '20px 18px 18px 24px',
    boxSizing: 'border-box',
    zIndex: 5
  },
  sectionHeader: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#8e8e93',
    letterSpacing: '0.06em',
    lineHeight: 1
  },
  routeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '4px 0'
  },
  airportCode: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#18181b',
    letterSpacing: '-0.03em',
    lineHeight: 1
  },
  arrowIcon: {
    fontSize: '18px',
    fontWeight: '500',
    color: '#8e8e93',
    lineHeight: 1
  },
  detailsGrid: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '24px'
  },
  detailCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px'
  },
  detailLabel: {
    fontSize: '11px',
    fontWeight: '500',
    color: '#8e8e93'
  },
  detailValue: {
    fontSize: '14.5px',
    fontWeight: '700',
    color: '#18181b',
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '-0.01em'
  },
  perforationWrapper: {
    width: '1px',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 15,
    pointerEvents: 'none',
    transition: 'opacity 0.2s ease'
  },
  dottedLine: {
    width: '0px',
    height: '100%',
    borderRight: '2px dotted #d4d4d8'
  },
  notchTop: {
    position: 'absolute',
    top: '-8px',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    background: '#f4f4f5',
    boxShadow: 'inset 0 -1px 2px rgba(0, 0, 0, 0.05)'
  },
  notchBottom: {
    position: 'absolute',
    bottom: '-8px',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    background: '#f4f4f5',
    boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)'
  },
  stubBody: {
    flex: '0 0 32%',
    background: '#ffffff',
    borderRadius: '0 24px 24px 0',
    borderTop: '1px solid rgba(0, 0, 0, 0.04)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
    borderRight: '1px solid rgba(0, 0, 0, 0.04)',
    boxShadow: '0 16px 42px -10px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.02)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '20px 20px 18px 18px',
    boxSizing: 'border-box',
    position: 'relative',
    zIndex: 10,
    touchAction: 'none',
    willChange: 'transform'
  },
  stubHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  tornBadge: {
    fontSize: '9.5px',
    fontWeight: '700',
    color: '#059669',
    background: '#ecfdf5',
    padding: '2px 6px',
    borderRadius: '999px',
    lineHeight: 1
  },
  seatCode: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#18181b',
    letterSpacing: '-0.02em',
    lineHeight: 1,
    margin: '4px 0'
  },
  barcodeWrapper: {
    display: 'flex',
    alignItems: 'stretch',
    height: '36px',
    position: 'relative',
    overflow: 'hidden',
    padding: '2px 0',
    cursor: 'pointer'
  },
  barcodeBar: {
    height: '100%',
    background: '#18181b',
    borderRadius: '0.5px'
  },
  laserScanner: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(239, 68, 68, 0) 0%, rgba(239, 68, 68, 0.8) 50%, rgba(239, 68, 68, 0) 100%)',
    animation: 'scanSweep 0.8s ease-in-out infinite',
    pointerEvents: 'none'
  }
};
