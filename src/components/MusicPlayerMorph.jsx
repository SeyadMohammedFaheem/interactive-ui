import React, { useState, useRef, useEffect, useCallback } from 'react';

const TRACKS = [
  {
    id: 't1',
    title: 'Cabra Field',
    artist: 'Side B',
    cover: '/images/cabra_field.jpg',
    src: '/audio/goat_field.mp3',
    initialTimeSec: 169, // 2:49 matching screenshot
    durationSec: 218    // 3:38 -> remaining -0:49
  },
  {
    id: 't2',
    title: 'Neon Horizon',
    artist: 'Chroma Wave',
    cover: '/images/card_mesh.jpg',
    src: '/audio/neon_horizon.mp3',
    initialTimeSec: 45,
    durationSec: 198
  },
  {
    id: 't3',
    title: 'Alpine Echo',
    artist: 'Summit High',
    cover: '/images/spread_mountain.jpg',
    src: '/audio/goat_field.mp3',
    initialTimeSec: 80,
    durationSec: 245
  }
];

// Delicate haptic click sound
const playClickSound = (type = 'click') => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(560, ctx.currentTime);
      gain.gain.setValueAtTime(0.035, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.045);
    } else if (type === 'skip') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(680, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.055);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    }
  } catch (e) {}
};

export default function MusicPlayerMorph({
  auto = false,
  speed = 4,
  sound = true,
  theme = 'Light'
}) {
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true); // Default to playing matching pause icon in screenshot
  const [currentTimeSec, setCurrentTimeSec] = useState(TRACKS[0].initialTimeSec);
  const [durationSec, setDurationSec] = useState(TRACKS[0].durationSec);
  const [isScrubbing, setIsScrubbing] = useState(false);

  const audioRef = useRef(null);
  const progressTrackRef = useRef(null);

  const currentTrack = TRACKS[trackIndex];

  // Sync HTML5 Audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => {
        // Handled browser autoplay restrictions gracefully
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, trackIndex]);

  const onLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration) {
      setDurationSec(audioRef.current.duration);
      if (audioRef.current.currentTime === 0 && currentTrack.initialTimeSec) {
        audioRef.current.currentTime = currentTrack.initialTimeSec;
      }
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current && !isScrubbing) {
      setCurrentTimeSec(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDurationSec(audioRef.current.duration);
      }
    }
  };

  const handleNext = useCallback(() => {
    if (sound) playClickSound('skip');
    setTrackIndex((prev) => {
      const nextIdx = (prev + 1) % TRACKS.length;
      setCurrentTimeSec(TRACKS[nextIdx].initialTimeSec || 0);
      setDurationSec(TRACKS[nextIdx].durationSec);
      return nextIdx;
    });
  }, [sound]);

  const handlePrev = useCallback(() => {
    if (sound) playClickSound('skip');
    setTrackIndex((prev) => {
      const prevIdx = (prev - 1 + TRACKS.length) % TRACKS.length;
      setCurrentTimeSec(TRACKS[prevIdx].initialTimeSec || 0);
      setDurationSec(TRACKS[prevIdx].durationSec);
      return prevIdx;
    });
  }, [sound]);

  const onEnded = () => {
    handleNext();
  };

  // Autoplay support
  useEffect(() => {
    if (!auto) return;
    const interval = setInterval(() => {
      setCurrentTimeSec((prev) => {
        const next = prev + 1;
        if (next >= durationSec) {
          handleNext();
          return 0;
        }
        return next;
      });
    }, 1000 / Math.max(1, speed / 2));

    return () => clearInterval(interval);
  }, [auto, speed, durationSec, handleNext]);

  const togglePlay = () => {
    if (sound) playClickSound('click');
    setIsPlaying((prev) => !prev);
  };

  // Interactive scrubber seek
  const handleSeek = (e) => {
    if (!progressTrackRef.current) return;
    const rect = progressTrackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const target = ratio * durationSec;
    setCurrentTimeSec(target);
    if (audioRef.current) {
      audioRef.current.currentTime = target;
    }
    if (sound) playClickSound('click');
  };

  const handleScrubberPointerDown = (e) => {
    setIsScrubbing(true);
    handleSeek(e);
    if (e.target.setPointerCapture) {
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  const handleScrubberPointerMove = (e) => {
    if (isScrubbing) {
      handleSeek(e);
    }
  };

  const handleScrubberPointerUp = () => {
    setIsScrubbing(false);
  };

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    const s = Math.floor(secs);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${rem < 10 ? '0' : ''}${rem}`;
  };

  const remainingSec = Math.max(0, durationSec - currentTimeSec);
  const progressPercent = Math.min(100, Math.max(0, (currentTimeSec / (durationSec || 1)) * 100));

  return (
    <div style={styles.stage}>
      {/* Hidden real audio engine */}
      <audio
        ref={audioRef}
        src={currentTrack.src}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={onEnded}
        preload="metadata"
      />

      {/* Main Music Player Card Shell */}
      <div style={styles.card}>
        {/* Top Artwork Card with Overlaid Text & Scrubber */}
        <div style={styles.artworkCard}>
          <img
            src={currentTrack.cover}
            alt={currentTrack.title}
            style={{
              ...styles.artworkImage,
              transform: isPlaying ? 'scale(1.03)' : 'scale(1)',
              transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />

          {/* Bottom Dark Gradient Scrim */}
          <div style={styles.gradientScrim} />

          {/* Overlaid Track Info, Scrubber & Timestamps */}
          <div style={styles.overlayContent}>
            {/* Title & Artist */}
            <div style={styles.trackInfo}>
              <h2 style={styles.trackTitle}>{currentTrack.title}</h2>
              <p style={styles.trackSubtitle}>{currentTrack.artist}</p>
            </div>

            {/* Interactive Progress Bar */}
            <div
              ref={progressTrackRef}
              style={styles.progressTrack}
              onPointerDown={handleScrubberPointerDown}
              onPointerMove={handleScrubberPointerMove}
              onPointerUp={handleScrubberPointerUp}
              onPointerCancel={handleScrubberPointerUp}
              title="Seek audio track"
            >
              <div
                style={{
                  ...styles.progressFill,
                  width: `${progressPercent}%`
                }}
              />
            </div>

            {/* Timestamps (Current and Remaining) */}
            <div style={styles.timestampsRow}>
              <span style={styles.timestampText}>{formatTime(currentTimeSec)}</span>
              <span style={styles.timestampText}>-{formatTime(remainingSec)}</span>
            </div>
          </div>
        </div>

        {/* Small Horizontal Notch / Divider Handle */}
        <div style={styles.notchHandle} />

        {/* Bottom Playback Controls Shelf */}
        <div style={styles.controlsShelf}>
          {/* Previous Track Button */}
          <button
            style={styles.controlBtn}
            onClick={handlePrev}
            title="Previous track"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="#18181b"
            >
              <path d="M6 5h2v14H6V5zm12 0l-10 7 10 7V5z" />
            </svg>
          </button>

          {/* Big Solid Black Play / Pause Button */}
          <button
            style={styles.playPauseBtn}
            onClick={togglePlay}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              /* Pause Bars (matching screenshot) */
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
                <rect x="6" y="4" width="3.5" height="16" rx="1.75" />
                <rect x="14.5" y="4" width="3.5" height="16" rx="1.75" />
              </svg>
            ) : (
              /* Play Triangle */
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="#ffffff"
                style={{ marginLeft: '2px' }}
              >
                <polygon points="6 4 20 12 6 20 6 4" />
              </svg>
            )}
          </button>

          {/* Next Track Button */}
          <button
            style={styles.controlBtn}
            onClick={handleNext}
            title="Next track"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="#18181b"
            >
              <path d="M6 5l10 7-10 7V5zm10 0h2v14h-2V5z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  stage: {
    width: '100%',
    height: '100%',
    minHeight: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    position: 'relative',
    userSelect: 'none',
    boxSizing: 'border-box',
    padding: '16px 12px'
  },
  card: {
    width: '276px',
    maxWidth: '92vw',
    background: '#ffffff',
    borderRadius: '26px',
    padding: '10px',
    boxSizing: 'border-box',
    boxShadow: '0 16px 42px -10px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04)',
    border: '1px solid rgba(0, 0, 0, 0.04)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    fontFamily: "'Plus Jakarta Sans', sans-serif"
  },
  artworkCard: {
    width: '100%',
    height: '270px',
    borderRadius: '18px',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0 6px 18px -4px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#3b82f6'
  },
  artworkImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    userSelect: 'none',
    pointerEvents: 'none'
  },
  gradientScrim: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(0,0,0,0) 38%, rgba(0,0,0,0.36) 72%, rgba(0,0,0,0.72) 100%)',
    pointerEvents: 'none'
  },
  overlayContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    zIndex: 2
  },
  trackInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    marginBottom: '10px'
  },
  trackTitle: {
    margin: 0,
    fontSize: '19px',
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: '-0.02em',
    lineHeight: 1.2
  },
  trackSubtitle: {
    margin: 0,
    fontSize: '13px',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.76)',
    letterSpacing: '-0.01em'
  },
  progressTrack: {
    width: '100%',
    height: '4px',
    background: 'rgba(255, 255, 255, 0.28)',
    borderRadius: '999px',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    touchAction: 'none'
  },
  progressFill: {
    height: '100%',
    background: '#ffffff',
    borderRadius: '999px',
    transition: 'width 0.1s linear'
  },
  timestampsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '5px'
  },
  timestampText: {
    fontSize: '11.5px',
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600',
    letterSpacing: '-0.01em',
    fontVariantNumeric: 'tabular-nums'
  },
  notchHandle: {
    width: '28px',
    height: '3.5px',
    borderRadius: '999px',
    background: '#d4d4d8',
    margin: '6px auto',
    flexShrink: 0
  },
  controlsShelf: {
    width: '100%',
    height: '76px',
    borderRadius: '18px',
    background: '#f4f4f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '28px',
    boxSizing: 'border-box'
  },
  controlBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    transition: 'transform 0.15s ease',
    outline: 'none'
  },
  playPauseBtn: {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    background: '#18181b',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6px 18px -2px rgba(0, 0, 0, 0.28)',
    transition: 'transform 0.15s ease, background 0.15s ease',
    outline: 'none'
  }
};
