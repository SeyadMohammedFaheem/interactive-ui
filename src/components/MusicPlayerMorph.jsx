import React, { useState, useRef, useEffect } from 'react';

const TRACKS = [
  {
    id: 't1',
    title: 'Goat Field',
    artist: 'Side B',
    cover: '/images/card_mountain.jpg',
    src: '/audio/goat_field.mp3',
    durationSec: 234 // 3:54
  },
  {
    id: 't2',
    title: 'Neon Horizon',
    artist: 'Chroma Wave',
    cover: '/images/card_mesh.jpg',
    src: '/audio/neon_horizon.mp3',
    durationSec: 198
  },
  {
    id: 't3',
    title: 'Alpine Echo',
    artist: 'Summit High',
    cover: '/images/card_botanical.jpg',
    src: '/audio/goat_field.mp3',
    durationSec: 245
  }
];

export default function MusicPlayerMorph() {
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(162); // 2:42 matching screenshot
  const [durationSec, setDurationSec] = useState(234);
  const [isLiked, setIsLiked] = useState(true); // Solid black heart matching screenshot
  const [heartPop, setHeartPop] = useState(false);

  const audioRef = useRef(null);
  const progressBarRef = useRef(null);

  const currentTrack = TRACKS[trackIndex];

  // Sync with HTML5 Audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => {
        // Handle browser autoplay policy restrictions
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, trackIndex]);

  const onLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration) {
      setDurationSec(audioRef.current.duration);
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTimeSec(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDurationSec(audioRef.current.duration);
      }
    }
  };

  const onEnded = () => {
    handleNext();
  };

  const remainingSec = Math.max(0, durationSec - currentTimeSec);

  // Format seconds to mm:ss
  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = Math.floor(totalSec % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleNext = () => {
    setTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setCurrentTimeSec(0);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    setTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setCurrentTimeSec(0);
    setIsPlaying(true);
  };

  const toggleHeart = (e) => {
    e.stopPropagation();
    setIsLiked((prev) => !prev);
    setHeartPop(true);
    setTimeout(() => setHeartPop(false), 300);
  };

  const handleSeek = (e) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetTime = ratio * durationSec;
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
    setCurrentTimeSec(targetTime);
  };

  const progressPercent = Math.min(100, (currentTimeSec / (durationSec || 1)) * 100);

  return (
    <div style={styles.stage}>
      {/* Real Audio Element */}
      <audio
        ref={audioRef}
        src={currentTrack.src}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={onEnded}
        preload="metadata"
      />

      {/* Music Player Card (Pixel-perfect matching screenshot) */}
      <div style={styles.card}>
        {/* Top Header Row */}
        <div style={styles.topRow}>
          {/* Album Cover Squircle */}
          <div style={styles.coverWrapper}>
            <img
              src={currentTrack.cover}
              alt={currentTrack.title}
              style={{
                ...styles.coverImage,
                transform: isPlaying ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            />
          </div>

          {/* Track Info */}
          <div style={styles.trackInfo}>
            <h3 style={styles.trackTitle}>{currentTrack.title}</h3>
            <p style={styles.trackArtist}>{currentTrack.artist}</p>
          </div>

          {/* Like Heart Button (Solid Black Heart matching screenshot) */}
          <button
            style={{
              ...styles.heartButton,
              transform: heartPop ? 'scale(1.3)' : 'scale(1)',
              transition: 'transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
            onClick={toggleHeart}
            title={isLiked ? 'Unlike' : 'Like'}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill={isLiked ? '#18181b' : 'none'}
              stroke="#18181b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>

        {/* Progress Bar & Timestamps */}
        <div style={styles.progressSection}>
          <div
            ref={progressBarRef}
            style={styles.progressBarTrack}
            onClick={handleSeek}
          >
            <div
              style={{
                ...styles.progressBarFill,
                width: `${progressPercent}%`
              }}
            />
          </div>

          {/* Time Labels */}
          <div style={styles.timeLabelsRow}>
            <span style={styles.timeText}>{formatTime(currentTimeSec)}</span>
            <span style={styles.timeText}>-{formatTime(remainingSec)}</span>
          </div>
        </div>

        {/* Playback Controls (Previous, Play/Pause, Next) */}
        <div style={styles.controlsRow}>
          {/* Previous Track Button */}
          <button
            style={styles.skipButton}
            onClick={handlePrev}
            title="Previous track"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#18181b"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="19 20 9 12 19 4 19 20" />
              <line x1="5" y1="19" x2="5" y2="5" />
            </svg>
          </button>

          {/* Big Circular Play / Pause Button */}
          <button
            style={styles.playPauseButton}
            onClick={togglePlay}
            title={isPlaying ? 'Pause' : 'Play audio'}
          >
            {isPlaying ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
                <rect x="6" y="4" width="4" height="16" rx="1.5" />
                <rect x="14" y="4" width="4" height="16" rx="1.5" />
              </svg>
            ) : (
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="#ffffff"
                style={{ marginLeft: '2px' }}
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </button>

          {/* Next Track Button */}
          <button
            style={styles.skipButton}
            onClick={handleNext}
            title="Next track"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#18181b"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="5 4 15 12 5 20 5 4" />
              <line x1="19" y1="5" x2="19" y2="19" />
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
  card: {
    width: '350px',
    maxWidth: '92vw',
    background: '#ffffff',
    borderRadius: '28px',
    padding: '26px 28px',
    boxSizing: 'border-box',
    boxShadow: '0 10px 30px -4px rgba(0, 0, 0, 0.06), 0 2px 6px -2px rgba(0, 0, 0, 0.02)',
    border: '1px solid rgba(0, 0, 0, 0.03)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '28px'
  },
  coverWrapper: {
    width: '58px',
    height: '58px',
    borderRadius: '16px',
    overflow: 'hidden',
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
  },
  coverImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block'
  },
  trackInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  trackTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#18181b',
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  trackArtist: {
    margin: 0,
    fontSize: '14.5px',
    fontWeight: '500',
    color: '#71717a',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  heartButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    outline: 'none'
  },
  progressSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '26px'
  },
  progressBarTrack: {
    width: '100%',
    height: '3.5px',
    background: '#e5e7eb',
    borderRadius: '999px',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    background: '#18181b',
    borderRadius: '999px',
    transition: 'width 0.1s linear'
  },
  timeLabelsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  timeText: {
    fontSize: '12.5px',
    color: '#71717a',
    fontWeight: '500',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  controlsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '32px'
  },
  skipButton: {
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
  playPauseButton: {
    width: '54px',
    height: '54px',
    borderRadius: '50%',
    background: '#18181b',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6px 18px -2px rgba(0, 0, 0, 0.25)',
    transition: 'transform 0.15s ease, background 0.15s ease',
    outline: 'none'
  }
};
