import React, { useState } from 'react';
import { AGENTIC_SKILLS, SKILL_CATEGORIES } from '../data/agenticSkills.js';

export default function AgenticSkillsView({
  searchQuery,
  setSearchQuery
}) {
  const [activeCategory, setActiveCategory] = useState('All Skills');
  const [copiedSkillId, setCopiedSkillId] = useState('');
  const [copiedPack, setCopiedPack] = useState('');
  const [copiedCommand, setCopiedCommand] = useState('');
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [inspectorTab, setInspectorTab] = useState('npm'); // 'npm' | 'skillMd' | 'yaml' | 'overview'

  const handleCopyInstallCommand = (skillId, flag = '') => {
    const cmd = flag ? `npx repo-skills add ${skillId} ${flag}` : `npx repo-skills add ${skillId}`;
    navigator.clipboard.writeText(cmd);
    setCopiedCommand(`${skillId}${flag}`);
    setTimeout(() => setCopiedCommand(''), 2200);
  };

  const handleCopyPack = (packName) => {
    navigator.clipboard.writeText(`npx repo-skills add ${packName}`);
    setCopiedPack(packName);
    setTimeout(() => setCopiedPack(''), 2200);
  };

  const handleCopySkillMd = (e, skill) => {
    e.stopPropagation();
    navigator.clipboard.writeText(skill.skillMd);
    setCopiedSkillId(skill.id);
    setTimeout(() => setCopiedSkillId(''), 2200);
  };

  const handleOpenInspector = (skill) => {
    setSelectedSkill(skill);
    setInspectorTab('npm');
  };

  // Filter skills by search and active category
  const filteredSkills = AGENTIC_SKILLS.filter((skill) => {
    const matchesCat = activeCategory === 'All Skills' || skill.category === activeCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || (
      skill.title.toLowerCase().includes(q) ||
      skill.category.toLowerCase().includes(q) ||
      skill.summary.toLowerCase().includes(q) ||
      skill.tags.some(t => t.toLowerCase().includes(q))
    );
    return matchesCat && matchesSearch;
  });

  // Calculate count for each category
  const getCategoryCount = (category) => {
    if (category === 'All Skills') return AGENTIC_SKILLS.length;
    return AGENTIC_SKILLS.filter(s => s.category === category).length;
  };

  return (
    <div style={styles.container}>
      <style>{`
        .simple-skill-card {
          transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .simple-skill-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.05);
        }
        .simple-skill-btn {
          transition: transform 0.16s ease, background-color 0.18s ease;
        }
        .simple-skill-btn:hover {
          transform: scale(1.04);
        }
        .simple-skill-btn:active {
          transform: scale(0.96);
        }
        .pack-chip-btn {
          transition: all 0.16s ease;
        }
        .pack-chip-btn:hover {
          background-color: #f4f4f5 !important;
          color: #18181b !important;
        }
        .pack-chip-btn:active {
          transform: scale(0.96);
        }
        .sidebar-item-btn {
          transition: all 0.16s ease;
        }
        .sidebar-item-btn:hover {
          background-color: #f4f4f5;
        }
        @media (max-width: 900px) {
          .skills-layout-wrapper {
            flex-direction: column !important;
          }
          .skills-sidebar {
            width: 100% !important;
            position: static !important;
            border-right: none !important;
            border-bottom: 1px solid #f0f0f1;
            padding: 16px 20px !important;
          }
          .sidebar-list {
            flex-direction: row !important;
            overflow-x: auto;
            white-space: nowrap;
            gap: 6px !important;
          }
          .sidebar-item-btn {
            width: auto !important;
            flex-shrink: 0;
          }
        }
      `}</style>

      {/* Main 2-Column Layout */}
      <div className="skills-layout-wrapper" style={styles.layoutWrapper}>
        {/* Left Column: Category Sidebar */}
        <aside className="skills-sidebar" style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <span style={styles.sidebarTitle}>Categories</span>
            <span style={styles.sidebarBadge}>{AGENTIC_SKILLS.length} total</span>
          </div>

          <nav className="sidebar-list" style={styles.sidebarList}>
            {SKILL_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              const count = getCategoryCount(cat);
              return (
                <button
                  key={cat}
                  className="sidebar-item-btn"
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    ...styles.sidebarItem,
                    ...(isActive ? styles.sidebarItemActive : styles.sidebarItemInactive)
                  }}
                >
                  <div style={styles.sidebarItemLeft}>
                    <SidebarCategoryIcon category={cat} isActive={isActive} />
                    <span style={styles.sidebarItemLabel}>{cat}</span>
                  </div>
                  <span style={{
                    ...styles.sidebarItemCount,
                    ...(isActive ? styles.sidebarItemCountActive : {})
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right Column: Hero, Search & Skills Grid */}
        <section style={styles.mainArea}>
          {/* Hero Section */}
          <div style={styles.heroSection}>
            <div style={styles.heroBadge}>
              <span style={styles.badgePulse}></span>
              Agentic Skills & MCP
            </div>
            <h1 style={styles.heroTitle}>Autonomous Agent Skills</h1>
            <p style={styles.heroSubtitle}>
              Production-grade capabilities, execution schemas, and <strong style={{ color: '#18181b', fontWeight: 600 }}>SKILL.md</strong> instructions for autonomous agents. Copy directly into your agent runtime or <code style={styles.codeSnippet}>.agents/skills/</code>.
            </p>

            {/* Hero Search Bar */}
            <div style={styles.searchPillWrapper}>
              <div style={styles.searchPill}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="11" cy="11" r="7.5"></circle>
                  <line x1="21" y1="21" x2="16.5" y2="16.5"></line>
                </svg>
                <input
                  type="text"
                  className="search-pill-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search skills, triggers, tools..."
                  style={styles.searchInput}
                />
                {searchQuery ? (
                  <button
                    style={styles.searchClearBtn}
                    onClick={() => setSearchQuery('')}
                    title="Clear search"
                  >
                    ✕
                  </button>
                ) : (
                  <span style={styles.searchShortcutText}>Ctrl K</span>
                )}
              </div>
            </div>

            {/* Quick Install Curated Packs */}
            <div style={styles.quickPacksRow}>
              <div style={styles.quickPacksBar}>
                <div style={styles.quickPacksLabel}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.75 }}>
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
                  <span>Packs</span>
                </div>
                <div style={styles.quickPacksDivider}></div>
                <div style={styles.quickPacksList}>
                  {[
                    { key: 'design', label: 'design' },
                    { key: 'frontend', label: 'frontend' },
                    { key: 'marketing', label: 'marketing' },
                    { key: 'seo', label: 'seo' },
                    { key: 'accessibility', label: 'accessibility' }
                  ].map((p) => {
                    const isPackCopied = copiedPack === p.key;
                    return (
                      <button
                        key={p.key}
                        className="pack-chip-btn"
                        style={{
                          ...styles.packChipBtn,
                          ...(isPackCopied ? styles.packChipCopied : {})
                        }}
                        onClick={() => handleCopyPack(p.key)}
                        title={`Click to copy: npx repo-skills add ${p.key}`}
                      >
                        {isPackCopied ? (
                          <>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <span style={styles.packPromptSymbol}>$</span>
                            <span>add {p.label}</span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Category Bar Heading */}
          <div style={styles.sectionHeaderRow}>
            <div style={styles.sectionHeadingGroup}>
              <h2 style={styles.sectionHeading}>{activeCategory}</h2>
              <span style={styles.sectionCountTag}>
                {filteredSkills.length} {filteredSkills.length === 1 ? 'skill' : 'skills'}
              </span>
            </div>
            {searchQuery && (
              <button
                style={styles.clearSearchLink}
                onClick={() => setSearchQuery('')}
              >
                Clear "{searchQuery}"
              </button>
            )}
          </div>

          {/* Cards Grid */}
          {filteredSkills.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={{ fontSize: '16px', fontWeight: 600, color: '#18181b', margin: '0 0 8px 0' }}>
                No skills found in {activeCategory}
              </p>
              <p style={{ fontSize: '13.5px', color: '#71717a', margin: '0 0 16px 0' }}>
                Try searching with different keywords or switch to "All Skills".
              </p>
              <button
                style={styles.emptyClearBtn}
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('All Skills');
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div style={styles.cardsGrid}>
              {filteredSkills.map((skill) => {
                const isCopied = copiedSkillId === skill.id;
                return (
                  <div
                    key={skill.id}
                    className="simple-skill-card"
                    style={styles.skillCard}
                    onClick={() => handleOpenInspector(skill)}
                  >
                    {/* Top: Icon & Category Pill */}
                    <div style={styles.cardTopRow}>
                      <div style={styles.cardIconBox}>
                        <SkillIcon category={skill.category} />
                      </div>
                      <span style={styles.categoryPill}>{skill.category}</span>
                    </div>

                    {/* Middle: Title & Clean 2-Line Summary */}
                    <div style={styles.cardBody}>
                      <h3 style={styles.cardTitle}>{skill.title}</h3>
                      <p style={styles.cardSummary}>{skill.summary}</p>
                    </div>

                    {/* NPM Install Bar on Card */}
                    <div
                      className="simple-skill-btn"
                      style={{
                        ...styles.cardNpmBar,
                        borderColor: copiedCommand === skill.id ? '#10b981' : 'transparent',
                        background: copiedCommand === skill.id ? '#ecfdf5' : '#ffffff'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyInstallCommand(skill.id);
                      }}
                      title={`Click to copy: npx repo-skills add ${skill.id}`}
                    >
                      <div style={styles.cardNpmLeft}>
                        <span style={styles.cardNpmPrompt}>$</span>
                        <code style={styles.cardNpmCode}>npx repo-skills add {skill.id}</code>
                      </div>
                      <span style={{
                        ...styles.cardNpmBadge,
                        background: copiedCommand === skill.id ? '#10b981' : '#f4f4f5',
                        color: copiedCommand === skill.id ? '#ffffff' : '#52525b'
                      }}>
                        {copiedCommand === skill.id ? '✓ Copied' : 'npm'}
                      </span>
                    </div>

                    {/* Bottom: Floating Action Bar */}
                    <div style={styles.cardBottomBar}>
                      <button
                        className="simple-skill-btn"
                        style={{
                          ...styles.copyPillBtn,
                          background: isCopied ? '#10b981' : '#ffffff',
                          color: isCopied ? '#ffffff' : '#18181b'
                        }}
                        onClick={(e) => handleCopySkillMd(e, skill)}
                        title="Copy SKILL.md prompt"
                      >
                        {isCopied ? (
                          <>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            <span>Copy SKILL.md</span>
                          </>
                        )}
                      </button>

                      <button
                        className="simple-skill-btn"
                        style={styles.circleInspectorBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenInspector(skill);
                        }}
                        title="View spec & schema"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#18181b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="4" y1="21" x2="4" y2="14"></line>
                          <line x1="4" y1="10" x2="4" y2="3"></line>
                          <line x1="12" y1="21" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12" y2="3"></line>
                          <line x1="20" y1="21" x2="20" y2="16"></line>
                          <line x1="20" y1="12" x2="20" y2="3"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Inspector Modal for Detailed Spec & Schema */}
      {selectedSkill && (
        <div style={styles.modalOverlay} onClick={() => setSelectedSkill(null)}>
          <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={styles.modalHeader}>
              <div style={styles.modalHeaderLeft}>
                <div style={styles.modalIconBox}>
                  <SkillIcon category={selectedSkill.category} />
                </div>
                <div>
                  <h3 style={styles.modalTitle}>{selectedSkill.title}</h3>
                  <div style={styles.modalSubtitle}>
                    <span>{selectedSkill.category}</span>
                    <span style={{ margin: '0 6px', color: '#d4d4d8' }}>•</span>
                    <span>v{selectedSkill.version}</span>
                    <span style={{ margin: '0 6px', color: '#d4d4d8' }}>•</span>
                    <span style={{ color: '#059669', fontWeight: 600 }}>Ready to deploy</span>
                  </div>
                </div>
              </div>

              <button
                style={styles.closeBtn}
                onClick={() => setSelectedSkill(null)}
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Permanent Top NPM Bar */}
            <div style={styles.modalInstallBar}>
              <div style={styles.modalInstallCodeGroup}>
                <span style={styles.modalTerminalPrompt}>$</span>
                <code style={styles.modalInstallCode}>npx repo-skills add {selectedSkill.id}</code>
              </div>
              <button
                className="simple-skill-btn"
                style={{
                  ...styles.modalInstallCopyBtn,
                  background: copiedCommand === selectedSkill.id ? '#10b981' : '#18181b',
                  color: '#ffffff'
                }}
                onClick={() => handleCopyInstallCommand(selectedSkill.id)}
              >
                {copiedCommand === selectedSkill.id ? '✓ Copied' : 'Copy npm'}
              </button>
            </div>

            {/* Modal Tab Switcher */}
            <div style={styles.modalTabsBar}>
              <button
                style={{
                  ...styles.modalTab,
                  ...(inspectorTab === 'npm' ? styles.modalTabActive : {})
                }}
                onClick={() => setInspectorTab('npm')}
              >
                Install (npm)
              </button>
              <button
                style={{
                  ...styles.modalTab,
                  ...(inspectorTab === 'skillMd' ? styles.modalTabActive : {})
                }}
                onClick={() => setInspectorTab('skillMd')}
              >
                SKILL.md (Prompt)
              </button>
              <button
                style={{
                  ...styles.modalTab,
                  ...(inspectorTab === 'yaml' ? styles.modalTabActive : {})
                }}
                onClick={() => setInspectorTab('yaml')}
              >
                YAML Schema
              </button>
              <button
                style={{
                  ...styles.modalTab,
                  ...(inspectorTab === 'overview' ? styles.modalTabActive : {})
                }}
                onClick={() => setInspectorTab('overview')}
              >
                Overview & Triggers
              </button>
            </div>

            {/* Modal Content */}
            <div style={styles.modalBody}>
              {inspectorTab === 'npm' && (
                <div style={styles.installTabContainer}>
                  <div style={styles.installRowBlock}>
                    <div style={styles.installRowHeader}>
                      <span style={styles.installRowTitle}>Workspace Install (Current Project)</span>
                      <span style={styles.installRowTag}>.agents/skills/{selectedSkill.id}/</span>
                    </div>
                    <div style={styles.installCodeBox}>
                      <code>npx repo-skills add {selectedSkill.id}</code>
                      <button
                        style={styles.installCopyPill}
                        onClick={() => handleCopyInstallCommand(selectedSkill.id)}
                      >
                        {copiedCommand === selectedSkill.id ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div style={styles.installRowBlock}>
                    <div style={styles.installRowHeader}>
                      <span style={styles.installRowTitle}>Global Machine Install (All Projects)</span>
                      <span style={styles.installRowTag}>~/.gemini/config/skills/</span>
                    </div>
                    <div style={styles.installCodeBox}>
                      <code>npx repo-skills add {selectedSkill.id} -g</code>
                      <button
                        style={styles.installCopyPill}
                        onClick={() => handleCopyInstallCommand(selectedSkill.id, ' -g')}
                      >
                        {copiedCommand === `${selectedSkill.id} -g` ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div style={styles.installNoteBox}>
                    <span style={{ fontSize: '15px' }}>💡</span>
                    <span style={styles.installNoteText}>
                      Zero configuration needed. As soon as installed, your AI agent automatically recognizes the frontmatter triggers and activates this skill on demand.
                    </span>
                  </div>
                </div>
              )}

              {inspectorTab === 'skillMd' && (
                <div style={styles.codeContainer}>
                  <div style={styles.codeHeader}>
                    <span style={styles.codeLabel}>SKILL.md Markdown Content</span>
                    <button
                      style={styles.copySpecBtn}
                      onClick={(e) => handleCopySkillMd(e, selectedSkill)}
                    >
                      {copiedSkillId === selectedSkill.id ? 'Copied!' : 'Copy SKILL.md'}
                    </button>
                  </div>
                  <pre style={styles.codePre}>{selectedSkill.skillMd}</pre>
                </div>
              )}

              {inspectorTab === 'yaml' && (
                <div style={styles.codeContainer}>
                  <div style={styles.codeHeader}>
                    <span style={styles.codeLabel}>Agent Tool Definition (YAML)</span>
                    <button
                      style={styles.copySpecBtn}
                      onClick={() => {
                        navigator.clipboard.writeText(selectedSkill.yamlSchema);
                        setCopiedSkillId(selectedSkill.id);
                        setTimeout(() => setCopiedSkillId(''), 2000);
                      }}
                    >
                      {copiedSkillId === selectedSkill.id ? 'Copied!' : 'Copy YAML'}
                    </button>
                  </div>
                  <pre style={styles.codePre}>{selectedSkill.yamlSchema}</pre>
                </div>
              )}

              {inspectorTab === 'overview' && (
                <div style={styles.overviewContainer}>
                  <div>
                    <h4 style={styles.overviewHeading}>Description</h4>
                    <p style={styles.overviewText}>{selectedSkill.summary}</p>
                  </div>

                  <div>
                    <h4 style={styles.overviewHeading}>Autonomous Triggers</h4>
                    <ul style={styles.triggersList}>
                      {selectedSkill.triggers.map((t, idx) => (
                        <li key={idx} style={styles.triggerItem}>
                          <span style={styles.triggerDot}></span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                    <div>
                      <h4 style={styles.overviewHeading}>CLI Install Command</h4>
                      <div style={styles.installBox}>
                        <code>npx repo-skills add {selectedSkill.id}</code>
                        <button
                          style={styles.installCopyBtn}
                          onClick={() => {
                            navigator.clipboard.writeText(`npx repo-skills add ${selectedSkill.id}`);
                            setCopiedSkillId(selectedSkill.id);
                            setTimeout(() => setCopiedSkillId(''), 2000);
                          }}
                        >
                          {copiedSkillId === selectedSkill.id ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sidebar Icon Helper
function SidebarCategoryIcon({ category, isActive }) {
  const color = isActive ? '#ffffff' : '#52525b';
  switch (category) {
    case 'All Skills':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      );
    case 'UI Design':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="4"></circle>
          <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line>
          <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line>
          <line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line>
          <line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line>
        </svg>
      );
    case 'Design Engineering':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
          <polyline points="2 17 12 22 22 17"></polyline>
          <polyline points="2 12 12 17 22 12"></polyline>
        </svg>
      );
    case 'Marketing & Copy':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      );
    case 'SEO & Media':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="11" y1="8" x2="11" y2="14"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
      );
    case 'UX & Accessibility':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="7" r="1.5"></circle>
          <path d="M9 11h6"></path>
          <path d="M12 11v6"></path>
          <path d="M10 17l2 3 2-3"></path>
        </svg>
      );
    default:
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      );
  }
}

// Category Card Icon Helper
function SkillIcon({ category }) {
  switch (category) {
    case 'UI Design':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#18181b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
          <path d="M2 12h20"></path>
        </svg>
      );
    case 'Design Engineering':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#18181b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
          <polyline points="2 17 12 22 22 17"></polyline>
          <polyline points="2 12 12 17 22 12"></polyline>
        </svg>
      );
    case 'Marketing & Copy':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#18181b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      );
    case 'SEO & Media':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#18181b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="11" y1="8" x2="11" y2="14"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
      );
    case 'UX & Accessibility':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#18181b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="7" r="1.5"></circle>
          <path d="M9 11h6"></path>
          <path d="M12 11v6"></path>
          <path d="M10 17l2 3 2-3"></path>
        </svg>
      );
    default:
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#18181b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      );
  }
}

const styles = {
  container: {
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column'
  },
  layoutWrapper: {
    display: 'flex',
    alignItems: 'flex-start',
    width: '100%',
    boxSizing: 'border-box'
  },
  sidebar: {
    width: '260px',
    flexShrink: 0,
    position: 'sticky',
    top: '52px',
    height: 'calc(100vh - 52px)',
    padding: '32px 18px 24px 24px',
    boxSizing: 'border-box',
    borderRight: '1px solid #f0f0f1',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto'
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
    padding: '0 6px'
  },
  sidebarTitle: {
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#a1a1aa'
  },
  sidebarBadge: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#71717a',
    background: '#f4f4f5',
    padding: '2px 8px',
    borderRadius: '999px'
  },
  sidebarList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    width: '100%'
  },
  sidebarItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13.5px',
    fontWeight: '500',
    textAlign: 'left',
    boxSizing: 'border-box'
  },
  sidebarItemActive: {
    background: '#18181b',
    color: '#ffffff',
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)'
  },
  sidebarItemInactive: {
    background: 'transparent',
    color: '#3f3f46'
  },
  sidebarItemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  sidebarItemLabel: {
    lineHeight: 1
  },
  sidebarItemCount: {
    fontSize: '11.5px',
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: '999px',
    background: '#f4f4f5',
    color: '#71717a'
  },
  sidebarItemCountActive: {
    background: 'rgba(255, 255, 255, 0.2)',
    color: '#ffffff'
  },
  mainArea: {
    flex: 1,
    minWidth: 0,
    padding: '0 28px 80px 28px',
    boxSizing: 'border-box'
  },
  heroSection: {
    width: '100%',
    padding: '40px 0 28px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    boxSizing: 'border-box'
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 18px',
    borderRadius: '999px',
    background: '#ffffff',
    border: '1px solid #e4e4e7',
    fontSize: '13px',
    fontWeight: '600',
    color: '#18181b',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
    marginBottom: '18px'
  },
  badgePulse: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#10b981',
    display: 'inline-block'
  },
  heroTitle: {
    fontSize: 'clamp(30px, 4vw, 44px)',
    fontWeight: '700',
    letterSpacing: '-0.03em',
    color: '#09090b',
    margin: '0 0 14px 0',
    lineHeight: 1.15
  },
  heroSubtitle: {
    fontSize: '15.5px',
    fontWeight: '400',
    lineHeight: 1.6,
    color: '#71717a',
    maxWidth: '620px',
    margin: '0 0 24px 0',
    letterSpacing: '-0.01em'
  },
  codeSnippet: {
    background: '#f4f4f5',
    padding: '2px 6px',
    borderRadius: '6px',
    fontFamily: "'Fira Code', monospace",
    fontSize: '13.5px',
    color: '#18181b'
  },
  searchPillWrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '11px',
    background: '#F1F1F2',
    border: 'none',
    borderRadius: '999px',
    padding: '0 18px',
    height: '44px',
    width: '320px',
    maxWidth: '90vw',
    boxSizing: 'border-box',
    cursor: 'text',
    transition: 'all 0.18s ease'
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: '14.5px',
    color: '#18181b',
    width: '100%',
    fontFamily: 'inherit',
    fontWeight: '500',
    padding: 0
  },
  searchClearBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    fontSize: '12px',
    color: '#71717a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1
  },
  searchShortcutText: {
    fontSize: '13px',
    fontWeight: '400',
    color: '#9ca3af',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    fontFamily: 'inherit',
    letterSpacing: '0.01em'
  },
  quickPacksRow: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    marginTop: '20px'
  },
  quickPacksBar: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: '#ffffff',
    border: '1px solid #e4e4e7',
    borderRadius: '999px',
    padding: '3px 4px 3px 12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
    maxWidth: '100%',
    overflowX: 'auto'
  },
  quickPacksLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12.5px',
    fontWeight: '700',
    color: '#52525b',
    letterSpacing: '-0.01em',
    whiteSpace: 'nowrap'
  },
  quickPacksDivider: {
    width: '1px',
    height: '14px',
    background: '#e4e4e7',
    flexShrink: 0
  },
  quickPacksList: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px'
  },
  packChipBtn: {
    border: 'none',
    background: 'transparent',
    padding: '5px 11px',
    borderRadius: '999px',
    fontSize: '12.5px',
    fontWeight: '700',
    color: '#27272a',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap'
  },
  packChipCopied: {
    background: '#10b981 !important',
    color: '#ffffff !important',
    fontWeight: '600'
  },
  packPromptSymbol: {
    color: '#71717a',
    fontWeight: '700',
    fontSize: '11.5px'
  },
  sectionHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 0 20px 0',
    borderBottom: '1px solid #f0f0f1',
    marginBottom: '24px'
  },
  sectionHeadingGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  sectionHeading: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#09090b',
    letterSpacing: '-0.02em',
    margin: 0
  },
  sectionCountTag: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#71717a',
    background: '#f4f4f5',
    padding: '3px 10px',
    borderRadius: '999px'
  },
  clearSearchLink: {
    background: 'transparent',
    border: 'none',
    fontSize: '12.5px',
    fontWeight: '600',
    color: '#6366f1',
    cursor: 'pointer'
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
    width: '100%'
  },
  skillCard: {
    background: '#F1F1F2',
    borderRadius: '28px',
    padding: '28px 28px',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    cursor: 'pointer',
    position: 'relative',
    minHeight: '250px',
    border: 'none'
  },
  cardTopRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px'
  },
  cardIconBox: {
    width: '46px',
    height: '46px',
    borderRadius: '14px',
    background: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
    flexShrink: 0
  },
  categoryPill: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#71717a',
    background: '#ffffff',
    padding: '5px 12px',
    borderRadius: '999px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
    letterSpacing: '-0.01em'
  },
  cardBody: {
    flex: 1,
    marginBottom: '22px'
  },
  cardTitle: {
    fontSize: '17.5px',
    fontWeight: '700',
    color: '#09090b',
    letterSpacing: '-0.02em',
    lineHeight: 1.25,
    margin: '0 0 10px 0'
  },
  cardSummary: {
    fontSize: '13.5px',
    lineHeight: 1.55,
    color: '#71717a',
    margin: 0,
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  cardNpmBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '7px 12px',
    borderRadius: '12px',
    background: '#ffffff',
    border: '1px solid #e4e4e7',
    marginBottom: '14px',
    cursor: 'pointer',
    transition: 'all 0.18s ease'
  },
  cardNpmLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    overflow: 'hidden'
  },
  cardNpmPrompt: {
    fontSize: '12px',
    color: '#a1a1aa',
    fontFamily: "'Fira Code', 'Courier New', monospace",
    fontWeight: '700'
  },
  cardNpmCode: {
    fontSize: '11.5px',
    fontFamily: "'Fira Code', 'Courier New', monospace",
    color: '#18181b',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  cardNpmBadge: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '999px',
    flexShrink: 0,
    transition: 'all 0.18s ease'
  },
  cardBottomBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    marginTop: 'auto'
  },
  copyPillBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    border: 'none',
    padding: '9px 18px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    cursor: 'pointer'
  },
  circleInspectorBtn: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: '#ffffff',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
  },
  emptyState: {
    padding: '60px 20px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyClearBtn: {
    background: '#09090b',
    color: '#ffffff',
    border: 'none',
    padding: '8px 18px',
    borderRadius: '999px',
    fontSize: '12.5px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(9, 9, 11, 0.45)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  modalBox: {
    width: '100%',
    maxWidth: '680px',
    maxHeight: '90vh',
    background: '#ffffff',
    borderRadius: '28px',
    border: '1px solid #e4e4e7',
    boxShadow: '0 24px 60px -12px rgba(0, 0, 0, 0.25)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '22px 26px 18px 26px',
    borderBottom: '1px solid #f4f4f5'
  },
  modalHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  modalIconBox: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: '#f4f4f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalTitle: {
    fontSize: '17px',
    fontWeight: '800',
    color: '#09090b',
    margin: 0
  },
  modalSubtitle: {
    fontSize: '12.5px',
    color: '#71717a',
    margin: '3px 0 0 0',
    display: 'flex',
    alignItems: 'center'
  },
  closeBtn: {
    background: '#f4f4f5',
    border: 'none',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    fontSize: '13px',
    color: '#71717a',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalInstallBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 24px',
    background: '#090d16',
    borderBottom: '1px solid #1e293b'
  },
  modalInstallCodeGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    overflow: 'hidden'
  },
  modalTerminalPrompt: {
    color: '#38bdf8',
    fontFamily: "'Fira Code', 'Courier New', monospace",
    fontWeight: '700',
    fontSize: '13px'
  },
  modalInstallCode: {
    color: '#f8fafc',
    fontFamily: "'Fira Code', 'Courier New', monospace",
    fontSize: '13px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  modalInstallCopyBtn: {
    border: 'none',
    padding: '6px 16px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexShrink: 0,
    transition: 'all 0.18s ease'
  },
  modalTabsBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '10px 26px',
    borderBottom: '1px solid #f4f4f5',
    background: '#fafafa'
  },
  modalTab: {
    border: 'none',
    background: 'transparent',
    padding: '6px 14px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#71717a',
    cursor: 'pointer',
    transition: 'all 0.16s ease'
  },
  modalTabActive: {
    background: '#ffffff',
    color: '#09090b',
    fontWeight: '700',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
  },
  modalBody: {
    padding: '24px 26px',
    overflowY: 'auto',
    flex: 1
  },
  installTabContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px'
  },
  installRowBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  installRowHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  installRowTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#18181b'
  },
  installRowTag: {
    fontSize: '11.5px',
    color: '#71717a',
    fontFamily: "'Fira Code', 'Courier New', monospace"
  },
  installCodeBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#f4f4f5',
    padding: '10px 16px',
    borderRadius: '12px',
    fontFamily: "'Fira Code', 'Courier New', monospace",
    fontSize: '13px',
    color: '#09090b',
    border: '1px solid #e4e4e7'
  },
  installCopyPill: {
    background: '#18181b',
    color: '#ffffff',
    border: 'none',
    padding: '5px 14px',
    borderRadius: '999px',
    fontSize: '11.5px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  installNoteBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    padding: '12px 16px',
    borderRadius: '12px'
  },
  installNoteText: {
    fontSize: '12.5px',
    color: '#64748b',
    lineHeight: 1.5
  },
  codeContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  codeHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  codeLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#27272a'
  },
  copySpecBtn: {
    background: '#09090b',
    color: '#ffffff',
    border: 'none',
    padding: '5px 14px',
    borderRadius: '999px',
    fontSize: '11.5px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  codePre: {
    margin: 0,
    padding: '16px 18px',
    background: '#090d16',
    color: '#38bdf8',
    borderRadius: '16px',
    fontSize: '12px',
    lineHeight: 1.6,
    fontFamily: "'Fira Code', 'Courier New', monospace",
    overflowX: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all'
  },
  overviewContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  overviewHeading: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#18181b',
    margin: '0 0 6px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  overviewText: {
    fontSize: '14px',
    lineHeight: 1.6,
    color: '#52525b',
    margin: 0
  },
  triggersList: {
    margin: 0,
    padding: 0,
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  triggerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13.5px',
    color: '#3f3f46',
    background: '#f4f4f5',
    padding: '8px 14px',
    borderRadius: '10px'
  },
  triggerDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#6366f1',
    flexShrink: 0
  },
  installBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#f4f4f5',
    padding: '10px 16px',
    borderRadius: '12px',
    fontFamily: "'Fira Code', monospace",
    fontSize: '13px',
    color: '#09090b'
  },
  installCopyBtn: {
    background: '#18181b',
    color: '#ffffff',
    border: 'none',
    padding: '4px 12px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};
