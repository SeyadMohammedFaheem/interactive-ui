import React, { useState, useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(CustomEase);
  try {
    // Silky smooth ease-in-out curve inspired by Apple iOS pagination
    CustomEase.create('smoothEaseInOut', 'M0,0 C0.4,0 0.2,1 1,1');
  } catch (e) {}
}

const TOTAL_PAGES = 5;

export default function StepperMorph() {
  const [currentPage, setCurrentPage] = useState(2); // Page 2 active like reference video
  const pillRef = useRef(null);
  const pageRefs = useRef({});
  const prevBtnRef = useRef(null);
  const nextBtnRef = useRef(null);
  const prevPageRef = useRef(2);

  // Silky smooth continuous ease-in-out FLIP animation
  useLayoutEffect(() => {
    const activeEl = pageRefs.current[currentPage];
    const pillEl = pillRef.current;
    if (!activeEl || !pillEl) return;

    const targetLeft = activeEl.offsetLeft;
    const targetTop = activeEl.offsetTop;

    if (prevPageRef.current !== currentPage) {
      gsap.to(pillEl, {
        left: targetLeft,
        top: targetTop,
        duration: 0.45,
        ease: 'smoothEaseInOut',
        overwrite: 'auto'
      });

      prevPageRef.current = currentPage;
    } else {
      gsap.set(pillEl, {
        left: targetLeft,
        top: targetTop
      });
    }
  }, [currentPage]);

  const handlePageChange = (page) => {
    if (page < 1 || page > TOTAL_PAGES || page === currentPage) return;

    const targetEl = pageRefs.current[page];
    if (targetEl) {
      gsap.fromTo(
        targetEl,
        { scale: 0.94 },
        { scale: 1, duration: 0.35, ease: 'power2.out' }
      );
    }

    setCurrentPage(page);
  };

  const prevPage = () => {
    if (currentPage > 1) {
      if (prevBtnRef.current) {
        gsap.fromTo(prevBtnRef.current, { scale: 0.94 }, { scale: 1, duration: 0.25, ease: 'power2.out' });
      }
      handlePageChange(currentPage - 1);
    }
  };

  const nextPage = () => {
    if (currentPage < TOTAL_PAGES) {
      if (nextBtnRef.current) {
        gsap.fromTo(nextBtnRef.current, { scale: 0.94 }, { scale: 1, duration: 0.25, ease: 'power2.out' });
      }
      handlePageChange(currentPage + 1);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.paginationWrapper}>
        {/* Previous Arrow Button */}
        <button
          ref={prevBtnRef}
          style={{
            ...styles.arrowBtn,
            opacity: currentPage === 1 ? 0.35 : 1,
            cursor: currentPage === 1 ? 'default' : 'pointer'
          }}
          onClick={prevPage}
          disabled={currentPage === 1}
          title="Previous Page"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        {/* Number Track with Animated Dark Glossy Squircle */}
        <div style={styles.track}>
          {/* Continuous Dark Glossy Active Squircle Indicator (zIndex: 15) */}
          <div ref={pillRef} style={styles.darkGlossyPill} />

          {/* Number Squircle Buttons */}
          {Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1).map((page) => {
            const isActive = page === currentPage;

            return (
              <button
                key={page}
                ref={(el) => (pageRefs.current[page] = el)}
                style={{
                  ...styles.numBtn,
                  background: isActive ? 'transparent' : '#ffffff',
                  border: isActive ? '1px solid transparent' : '1px solid rgba(0, 0, 0, 0.08)',
                  boxShadow: isActive ? 'none' : '0 4px 14px rgba(0, 0, 0, 0.04)',
                  color: isActive ? '#ffffff' : '#475569',
                  fontWeight: isActive ? '800' : '600',
                  zIndex: isActive ? 20 : 10
                }}
                onClick={() => handlePageChange(page)}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    gsap.to(e.currentTarget, { y: -3, duration: 0.2, ease: 'power2.out' });
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    gsap.to(e.currentTarget, { y: 0, duration: 0.2, ease: 'power2.out' });
                  }
                }}
              >
                <span style={styles.numLabel}>{page}</span>
              </button>
            );
          })}
        </div>

        {/* Next Arrow Button */}
        <button
          ref={nextBtnRef}
          style={{
            ...styles.arrowBtn,
            opacity: currentPage === TOTAL_PAGES ? 0.35 : 1,
            cursor: currentPage === TOTAL_PAGES ? 'default' : 'pointer'
          }}
          onClick={nextPage}
          disabled={currentPage === TOTAL_PAGES}
          title="Next Page"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 'auto',
    background: 'transparent',
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    userSelect: 'none',
    padding: '16px 0'
  },
  paginationWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    maxWidth: '100%'
  },
  arrowBtn: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    background: '#ffffff',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    outline: 'none',
    padding: 0,
    margin: 0,
    boxSizing: 'border-box',
    transition: 'all 0.2s cubic-bezier(0.16, 1.38, 0.3, 1)'
  },
  track: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    height: '48px'
  },
  numBtn: {
    position: 'relative',
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    cursor: 'pointer',
    outline: 'none',
    padding: 0,
    margin: 0,
    boxSizing: 'border-box',
    transition: 'color 0.25s ease, background-color 0.2s ease, border-color 0.2s ease, transform 0.2s cubic-bezier(0.16, 1.38, 0.3, 1)'
  },
  numLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
    height: '100%',
    width: '100%',
    textAlign: 'center',
    userSelect: 'none',
    pointerEvents: 'none'
  },
  darkGlossyPill: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    background: 'linear-gradient(180deg, #2d2d38 0%, #15151c 100%)',
    boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.25), 0 12px 28px -4px rgba(0, 0, 0, 0.45)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    boxSizing: 'border-box',
    zIndex: 15,
    pointerEvents: 'none',
    willChange: 'left, top, transform'
  }
};
