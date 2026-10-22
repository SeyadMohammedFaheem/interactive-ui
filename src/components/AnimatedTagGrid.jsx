import React, { useState, useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(CustomEase);
  try {
    CustomEase.create('tagSpring', 'M0,0 C0.16,1.35 0.28,1.08 1,1');
  } catch (e) {}
}

const ALL_TAGS = [
  'Node',
  'JavaScript',
  'Express',
  'React',
  'Vue',
  'Next',
  'TypeScript',
  'Svelte',
  'Gatsby',
  'Knockout',
  'Backbone',
  'Ember',
  'Chai',
  'Mocha',
  'Jest'
];

export default function AnimatedTagGrid() {
  const [selectedTags, setSelectedTags] = useState(['Node', 'React']);
  const tagRefs = useRef({});
  const prevRects = useRef(new Map());

  const recordPositions = () => {
    const map = new Map();
    ALL_TAGS.forEach((tag) => {
      const el = tagRefs.current[tag];
      if (el) {
        map.set(tag, el.getBoundingClientRect());
      }
    });
    prevRects.current = map;
  };

  useLayoutEffect(() => {
    const prevMap = prevRects.current;
    if (!prevMap || prevMap.size === 0) return;

    ALL_TAGS.forEach((tag) => {
      const el = tagRefs.current[tag];
      if (!el) return;

      const prev = prevMap.get(tag);
      const next = el.getBoundingClientRect();

      if (prev) {
        const deltaX = prev.left - next.left;
        const deltaY = prev.top - next.top;

        if (deltaX !== 0 || deltaY !== 0) {
          gsap.fromTo(
            el,
            {
              x: deltaX,
              y: deltaY,
              scale: 1.08,
              rotation: deltaX > 0 ? 2 : -2
            },
            {
              x: 0,
              y: 0,
              scale: 1,
              rotation: 0,
              duration: 0.48,
              ease: 'tagSpring',
              overwrite: 'auto'
            }
          );
        }
      } else {
        gsap.fromTo(
          el,
          { opacity: 0, scale: 0.7, y: 8 },
          { opacity: 1, scale: 1, y: 0, duration: 0.38, ease: 'back.out(1.8)', overwrite: 'auto' }
        );
      }
    });
  }, [selectedTags]);

  const addTag = (tag) => {
    if (selectedTags.includes(tag)) return;
    recordPositions();
    setSelectedTags((prev) => [...prev, tag]);
  };

  const removeTag = (e, tag) => {
    e.stopPropagation();
    recordPositions();
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  const clearAll = () => {
    recordPositions();
    setSelectedTags([]);
  };

  const availableTags = ALL_TAGS.filter((t) => !selectedTags.includes(t));

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header Row */}
        <div style={styles.headerRow}>
          <div style={styles.titleGroup}>
            <span style={styles.headerLabel}>TAGS</span>
            <span style={styles.countBadge}>{selectedTags.length} selected</span>
          </div>

          {selectedTags.length > 0 && (
            <button style={styles.clearBtn} onClick={clearAll} title="Clear all tags">
              Clear all
            </button>
          )}
        </div>

        {/* Selected Tags Top Input Box */}
        <div style={styles.selectedBox}>
          {selectedTags.length === 0 ? (
            <span style={styles.placeholder}>Click tags below to add...</span>
          ) : (
            selectedTags.map((tag) => (
              <div
                key={tag}
                ref={(el) => (tagRefs.current[tag] = el)}
                style={styles.selectedTagPill}
              >
                <span style={styles.tagText}>{tag}</span>
                <button
                  style={styles.closeBtn}
                  onClick={(e) => removeTag(e, tag)}
                  title={`Remove ${tag}`}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Available Tags Bottom Grid */}
        <div style={styles.availableBox}>
          {availableTags.map((tag) => (
            <div
              key={tag}
              ref={(el) => (tagRefs.current[tag] = el)}
              onClick={() => addTag(tag)}
              style={styles.availableTagPill}
            >
              {tag}
            </div>
          ))}
        </div>
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
    userSelect: 'none',
    padding: '12px'
  },
  card: {
    width: '100%',
    maxWidth: '460px',
    background: 'transparent',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column'
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px'
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  headerLabel: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#475569',
    letterSpacing: '0.9px'
  },
  countBadge: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b',
    background: '#f1f5f9',
    padding: '2px 9px',
    borderRadius: '999px'
  },
  clearBtn: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    fontSize: '13px',
    fontWeight: '600',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '2px 6px',
    borderRadius: '6px',
    transition: 'all 0.15s ease'
  },
  selectedBox: {
    background: '#fafafa',
    border: '1.5px solid #e2e8f0',
    borderRadius: '20px',
    padding: '12px 14px',
    minHeight: '64px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8.5px',
    alignItems: 'center',
    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.015)'
  },
  placeholder: {
    fontSize: '14.5px',
    color: '#94a3b8',
    fontWeight: '400',
    marginLeft: '4px'
  },
  selectedTagPill: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '7.5px 10px 7.5px 14px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#0f172a',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    willChange: 'transform'
  },
  tagText: {
    letterSpacing: '-0.01em'
  },
  closeBtn: {
    background: '#f1f5f9',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease'
  },
  availableBox: {
    background: '#f8fafc',
    borderRadius: '22px',
    padding: '20px',
    marginTop: '16px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px'
  },
  availableTagPill: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '9px 18px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#334155',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
    transition: 'all 0.2s cubic-bezier(0.16, 1.38, 0.3, 1)',
    willChange: 'transform'
  }
};
