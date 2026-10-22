import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(CustomEase);
  try {
    CustomEase.create('markerBounceSmooth', 'M0,0 C0.16,1.38 0.3,1 1,1');
  } catch (e) {}
}

const LeftChevronIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const CATEGORIES = ['iOS', 'macOS', 'tvOS'];

export default function NewProjectMorph() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const collapsedPillRef = useRef(null);
  const expandedRowRef = useRef(null);
  const backBtnRef = useRef(null);
  const categoryRefs = useRef({});

  // Center-outward two-sided spring bounce expansion
  const handleExpand = () => {
    if (isExpanded) return;

    // 1. Shrink collapsed "New Project" pill at center
    gsap.to(collapsedPillRef.current, {
      scale: 0.65,
      opacity: 0,
      duration: 0.18,
      ease: 'power2.in',
      onComplete: () => {
        setIsExpanded(true);

        // 2. Spring out sub-pills symmetrically to TWO SIDES from the center!
        setTimeout(() => {
          if (expandedRowRef.current && backBtnRef.current) {
            // Far-left pill (< back button): springs far-left from center
            gsap.fromTo(
              backBtnRef.current,
              { opacity: 0, scale: 0.4, x: 110 },
              { opacity: 1, scale: 1, x: 0, duration: 0.48, ease: 'markerBounceSmooth' }
            );

            // Mid-left pill (iOS): springs left from center
            if (categoryRefs.current['iOS']) {
              gsap.fromTo(
                categoryRefs.current['iOS'],
                { opacity: 0, scale: 0.4, x: 45 },
                { opacity: 1, scale: 1, x: 0, duration: 0.48, ease: 'markerBounceSmooth' }
              );
            }

            // Mid-right pill (macOS): springs right from center
            if (categoryRefs.current['macOS']) {
              gsap.fromTo(
                categoryRefs.current['macOS'],
                { opacity: 0, scale: 0.4, x: -45 },
                { opacity: 1, scale: 1, x: 0, duration: 0.48, ease: 'markerBounceSmooth' }
              );
            }

            // Far-right pill (tvOS): springs far-right from center
            if (categoryRefs.current['tvOS']) {
              gsap.fromTo(
                categoryRefs.current['tvOS'],
                { opacity: 0, scale: 0.4, x: -110 },
                { opacity: 1, scale: 1, x: 0, duration: 0.48, ease: 'markerBounceSmooth' }
              );
            }
          }
        }, 10);
      }
    });
  };

  // Collapse back symmetrically to center
  const handleCollapse = (e) => {
    if (e) e.stopPropagation();
    if (!isExpanded) return;

    // 1. Animate all pills converging inward towards center
    if (backBtnRef.current) {
      gsap.to(backBtnRef.current, {
        opacity: 0,
        scale: 0.5,
        x: 80,
        duration: 0.22,
        ease: 'power2.in'
      });
    }

    if (categoryRefs.current['iOS']) {
      gsap.to(categoryRefs.current['iOS'], {
        opacity: 0,
        scale: 0.5,
        x: 30,
        duration: 0.22,
        ease: 'power2.in'
      });
    }

    if (categoryRefs.current['macOS']) {
      gsap.to(categoryRefs.current['macOS'], {
        opacity: 0,
        scale: 0.5,
        x: -30,
        duration: 0.22,
        ease: 'power2.in'
      });
    }

    if (categoryRefs.current['tvOS']) {
      gsap.to(categoryRefs.current['tvOS'], {
        opacity: 0,
        scale: 0.5,
        x: -80,
        duration: 0.22,
        ease: 'power2.in',
        onComplete: () => {
          setIsExpanded(false);

          // 2. Spring back single "New Project" pill at center
          setTimeout(() => {
            if (collapsedPillRef.current) {
              gsap.fromTo(
                collapsedPillRef.current,
                { opacity: 0, scale: 0.7 },
                { opacity: 1, scale: 1, duration: 0.48, ease: 'markerBounceSmooth' }
              );
            }
          }, 10);
        }
      });
    }
  };

  const handleSelectCategory = (e, category) => {
    e.stopPropagation();
    setSelectedCategory(category);
    const el = categoryRefs.current[category];
    if (el) {
      gsap.fromTo(
        el,
        { scale: 0.9 },
        { scale: 1, duration: 0.32, ease: 'back.out(2)' }
      );
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.stage}>
        {!isExpanded ? (
          /* Single Collapsed Pill Button centered */
          <button
            ref={collapsedPillRef}
            style={styles.collapsedBtn}
            onClick={handleExpand}
          >
            New Project
          </button>
        ) : (
          /* Expanded State: Row of 4 Pills Bouncing Outward from Center */
          <div ref={expandedRowRef} style={styles.expandedRow}>
            {/* Far Left: Back Button Pill < */}
            <button
              ref={backBtnRef}
              style={styles.backBtnPill}
              onClick={handleCollapse}
              title="Back"
            >
              <LeftChevronIcon />
            </button>

            {/* Sub Category Pills */}
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <button
                  key={category}
                  ref={(el) => (categoryRefs.current[category] = el)}
                  onClick={(e) => handleSelectCategory(e, category)}
                  style={{
                    ...styles.categoryPill,
                    background: isSelected ? '#ffffff' : '#f2f3f5',
                    color: isSelected ? '#111827' : '#374151',
                    fontWeight: isSelected ? '700' : '600',
                    border: isSelected ? '2px solid #111827' : '2px solid transparent',
                    boxShadow: isSelected ? '0 4px 14px rgba(0, 0, 0, 0.08)' : 'none'
                  }}
                >
                  {category}
                </button>
              );
            })}
          </div>
        )}
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
    minHeight: 'auto',
    background: 'transparent',
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    userSelect: 'none'
  },
  stage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60px'
  },
  collapsedBtn: {
    height: '54px',
    padding: '0 36px',
    background: '#ffffff',
    borderRadius: '999px',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: '600',
    color: '#18181b',
    letterSpacing: '-0.015em',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.05)',
    transition: 'background-color 0.18s ease'
  },
  expandedRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  backBtnPill: {
    width: '54px',
    height: '54px',
    borderRadius: '999px',
    background: '#ffffff',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.05)',
    transition: 'background-color 0.18s ease'
  },
  categoryPill: {
    height: '54px',
    padding: '0 32px',
    borderRadius: '999px',
    outline: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    letterSpacing: '-0.015em',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.18s ease'
  }
};
