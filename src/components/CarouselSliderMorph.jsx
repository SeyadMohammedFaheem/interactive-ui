import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';

const CARDS_DATA = [
  {
    id: 1,
    title: 'Vintage Heavyweight Tee',
    description: 'Premium 280gsm organic cotton with relaxed drop-shoulder silhouette.',
    price: '$ 85',
    image: '/images/1.png'
  },
  {
    id: 2,
    title: 'Acid Wash Oversized Tee',
    description: 'Custom vintage wash finish with heavyweight structure and soft feel.',
    price: '$ 95',
    image: '/images/2wo.png'
  },
  {
    id: 3,
    title: 'Minimalist Essential Tee',
    description: 'Ultra-soft combed cotton short sleeve tailored for modern everyday wear.',
    price: '$ 78',
    image: '/images/3ee.png'
  },
  {
    id: 4,
    title: 'Urban Graphic Boxy Tee',
    description: 'Heavyweight boxy silhouette featuring contemporary minimalist graphics.',
    price: '$ 110',
    image: '/images/4u.png'
  }
];

export default function CarouselSliderMorph() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [likedMap, setLikedMap] = useState({});
  const [boughtMap, setBoughtMap] = useState({});

  const stageRef = useRef(null);
  const cardRefs = useRef([]);
  const heartRefs = useRef([]);
  const buyRefs = useRef([]);

  const isDragging = useRef(false);
  const startX = useRef(0);
  const dragOffsetAngle = useRef(0);
  const total = CARDS_DATA.length;

  const ANGLE_STEP = 65; // degrees arc for circular motion
  const WHEEL_RADIUS = 520; // 3D radius for circular orbit

  const getCardAngle = (index, targetActive, dragOffset = 0) => {
    let diff = index - targetActive;
    while (diff < -total / 2) diff += total;
    while (diff > total / 2) diff -= total;
    return diff * ANGLE_STEP + dragOffset;
  };

  const updateWheelPositions = (targetActive, duration = 0, dragOffset = 0) => {
    cardRefs.current.forEach((cardEl, idx) => {
      if (!cardEl) return;

      const angle = getCardAngle(idx, targetActive, dragOffset);
      const absAngle = Math.abs(angle);

      // ONLY SHOW ACTIVE CARD: Opacity fades smoothly to 0 as card rotates away from center
      let opacity = Math.max(0, 1 - (absAngle / ANGLE_STEP));
      let scale = 1 - (absAngle / ANGLE_STEP) * 0.15;
      let zIndex = Math.round(100 - absAngle);
      let pointerEvents = absAngle < 10 ? 'auto' : 'none';

      if (duration === 0) {
        gsap.set(cardEl, {
          rotationY: angle,
          transformOrigin: `50% 50% -${WHEEL_RADIUS}px`,
          opacity: opacity,
          scale: scale,
          zIndex: zIndex,
          pointerEvents: pointerEvents
        });
      } else {
        gsap.to(cardEl, {
          rotationY: angle,
          transformOrigin: `50% 50% -${WHEEL_RADIUS}px`,
          opacity: opacity,
          scale: scale,
          zIndex: zIndex,
          pointerEvents: pointerEvents,
          duration: duration,
          ease: 'power3.out',
          overwrite: 'auto'
        });
      }
    });
  };

  useEffect(() => {
    updateWheelPositions(activeIndex, 0);
  }, []);

  const goToSlide = (newIndex) => {
    const normalized = (newIndex + total) % total;
    setActiveIndex(normalized);
    updateWheelPositions(normalized, 0.55);
  };

  const nextSlide = () => goToSlide(activeIndex + 1);
  const prevSlide = () => goToSlide(activeIndex - 1);

  // Drag Gesture along 3D Circular Orbit
  const handlePointerDown = (e) => {
    isDragging.current = true;
    startX.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    dragOffsetAngle.current = 0;
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const deltaX = x - startX.current;
    dragOffsetAngle.current = deltaX * 0.18;
    updateWheelPositions(activeIndex, 0, dragOffsetAngle.current);
  };

  const handlePointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const offset = dragOffsetAngle.current;

    if (offset < -12) {
      nextSlide();
    } else if (offset > 12) {
      prevSlide();
    } else {
      updateWheelPositions(activeIndex, 0.45);
    }
  };

  const toggleLike = (e, cardId, idx) => {
    e.stopPropagation();
    setLikedMap((prev) => ({ ...prev, [cardId]: !prev[cardId] }));

    if (heartRefs.current[idx]) {
      gsap.fromTo(
        heartRefs.current[idx],
        { scale: 0.7 },
        { scale: 1, duration: 0.35, ease: 'back.out(2.5)' }
      );
    }
  };

  const handleBuy = (e, cardId, idx) => {
    e.stopPropagation();
    setBoughtMap((prev) => ({ ...prev, [cardId]: true }));

    if (buyRefs.current[idx]) {
      gsap.fromTo(
        buyRefs.current[idx],
        { scale: 0.85 },
        { scale: 1, duration: 0.35, ease: 'back.out(2)' }
      );
    }
  };

  return (
    <div style={styles.container}>
      <div
        ref={stageRef}
        style={styles.stage}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      >
        {/* Sleek Minimal Floating Arrows */}
        <button
          style={{ ...styles.navBtn, ...styles.navBtnLeft }}
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
          title="Previous Product"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <button
          style={{ ...styles.navBtn, ...styles.navBtnRight }}
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
          title="Next Product"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>

        {/* 3D Circular Orbit Wheel Cards Container */}
        <div style={styles.wheelContainer}>
          {CARDS_DATA.map((card, idx) => {
            const isLiked = !!likedMap[card.id];
            const isBought = !!boughtMap[card.id];

            return (
              <div
                key={card.id}
                ref={(el) => (cardRefs.current[idx] = el)}
                style={styles.card}
              >
                {/* Top Photo Box */}
                <div style={styles.topPhotoBox}>
                  <img
                    src={card.image}
                    alt={card.title}
                    style={styles.productImage}
                    draggable="false"
                  />

                  {/* Frosted Glass Heart Badge */}
                  <button
                    ref={(el) => (heartRefs.current[idx] = el)}
                    style={styles.frostedHeartBtn}
                    onClick={(e) => toggleLike(e, card.id, idx)}
                    title={isLiked ? 'Unlike' : 'Like'}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill={isLiked ? '#ef4444' : 'none'}
                      stroke={isLiked ? '#ef4444' : '#ffffff'}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                </div>

                {/* Bottom Content Area */}
                <div style={styles.bottomContentArea}>
                  <h2 style={styles.productTitle}>{card.title}</h2>
                  <p style={styles.productDesc}>{card.description}</p>

                  <div style={styles.actionRow}>
                    <span style={styles.priceText}>{card.price}</span>
                    <button
                      ref={(el) => (buyRefs.current[idx] = el)}
                      style={{
                        ...styles.darkBuyBtn,
                        ...(isBought ? styles.darkBuyBtnBought : {})
                      }}
                      onClick={(e) => handleBuy(e, card.id, idx)}
                    >
                      {isBought ? 'Added ✓' : 'Buy'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'auto',
    width: '100%',
    background: 'transparent',
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    userSelect: 'none',
    overflow: 'hidden',
    padding: '10px 0'
  },
  stage: {
    position: 'relative',
    width: '100%',
    maxWidth: '800px',
    height: '520px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    perspective: '1400px',
    cursor: 'grab',
    touchAction: 'none',
    transform: 'scale(0.85)'
  },
  wheelContainer: {
    position: 'relative',
    width: '330px',
    height: '490px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transformStyle: 'preserve-3d'
  },
  card: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '330px',
    background: '#ffffff',
    borderRadius: '44px',
    padding: '12px',
    boxShadow: '0 28px 60px -12px rgba(0, 0, 0, 0.14), 0 10px 28px rgba(0, 0, 0, 0.04)',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    willChange: 'transform, opacity'
  },
  topPhotoBox: {
    position: 'relative',
    width: '100%',
    height: '280px',
    borderRadius: '34px',
    overflow: 'hidden',
    background: '#f8fafc'
  },
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    userSelect: 'none',
    pointerEvents: 'none'
  },
  frostedHeartBtn: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.4)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    outline: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.2s ease',
    zIndex: 10
  },
  bottomContentArea: {
    padding: '18px 14px 10px 14px',
    display: 'flex',
    flexDirection: 'column'
  },
  productTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#18181b',
    margin: 0,
    lineHeight: '1.25',
    letterSpacing: '-0.2px'
  },
  productDesc: {
    fontSize: '13px',
    fontWeight: '400',
    color: '#64748b',
    margin: '8px 0 0 0',
    lineHeight: '1.45',
    maxWidth: '98%'
  },
  actionRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '18px'
  },
  priceText: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#18181b',
    letterSpacing: '0.2px'
  },
  darkBuyBtn: {
    background: '#232127',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '700',
    padding: '11px 32px',
    borderRadius: '999px',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(35, 33, 39, 0.2)',
    transition: 'all 0.2s ease'
  },
  darkBuyBtnBought: {
    background: '#22c55e',
    color: '#ffffff'
  },
  navBtn: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: '#ffffff',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 200,
    outline: 'none',
    transition: 'all 0.2s ease'
  },
  navBtnLeft: {
    left: '24px'
  },
  navBtnRight: {
    right: '24px'
  }
};
