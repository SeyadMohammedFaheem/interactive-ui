import React, { useState, useRef, useEffect } from 'react';

// Web Audio API tactile key click & verify chimes
const playAudioFeedback = (type = 'click') => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.09); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.18); // G5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);
    } else if (type === 'delete') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(240, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + (type === 'success' ? 0.4 : 0.1));
  } catch (e) {}
};

export default function OtpInputMorph() {
  const [digits, setDigits] = useState(['', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [status, setStatus] = useState('idle'); // 'idle' | 'verifying' | 'success' | 'shake'
  const inputRefs = useRef([]);

  const triggerVerification = (code) => {
    setStatus('verifying');

    setTimeout(() => {
      if (code === '0000') {
        setStatus('shake');
        setTimeout(() => setStatus('idle'), 600);
      } else {
        setStatus('success');
        playAudioFeedback('success');
        setTimeout(() => {
          setStatus('idle');
          setDigits(['', '', '', '']);
          setFocusedIndex(0);
          if (inputRefs.current[0]) inputRefs.current[0].focus({ preventScroll: true });
        }, 2200);
      }
    }, 600);
  };

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (status === 'verifying' || status === 'success') return;

    // Handle single character
    const char = val.slice(-1);
    if (!/^\d*$/.test(char)) return;

    playAudioFeedback(char ? 'click' : 'delete');

    const nextDigits = [...digits];
    nextDigits[index] = char;
    setDigits(nextDigits);

    if (char && index < 3) {
      setFocusedIndex(index + 1);
      inputRefs.current[index + 1]?.focus({ preventScroll: true });
    }

    // Check if filled
    if (char && index === 3 && nextDigits.every((d) => d !== '')) {
      triggerVerification(nextDigits.join(''));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      playAudioFeedback('delete');
      const nextDigits = [...digits];
      nextDigits[index - 1] = '';
      setDigits(nextDigits);
      setFocusedIndex(index - 1);
      inputRefs.current[index - 1]?.focus({ preventScroll: true });
    } else if (e.key === 'ArrowLeft' && index > 0) {
      setFocusedIndex(index - 1);
      inputRefs.current[index - 1]?.focus({ preventScroll: true });
    } else if (e.key === 'ArrowRight' && index < 3) {
      setFocusedIndex(index + 1);
      inputRefs.current[index + 1]?.focus({ preventScroll: true });
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (!/^\d+$/.test(pasted)) return;

    const chars = pasted.slice(0, 4).split('');
    const next = ['', '', '', ''];
    chars.forEach((c, i) => {
      next[i] = c;
    });
    setDigits(next);
    playAudioFeedback('click');

    const lastIdx = Math.min(chars.length, 3);
    setFocusedIndex(lastIdx);
    inputRefs.current[lastIdx]?.focus({ preventScroll: true });

    if (chars.length >= 4) {
      triggerVerification(next.join(''));
    }
  };

  const autofillSample = (code = '8421') => {
    const chars = code.split('');
    chars.forEach((c, i) => {
      setTimeout(() => {
        setDigits((prev) => {
          const next = [...prev];
          next[i] = c;
          return next;
        });
        setFocusedIndex(i);
        playAudioFeedback('click');
        if (i === 3) {
          triggerVerification(code);
        }
      }, i * 110);
    });
  };

  return (
    <div style={styles.stage}>
      {/* 4 Squircle Boxes Row (Matching Reference Image) */}
      <div
        style={{
          ...styles.boxesRow,
          animation: status === 'shake' ? 'shakeBoxes 0.45s cubic-bezier(0.36, 0.07, 0.19, 0.97)' : 'none'
        }}
      >
        {digits.map((digit, index) => {
          const isFocused = focusedIndex === index && status !== 'success';
          const isFilled = Boolean(digit);

          return (
            <div
              key={index}
              onClick={() => {
                setFocusedIndex(index);
                inputRefs.current[index]?.focus({ preventScroll: true });
              }}
              style={{
                ...styles.squircleBox,
                borderColor: status === 'success'
                  ? '#10b981'
                  : isFocused
                  ? '#18181b'
                  : 'transparent',
                transform: isFocused
                  ? 'translateY(-2px) scale(1.04)'
                  : isFilled
                  ? 'scale(1)'
                  : 'scale(1)',
                boxShadow: status === 'success'
                  ? '0 6px 20px rgba(16, 185, 129, 0.2)'
                  : isFocused
                  ? '0 8px 24px rgba(0, 0, 0, 0.08)'
                  : '0 2px 10px rgba(0, 0, 0, 0.03)'
              }}
            >
              <input
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                onFocus={() => setFocusedIndex(index)}
                style={styles.hiddenInput}
              />

              {/* Displayed Digit or Animated Caret */}
              {isFilled ? (
                <span
                  style={{
                    ...styles.digitText,
                    animation: 'digitPopIn 0.24s cubic-bezier(0.175, 0.885, 0.32, 1.3)'
                  }}
                >
                  {digit}
                </span>
              ) : isFocused && status !== 'verifying' ? (
                <span style={styles.caretCursor} />
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Status Bar / Actions */}
      <div style={styles.statusRow}>
        {status === 'success' ? (
          <div style={styles.successBadge}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Verified</span>
          </div>
        ) : status === 'verifying' ? (
          <div style={styles.verifyingText}>
            <span style={styles.spinner} />
            <span>Verifying code...</span>
          </div>
        ) : (
          <button
            style={styles.autofillBtn}
            onClick={() => autofillSample('8421')}
            title="Auto-enter sample code"
          >
            <span>Auto-fill 8421</span>
          </button>
        )}
      </div>

      {/* Global CSS for Caret Blink & Pop-in */}
      <style>{`
        @keyframes digitPopIn {
          0% {
            transform: scale(0.4) translateY(6px);
            opacity: 0;
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        @keyframes caretPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes shakeBoxes {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  stage: {
    width: '100%',
    height: '100%',
    minHeight: '280px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    position: 'relative',
    userSelect: 'none',
    boxSizing: 'border-box',
    padding: '24px'
  },
  boxesRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '14px'
  },
  squircleBox: {
    width: '64px',
    height: '70px',
    background: '#ffffff',
    borderRadius: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    cursor: 'pointer',
    border: '2px solid transparent',
    transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
    boxSizing: 'border-box'
  },
  hiddenInput: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer',
    zIndex: 5
  },
  digitText: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#09090b',
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '-0.02em',
    lineHeight: 1
  },
  caretCursor: {
    width: '2.5px',
    height: '24px',
    background: '#09090b',
    borderRadius: '2px',
    animation: 'caretPulse 1s ease-in-out infinite'
  },
  statusRow: {
    marginTop: '28px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  autofillBtn: {
    background: '#ffffff',
    color: '#52525b',
    border: '1px solid #e4e4e7',
    padding: '6px 14px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
    transition: 'all 0.16s ease'
  },
  successBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#059669',
    background: '#ecfdf5',
    padding: '6px 14px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: '700',
    animation: 'digitPopIn 0.3s ease'
  },
  verifyingText: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#71717a',
    fontSize: '13px',
    fontWeight: '500'
  },
  spinner: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: '2px solid rgba(0, 0, 0, 0.1)',
    borderTopColor: '#18181b',
    animation: 'spin 0.6s linear infinite',
    display: 'inline-block'
  }
};
