import React, { useState, useRef, useEffect, useCallback } from 'react';

// Web Audio API subtle pen friction and tactile feedback
const playInkSound = (type = 'draw') => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'draw') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420 + Math.random() * 90, ctx.currentTime);
      gain.gain.setValueAtTime(0.012, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0005, ctx.currentTime + 0.045);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'clear') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(340, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.09);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.11);
    } else if (type === 'save') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.07); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.14); // G5
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.33);
    }
  } catch (e) {}
};

export default function SignaturePadMorph() {
  const [hasSignature, setHasSignature] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const pointsRef = useRef([]);
  const soundTickRef = useRef(0);
  const animationTimerRef = useRef(null);

  // Setup context styles with DPR scaling
  const configureContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    if (rect.width === 0 || rect.height === 0) return;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 2.4;
  }, []);

  useEffect(() => {
    configureContext();
    window.addEventListener('resize', configureContext);
    return () => {
      window.removeEventListener('resize', configureContext);
      if (animationTimerRef.current) clearInterval(animationTimerRef.current);
    };
  }, [configureContext]);

  const getCanvasPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current);
      animationTimerRef.current = null;
    }
    if (isSaved) setIsSaved(false);
    setIsDrawing(true);
    setHasSignature(true);

    const pos = getCanvasPos(e);
    pointsRef.current = [pos];

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = '#18181b';
    ctx.fill();

    if (e.target.setPointerCapture) {
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getCanvasPos(e);

    const pts = pointsRef.current;
    pts.push(pos);

    if (pts.length > 2) {
      const lastIndex = pts.length - 1;
      const p1 = pts[lastIndex - 1];
      const p2 = pts[lastIndex];
      const midPoint = {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2
      };

      const prevMid = {
        x: (pts[lastIndex - 2].x + p1.x) / 2,
        y: (pts[lastIndex - 2].y + p1.y) / 2
      };

      ctx.beginPath();
      ctx.moveTo(prevMid.x, prevMid.y);
      ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
      ctx.stroke();

      // Soft audio feedback
      const now = Date.now();
      if (now - soundTickRef.current > 55) {
        playInkSound('draw');
        soundTickRef.current = now;
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    pointsRef.current = [];
  };

  const clearCanvas = (e) => {
    if (e) e.stopPropagation();
    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current);
      animationTimerRef.current = null;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setHasSignature(false);
    setIsSaved(false);
    playInkSound('clear');
  };

  // Demo executive cursive signature
  const animateDemoSignature = (e) => {
    if (e) e.stopPropagation();
    clearCanvas();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    setHasSignature(true);
    setIsSaved(false);

    // Multi-stroke cursive signature coordinates relative to card
    const originX = Math.max(30, rect.width * 0.18);
    const originY = Math.max(50, rect.height * 0.52);

    const strokeSegments = [];

    // Flourish J / S curve
    for (let t = 0; t <= Math.PI * 2.8; t += 0.12) {
      const x = originX + t * 24 + Math.sin(t * 3.5) * 8;
      const y = originY + Math.sin(t * 1.8) * 28 - Math.cos(t * 0.8) * 14;
      strokeSegments.push({ x, y, lift: false });
    }

    // Swirling flourish tail
    for (let t = 0; t <= Math.PI * 1.5; t += 0.14) {
      const x = originX + 160 + t * 30;
      const y = originY + 12 - Math.sin(t) * 16;
      strokeSegments.push({ x, y, lift: t === 0 });
    }

    // Underline stroke
    for (let t = 0; t <= 1; t += 0.05) {
      const x = originX + 20 + t * 190;
      const y = originY + 22 + Math.sin(t * Math.PI) * 5;
      strokeSegments.push({ x, y, lift: t === 0 });
    }

    let i = 0;
    animationTimerRef.current = setInterval(() => {
      if (i >= strokeSegments.length - 1) {
        clearInterval(animationTimerRef.current);
        animationTimerRef.current = null;
        return;
      }

      const p1 = strokeSegments[i];
      const p2 = strokeSegments[i + 1];

      if (!p2.lift) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        if (i % 3 === 0) playInkSound('draw');
      }

      i++;
    }, 18);
  };

  const saveSignature = (e) => {
    e.stopPropagation();
    setIsSaved(true);
    playInkSound('save');
  };

  return (
    <div style={styles.stage}>
      {/* Top Right Bookmark Button (matching screenshot corner icon) */}
      <div style={styles.bookmarkWrapper}>
        <button
          style={styles.bookmarkBtn}
          onClick={() => setIsBookmarked(!isBookmarked)}
          title={isBookmarked ? 'Bookmarked' : 'Bookmark component'}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill={isBookmarked ? '#18181b' : 'none'}
            stroke="#71717a"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>

      {/* Signature Card (Pixel-perfect to screenshot) */}
      <div ref={containerRef} style={styles.card}>
        {/* Drawing Canvas Area */}
        <div style={styles.canvasWrapper}>
          <canvas
            ref={canvasRef}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerCancel={stopDrawing}
            style={styles.canvas}
          />
        </div>

        {/* Guideline & "Sign here" Label (Exact layout as screenshot) */}
        <div style={styles.bottomSection}>
          <div style={styles.line} />
          <div style={styles.labelRow}>
            <span
              style={{
                ...styles.signText,
                color: hasSignature ? '#9ca3af' : '#71717a'
              }}
            >
              Sign here
            </span>

            {/* Quick Action Pills */}
            <div style={styles.actionsGroup}>
              {hasSignature ? (
                <>
                  <button
                    style={styles.actionPillBtn}
                    onClick={clearCanvas}
                    title="Clear signature"
                  >
                    Clear
                  </button>
                  <button
                    style={{
                      ...styles.actionPillBtn,
                      background: isSaved ? '#10b981' : '#18181b',
                      color: '#ffffff'
                    }}
                    onClick={saveSignature}
                    title="Save signature"
                  >
                    {isSaved ? '✓ Saved' : 'Done'}
                  </button>
                </>
              ) : (
                <button
                  style={styles.actionPillBtn}
                  onClick={animateDemoSignature}
                  title="Auto-draw cursive signature"
                >
                  Auto-sign
                </button>
              )}
            </div>
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
    minHeight: '360px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    position: 'relative',
    userSelect: 'none',
    boxSizing: 'border-box',
    padding: '24px'
  },
  bookmarkWrapper: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    zIndex: 10
  },
  bookmarkBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    transition: 'transform 0.15s ease',
    opacity: 0.8
  },
  card: {
    width: '380px',
    maxWidth: '92vw',
    height: '246px',
    background: '#ffffff',
    borderRadius: '26px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 10px 28px -6px rgba(0, 0, 0, 0.05), 0 2px 8px -2px rgba(0, 0, 0, 0.02)',
    border: '1px solid rgba(0, 0, 0, 0.03)',
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden'
  },
  canvasWrapper: {
    flex: 1,
    position: 'relative',
    cursor: 'crosshair',
    touchAction: 'none'
  },
  canvas: {
    width: '100%',
    height: '100%',
    display: 'block'
  },
  bottomSection: {
    padding: '0 32px 20px 32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px'
  },
  line: {
    width: '100%',
    height: '1px',
    background: '#e5e7eb'
  },
  labelRow: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: '26px'
  },
  signText: {
    fontSize: '14.5px',
    fontWeight: '500',
    letterSpacing: '-0.01em',
    transition: 'color 0.2s ease',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  actionsGroup: {
    position: 'absolute',
    right: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  actionPillBtn: {
    background: '#f4f4f5',
    color: '#18181b',
    border: 'none',
    padding: '4px 10px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.16s ease',
    fontFamily: 'inherit'
  }
};
