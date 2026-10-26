import React, { useState, useRef, useEffect, useCallback } from 'react';

// Web Audio API sounds for tactile Apple-grade feel
const playMicSound = (type = 'start') => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const t = ctx.currentTime;
    if (type === 'start') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, t);
      osc.frequency.exponentialRampToValueAtTime(840, t + 0.08);
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
    } else if (type === 'cancel') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.12);
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.13);
    } else if (type === 'stop') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(740, t);
      osc.frequency.exponentialRampToValueAtTime(520, t + 0.07);
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.08);
    }
  } catch (e) {
    // Ignore audio restrictions
  }
};

const NUM_WAVE_BARS = 24;

export default function HoldToRecordMorph({
  auto = false,
  speed = 4,
  sound = true,
  theme = 'Light'
}) {
  // States: 'idle' | 'recording' | 'preview'
  const [state, setState] = useState('idle');
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [dragX, setDragX] = useState(0); // Slide to cancel distance
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0); // 0 to 1
  const [audioDuration, setAudioDuration] = useState(2); // In seconds
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [isRealMicActive, setIsRealMicActive] = useState(false);
  const [micErrorNote, setMicErrorNote] = useState('');

  // Waveform heights state (24 bars)
  const [waveHeights, setWaveHeights] = useState(() =>
    Array.from({ length: NUM_WAVE_BARS }, () => 6 + Math.random() * 16)
  );

  const containerRef = useRef(null);
  const startXRef = useRef(0);
  const isHoldingRef = useRef(false);
  const recordStartTimeRef = useRef(0);

  // Real Audio Recording Refs
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const audioPlaybackRef = useRef(null);
  const recordedBlobUrlRef = useRef(null);
  const sampledWaveformRef = useRef([]);
  const timerIntervalRef = useRef(null);

  // Format seconds to M:SS
  const formatTime = (secs) => {
    const sInt = Math.floor(secs);
    const m = Math.floor(sInt / 60);
    const s = sInt % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Clean up all active audio recording streams
  const stopRealAudioStream = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (err) {}
      audioContextRef.current = null;
    }
    setIsRealMicActive(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRealAudioStream();
      if (audioPlaybackRef.current) {
        audioPlaybackRef.current.pause();
      }
      if (recordedBlobUrlRef.current) {
        URL.revokeObjectURL(recordedBlobUrlRef.current);
      }
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [stopRealAudioStream]);

  // Real Microphone Capture Initializer
  const startRealRecording = async () => {
    try {
      audioChunksRef.current = [];
      sampledWaveformRef.current = [];

      // 1. Request real microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      mediaStreamRef.current = stream;

      // 2. Setup Web Audio Analyser for live voice frequency visualization
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.65;
      source.connect(analyser);
      analyserRef.current = analyser;

      setIsRealMicActive(true);
      setMicErrorNote('');

      // 3. Real-time audio frequency loop
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateRealWaveform = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Map live frequencies to our 24 waveform bars
        const newBars = Array.from({ length: NUM_WAVE_BARS }, (_, i) => {
          // Sample across bins
          const binIndex = Math.min(dataArray.length - 1, Math.floor((i / NUM_WAVE_BARS) * dataArray.length));
          const val = dataArray[binIndex] || 0;
          // Scale 0-255 to 4px - 26px
          const scaledHeight = Math.max(4, Math.min(26, (val / 255) * 26));
          return scaledHeight;
        });

        setWaveHeights(newBars);
        sampledWaveformRef.current.push([...newBars]);
        animFrameRef.current = requestAnimationFrame(updateRealWaveform);
      };
      animFrameRef.current = requestAnimationFrame(updateRealWaveform);

      // 4. Setup MediaRecorder
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
        else if (MediaRecorder.isTypeSupported('audio/ogg')) mimeType = 'audio/ogg';
        else mimeType = '';
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
          if (recordedBlobUrlRef.current) {
            URL.revokeObjectURL(recordedBlobUrlRef.current);
          }
          const blobUrl = URL.createObjectURL(blob);
          recordedBlobUrlRef.current = blobUrl;

          // Calculate real final waveform signature from samples
          const samples = sampledWaveformRef.current;
          if (samples.length > 0) {
            const finalWave = Array.from({ length: NUM_WAVE_BARS }, (_, barIdx) => {
              const sampleSlice = samples.map(frame => frame[barIdx]);
              const avg = sampleSlice.reduce((a, b) => a + b, 0) / sampleSlice.length;
              return Math.max(5, Math.min(25, avg * 1.3));
            });
            setWaveHeights(finalWave);
          }

          // Setup real audio player
          const audio = new Audio(blobUrl);
          audioPlaybackRef.current = audio;

          audio.onloadedmetadata = () => {
            if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
              setAudioDuration(audio.duration);
            }
          };

          audio.ontimeupdate = () => {
            if (audio.duration) {
              setPlayProgress(audio.currentTime / audio.duration);
              setCurrentTimeSec(audio.currentTime);
            }
          };

          audio.onended = () => {
            setIsPlaying(false);
            setPlayProgress(0);
            setCurrentTimeSec(0);
          };
        }
      };

      recorder.start(100); // 100ms chunks
    } catch (err) {
      console.warn('Microphone permission not granted or unavailable, using high-fidelity fallback:', err);
      setMicErrorNote('Mic access unavailable, using simulated voice capture');
      // Synthetic realistic simulation fallback
      let startTime = Date.now();
      const syntheticLoop = () => {
        const t = (Date.now() - startTime) * 0.01;
        setWaveHeights(prev =>
          prev.map((_, i) => 5 + Math.abs(Math.sin(t + i * 0.35) * 16) + Math.random() * 5)
        );
        animFrameRef.current = requestAnimationFrame(syntheticLoop);
      };
      animFrameRef.current = requestAnimationFrame(syntheticLoop);
    }
  };

  // Start recording on pointer down
  const handlePointerDown = (e) => {
    if (state === 'preview') return;
    isHoldingRef.current = true;
    startXRef.current = e.clientX;
    recordStartTimeRef.current = Date.now();
    setDragX(0);
    setState('recording');
    setRecordSeconds(0);
    setCurrentTimeSec(0);

    if (sound) playMicSound('start');

    // Start live microphone recording
    startRealRecording();

    // Start timer counter
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setRecordSeconds(prev => prev + 1);
    }, 1000);

    if (e.target.setPointerCapture) {
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  // Slide to cancel tracking
  const handlePointerMove = (e) => {
    if (!isHoldingRef.current || state !== 'recording') return;
    const dx = e.clientX - startXRef.current;
    if (dx < 0) {
      setDragX(dx);
      // Cancel threshold exceeded (-90px)
      if (dx < -90) {
        isHoldingRef.current = false;
        stopRealAudioStream();
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        setState('idle');
        setDragX(0);
        if (sound) playMicSound('cancel');
      }
    } else {
      setDragX(0);
    }
  };

  // Finish recording and transition to Preview Playback
  const handlePointerUp = () => {
    if (!isHoldingRef.current || state !== 'recording') return;
    isHoldingRef.current = false;

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    const duration = Math.max(1, (Date.now() - recordStartTimeRef.current) / 1000);
    setAudioDuration(duration);

    stopRealAudioStream();
    if (sound) playMicSound('stop');
    setDragX(0);
    setState('preview');
  };

  // Reset / Discard recorded voice note
  const handleReset = (e) => {
    if (e) e.stopPropagation();
    stopRealAudioStream();
    if (audioPlaybackRef.current) {
      audioPlaybackRef.current.pause();
      audioPlaybackRef.current = null;
    }
    if (recordedBlobUrlRef.current) {
      URL.revokeObjectURL(recordedBlobUrlRef.current);
      recordedBlobUrlRef.current = null;
    }
    setState('idle');
    setIsPlaying(false);
    setPlayProgress(0);
    setRecordSeconds(0);
    setCurrentTimeSec(0);
    setDragX(0);
    if (sound) playMicSound('cancel');
  };

  // Toggle Real Audio Playback
  const handleTogglePlay = (e) => {
    e.stopPropagation();

    if (audioPlaybackRef.current) {
      if (isPlaying) {
        audioPlaybackRef.current.pause();
        setIsPlaying(false);
      } else {
        audioPlaybackRef.current.play().catch(err => console.log('Audio playback error:', err));
        setIsPlaying(true);
      }
    } else {
      // Fallback timer playback
      setIsPlaying(!isPlaying);
    }
  };

  // Handle interactive scrubber click
  const handleScrubberClick = (e, index) => {
    e.stopPropagation();
    if (state !== 'preview') return;
    const progress = (index + 1) / NUM_WAVE_BARS;
    setPlayProgress(progress);
    if (audioPlaybackRef.current && audioPlaybackRef.current.duration) {
      audioPlaybackRef.current.currentTime = progress * audioPlaybackRef.current.duration;
    }
  };

  return (
    <div style={styles.stage}>
      <div style={styles.morphWrapper}>
        {/* Main Morphing Pill Capsule */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            ...styles.capsule,
            ...(state === 'idle'
              ? styles.capsuleIdle
              : (state === 'recording' ? styles.capsuleRecording : styles.capsulePreview)),
            transform: `translateX(${dragX * 0.35}px) scale(${state === 'recording' ? 1.02 : 1})`,
            cursor: state === 'idle' ? 'pointer' : (state === 'recording' ? 'grabbing' : 'default')
          }}
        >
          {/* STATE 1: IDLE ("Hold to record") */}
          {state === 'idle' && (
            <div style={styles.idleContent}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#18181b"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="22"></line>
              </svg>
              <span style={styles.idleText}>Hold to record</span>
            </div>
          )}

          {/* STATE 2: RECORDING (Red Pulsing Dot + Live Voice Waveform) */}
          {state === 'recording' && (
            <div style={styles.recordingContent}>
              <div style={styles.recordingLeft}>
                <div style={styles.redDot} />
                <span style={styles.timerText}>
                  {formatTime(recordSeconds)}
                </span>
              </div>

              {/* Live Real-Voice Waveform Bars */}
              <div style={styles.waveformContainer}>
                {waveHeights.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      ...styles.waveBar,
                      height: `${h}px`,
                      backgroundColor: '#18181b'
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* STATE 3: PREVIEW (Matching screenshot: Play Button + Scrubber Waveform + Time + Close) */}
          {state === 'preview' && (
            <div style={styles.previewContent}>
              {/* Circular Play / Pause Button */}
              <button
                style={styles.playBtn}
                onClick={handleTogglePlay}
                title={isPlaying ? 'Pause playback' : 'Play real recording'}
              >
                {isPlaying ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#ffffff">
                    <rect x="6" y="4" width="4" height="16" rx="1"></rect>
                    <rect x="14" y="4" width="4" height="16" rx="1"></rect>
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#ffffff" style={{ marginLeft: '2px' }}>
                    <polygon points="6 4 20 12 6 20 6 4" />
                  </svg>
                )}
              </button>

              {/* Real Recorded Audio Waveform with interactive scrubber */}
              <div style={styles.waveformContainer}>
                {waveHeights.map((h, i) => {
                  const barProgress = i / NUM_WAVE_BARS;
                  const isFilled = barProgress <= playProgress;
                  return (
                    <div
                      key={i}
                      onClick={(e) => handleScrubberClick(e, i)}
                      style={{
                        ...styles.waveBar,
                        height: `${h}px`,
                        backgroundColor: isFilled ? '#18181b' : '#94a3b8',
                        cursor: 'pointer',
                        transition: 'background-color 0.1s ease'
                      }}
                      title="Seek audio position"
                    />
                  );
                })}
              </div>

              {/* Recorded Duration Time (Matching 0:02 in screenshot) */}
              <span style={styles.previewDuration}>
                {formatTime(isPlaying ? currentTimeSec : audioDuration)}
              </span>

              {/* Discard / Close Button */}
              <button
                style={styles.closeBtn}
                onClick={handleReset}
                title="Discard Voice Note"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Subtitle Hint: < Slide to cancel (Only in recording state) */}
        <div
          style={{
            ...styles.slideCancelHint,
            opacity: state === 'recording' ? 1 : 0,
            transform: `translateY(${state === 'recording' ? 0 : -4}px)`
          }}
        >
          <span>‹ Slide to cancel</span>
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
  morphWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    position: 'relative'
  },
  capsule: {
    height: '56px',
    borderRadius: '999px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    transition: 'width 0.28s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease, box-shadow 0.2s ease'
  },
  capsuleIdle: {
    width: '210px',
    background: '#ffffff',
    border: '1.5px solid transparent',
    boxShadow: '0 4px 18px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
    padding: '0 20px'
  },
  capsuleRecording: {
    width: '280px',
    background: '#ffffff',
    border: '2px solid #2563eb', // Vibrant royal blue matching reference
    boxShadow: '0 8px 24px -4px rgba(37, 99, 235, 0.22), 0 2px 8px rgba(0, 0, 0, 0.04)',
    padding: '0 16px'
  },
  capsulePreview: {
    width: '292px',
    background: '#ffffff',
    border: '2px solid #2563eb', // Exact royal blue ring from screenshot
    boxShadow: '0 8px 26px -4px rgba(37, 99, 235, 0.2), 0 2px 8px rgba(0, 0, 0, 0.04)',
    padding: '0 12px 0 10px'
  },
  idleContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  idleText: {
    fontSize: '14.5px',
    fontWeight: '600',
    color: '#18181b',
    letterSpacing: '-0.01em'
  },
  recordingContent: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 4px'
  },
  recordingLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  redDot: {
    width: '9px',
    height: '9px',
    borderRadius: '50%',
    backgroundColor: '#ef4444',
    boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)',
    animation: 'pulseRecord 1.1s ease-in-out infinite'
  },
  timerText: {
    fontSize: '14px',
    fontWeight: '700',
    fontVariantNumeric: 'tabular-nums',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', monospace",
    color: '#18181b',
    minWidth: '34px'
  },
  waveformContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '2.5px',
    height: '28px',
    padding: '0 6px',
    flex: 1,
    justifyContent: 'center'
  },
  waveBar: {
    width: '2.5px',
    borderRadius: '999px',
    minHeight: '4px'
  },
  previewContent: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px'
  },
  playBtn: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    backgroundColor: '#18191f',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'transform 0.15s ease, background-color 0.15s ease'
  },
  previewDuration: {
    fontSize: '13.5px',
    fontWeight: '700',
    fontVariantNumeric: 'tabular-nums',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', monospace",
    color: '#1e293b',
    minWidth: '32px',
    textAlign: 'right'
  },
  closeBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'transparent',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'background-color 0.15s ease'
  },
  slideCancelHint: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#71717a',
    letterSpacing: '-0.01em',
    pointerEvents: 'none',
    transition: 'opacity 0.2s ease, transform 0.2s ease'
  }
};
