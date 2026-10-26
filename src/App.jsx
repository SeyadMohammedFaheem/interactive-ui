import React, { useState, useEffect, useRef } from 'react';
import CarouselSliderMorph from './components/CarouselSliderMorph.jsx';
import RulerPickerMorph from './components/RulerPickerMorph.jsx';
import NewProjectMorph from './components/NewProjectMorph.jsx';
import CommentThreadMorph from './components/CommentThreadMorph.jsx';
import PrivacyToggleMorph from './components/PrivacyToggleMorph.jsx';
import SetStatusMorph from './components/SetStatusMorph.jsx';
import ViewOnMapMorph from './components/ViewOnMapMorph.jsx';
import StepperMorph from './components/StepperMorph.jsx';
import NumberStepperMorph from './components/NumberStepperMorph.jsx';
import VoiceChatMorph from './components/VoiceChatMorph.jsx';
import LicenseKeyMorph from './components/LicenseKeyMorph.jsx';
import AnimatedTagGrid from './components/AnimatedTagGrid.jsx';
import ChromaticThinkingMorph from './components/ChromaticThinkingMorph.jsx';
import ExpandableFabMorph from './components/ExpandableFabMorph.jsx';
import CardSwapMorph from './components/CardSwapMorph.jsx';
import StackedToastMorph from './components/StackedToastMorph.jsx';
import LikeCounterMorph from './components/LikeCounterMorph.jsx';
import FileDropMorph from './components/FileDropMorph.jsx';
import OtpInputMorph from './components/OtpInputMorph.jsx';
import SlideToConfirmMorph from './components/SlideToConfirmMorph.jsx';
import SpreadCardMorph from './components/SpreadCardMorph.jsx';
import StockChartMorph from './components/StockChartMorph.jsx';
import MusicPlayerMorph from './components/MusicPlayerMorph.jsx';
import SignaturePadMorph from './components/SignaturePadMorph.jsx';
import CryptoSwapMorph from './components/CryptoSwapMorph.jsx';
import TrafficChartMorph from './components/TrafficChartMorph.jsx';
import BeforeAfterMorph from './components/BeforeAfterMorph.jsx';
import HoldToRecordMorph from './components/HoldToRecordMorph.jsx';
import TimeRulerMorph from './components/TimeRulerMorph.jsx';
import ProfileCardMorph from './components/ProfileCardMorph.jsx';
import BoardingPassMorph from './components/BoardingPassMorph.jsx';
import CollapsibleSidebarMorph from './components/CollapsibleSidebarMorph.jsx';
import GlassyPaginationMorph from './components/GlassyPaginationMorph.jsx';
import ReorderListMorph from './components/ReorderListMorph.jsx';
import AgenticSkillsView from './components/AgenticSkillsView.jsx';

const CARDS = [
  {
    id: 'reorderList',
    title: 'Spring FLIP Reorder List',
    category: 'Animation',
    tags: ['Drag', 'Slide', 'Hover'],
    badge: 'New',
    height: 420,
    component: ReorderListMorph
  },
  {
    id: 'glassyPagination',
    title: 'Glassy Pagination Slider',
    category: 'Animation',
    tags: ['Slide', 'Drag', 'Press', 'Hover'],
    badge: 'New',
    height: 520,
    component: GlassyPaginationMorph
  },
  {
    id: 'collapsibleSidebar',
    title: 'Collapsible Sidebar',
    category: 'Navigation',
    tags: ['Press', 'Hover', 'Morph'],
    badge: 'New',
    height: 480,
    component: CollapsibleSidebarMorph
  },
  {
    id: 'boardingPass',
    title: 'Boarding Pass Ticket',
    category: 'Feedback',
    tags: ['Press', 'Hover', 'Slide'],
    badge: 'New',
    height: 360,
    component: BoardingPassMorph
  },
  {
    id: 'profileCard',
    title: 'Profile Card',
    category: 'Feedback',
    tags: ['Press', 'Hover', 'Morph'],
    badge: 'New',
    height: 400,
    component: ProfileCardMorph
  },
  {
    id: 'timeRuler',
    title: 'Time Ruler Picker',
    category: 'Inputs',
    tags: ['Slide', 'Drag', 'Select'],
    badge: 'New',
    height: 380,
    component: TimeRulerMorph
  },
  {
    id: 'holdToRecord',
    title: 'Hold to Record Pill',
    category: 'Inputs',
    tags: ['Press', 'Drag', 'Slide'],
    badge: 'New',
    height: 380,
    component: HoldToRecordMorph
  },
  {
    id: 'beforeAfter',
    title: 'Before / After Slider',
    category: 'Animation',
    tags: ['Slide', 'Drag', 'Hover'],
    badge: 'New',
    height: 520,
    component: BeforeAfterMorph
  },
  {
    id: 'musicPlayer',
    title: 'Mini Music Player',
    category: 'Feedback',
    tags: ['Press', 'Slide', 'Select'],
    badge: 'New',
    height: 520,
    component: MusicPlayerMorph
  },
  {
    id: 'setStatus',
    title: 'Set Status Morph',
    category: 'Inputs',
    tags: ['Select', 'Press'],
    badge: 'New',
    height: 460,
    component: SetStatusMorph
  },
  {
    id: 'viewOnMap',
    title: 'View on Map Morph',
    category: 'Navigation',
    tags: ['Press', 'Drag'],
    badge: 'New',
    height: 520,
    component: ViewOnMapMorph
  },
  {
    id: 'privacyToggle',
    title: 'Privacy Toggle Morph',
    category: 'Inputs',
    tags: ['Hover', 'Select', 'Press'],
    badge: 'New',
    height: 320,
    component: PrivacyToggleMorph
  },
  {
    id: 'chromaticThinking',
    title: 'Generate / Thinking Morph',
    category: 'Feedback',
    tags: ['Loading', 'Hover', 'Press'],
    badge: 'New',
    height: 320,
    component: ChromaticThinkingMorph
  },
  {
    id: 'licenseKey',
    title: 'License Key Capsule Morph',
    category: 'Inputs',
    tags: ['Type', 'Press'],
    badge: 'New',
    height: 320,
    component: LicenseKeyMorph
  },
  {
    id: 'trafficChart',
    title: 'Traffic Analytics Bar Chart',
    category: 'Inputs',
    tags: ['Select', 'Hover', 'Press'],
    badge: 'New',
    height: 400,
    component: TrafficChartMorph
  },
  {
    id: 'cryptoSwap',
    title: 'Crypto Token Swap',
    category: 'Inputs',
    tags: ['Press', 'Type', 'Select'],
    badge: 'New',
    height: 380,
    component: CryptoSwapMorph
  },
  {
    id: 'signaturePad',
    title: 'Digital Signature Pad',
    category: 'Inputs',
    tags: ['Drag', 'Press', 'Type'],
    badge: 'New',
    height: 360,
    component: SignaturePadMorph
  },

  {
    id: 'stockChart',
    title: 'Interactive Stock Chart',
    category: 'Inputs',
    tags: ['Slide', 'Drag', 'Select'],
    badge: 'New',
    height: 440,
    component: StockChartMorph
  },
  {
    id: 'spreadCards',
    title: 'Card Spread',
    category: 'Animation',
    tags: ['Drag', 'Swipe', 'Press', 'Hover'],
    badge: 'New',
    height: 520,
    component: SpreadCardMorph
  },
  {
    id: 'slideToConfirm',
    title: 'Slide to confirm',
    category: 'Inputs',
    tags: ['Slide', 'Drag', 'Press'],
    badge: 'New',
    height: 320,
    component: SlideToConfirmMorph
  },
  {
    id: 'otpInput',
    title: 'PIN Verification',
    category: 'Inputs',
    tags: ['Type', 'Press', 'Select'],
    badge: 'New',
    height: 340,
    component: OtpInputMorph
  },
  {
    id: 'fileDrop',
    title: 'File Drop Upload',
    category: 'Inputs',
    tags: ['Drag', 'Press', 'Loading'],
    badge: 'New',
    height: 480,
    component: FileDropMorph
  },
  {
    id: 'likeCounter',
    title: 'Like Counter',
    category: 'Feedback',
    tags: ['Press', 'Hover'],
    badge: 'New',
    height: 320,
    component: LikeCounterMorph
  },
  {
    id: 'stackedToasts',
    title: 'Stacked Toasts',
    category: 'Feedback',
    tags: ['Hover', 'Press', 'Select'],
    badge: 'New',
    height: 460,
    component: StackedToastMorph
  },
  {
    id: 'cardSwap',
    title: 'Card swap',
    category: 'Animation',
    tags: ['Drag', 'Swipe', 'Press', 'Hover'],
    badge: 'New',
    height: 520,
    component: CardSwapMorph
  },
  {
    id: 'expandableFab',
    title: 'Expandable FAB',
    category: 'Navigation',
    tags: ['Press', 'Hover'],
    badge: 'New',
    height: 560,
    component: ExpandableFabMorph
  },
  {
    id: 'numberStepper',
    title: 'Number Counter',
    category: 'Inputs',
    tags: ['Drag', 'Press', 'Slide'],
    height: 340,
    component: NumberStepperMorph
  },


  {
    id: 'stepper',
    title: 'Glossy Pagination',
    category: 'Inputs',
    tags: ['Drag', 'Press', 'Slide'],
    height: 340,
    component: StepperMorph
  },

  {
    id: 'tagGrid',
    title: 'Animated Tag Selector',
    category: 'Inputs',
    tags: ['Select', 'Press', 'Hover'],
    height: 480,
    component: AnimatedTagGrid
  },
  {
    id: 'carouselSlider',
    title: 'Carousel Orbit',
    category: 'Navigation',
    tags: ['Drag', 'Slide'],
    height: 580,
    component: CarouselSliderMorph
  },
  {
    id: 'commentThread',
    title: 'Comment Thread',
    category: 'Feedback',
    tags: ['Type', 'Press'],
    height: 520,
    component: CommentThreadMorph
  },
  {
    id: 'voiceChat',
    title: 'Voice Chat',
    category: 'Feedback',
    tags: ['Press', 'Loading'],
    height: 480,
    component: VoiceChatMorph
  },

  {
    id: 'rulerPicker',
    title: 'Ruler Picker',
    category: 'Inputs',
    tags: ['Drag', 'Slide'],
    height: 340,
    component: RulerPickerMorph
  },
  {
    id: 'newProject',
    title: 'New Project',
    category: 'Feedback',
    tags: ['Press', 'Select'],
    height: 560,
    component: NewProjectMorph
  },


];

const CARD_DESCRIPTIONS = {
  timeRuler: "Precision tactile time ruler and wheel picker with dynamic 5-minute tick marks, fixed red indicator needle, and haptic audio feedback.",
  holdToRecord: "Tactile iOS voice note capsule with 3 morphing states: idle hold-to-record pill, dynamic waveform recording with slide-to-cancel, and interactive playback scrubber.",
  beforeAfter: "Interactive before/after dual image slider comparing a monochrome sketch with full vibrant alpine oil painting using fluid gesture scrubbing and spring momentum.",
  cardSwap: "A stack of photo cards in depth: press the front card or fling it and it goes straight to the back while the rest step forward, or switch Auto on to have it swap by itself.",
  spreadCards: "Interactive layered photos that fan outward into a panoramic stack with fluid physics, perspective tilt, and spring transitions.",
  cryptoSwap: "Ultra-responsive token swap capsule featuring dynamic balance calculation, token selector modal, and fluid 180° flip animation.",
  signaturePad: "High-resolution signature canvas with quadratic Bézier curve smoothing, guideline rule, auto-signature playback, and haptic feedback.",
  stockChart: "Smooth interactive financial chart with cursor scrubbing, dynamic price telemetry, and animated gradient fill.",
  trafficChart: "Fluid analytics bar chart with responsive daily volume metrics, Day/Week view toggling, and bouncy column elevation.",
  musicPlayer: "Compact floating media player with active track streaming, interactive waveform scrubber, and elapsed time readout.",
  viewOnMap: "Spring-loaded location capsule that blooms into a localized map preview with scoped glassmorphism and pinpoint animations.",
  setStatus: "Subtle profile status indicator that expands smoothly into an interactive contextual mood and presence selector.",
  privacyToggle: "Spring-loaded privacy settings controller with iOS toggle switches and instant permission updates.",
  chromaticThinking: "Hypnotic chromatic thinking and generation capsule featuring prismatic iridescent borders and loading pulse.",
  licenseKey: "Apple-grade license key activation pill expanding with fluid spring mechanics into formatted license verification.",
  stackedToasts: "Interactive stacked alert toasts that fan out on hover, allow swipe-to-dismiss, and cycle with spring physics.",
  expandableFab: "Multi-action floating action button that blossoms into quick action pills with spring-loaded stagger.",
  slideToConfirm: "Tactile slide-to-confirm rail with magnetic drag thumb, progress filling, and celebratory success completion.",
  likeCounter: "Bouncy like counter with floating heart particles, incremental count animation, and tactile spring responsiveness.",
  otpInput: "Smooth 6-digit OTP verification input with auto-advance, backspace handling, and numeric validation.",
  fileDrop: "Delightful drag-and-drop file upload target with dynamic border illumination, progress bar, and file preview badge.",
  numberStepper: "Precision numeric counter with fluid vertical ticker digit rolling and momentum drag increments.",
  stepper: "Liquid pagination capsule with magnetic dot indicator that stretches and morphs across pages.",
  tagGrid: "Interactive tag filter pills with fluid layout rearrangement and animated multi-selection.",
  carouselSlider: "3D perspective carousel slider with smooth gesture panning, infinite loop paging, and depth blur.",
  commentThread: "Real-time nested comment thread with expanding reply composer, upvote springs, and avatar stacks.",
  voiceChat: "Interactive voice session pill with dynamic audio visualizer wave bars and active microphone toggle."
};

const FILTER_PILLS = [
  'Hover',
  'Press',
  'Drag',
  'Slide',
  'Swipe',
  'Type',
  'Select',
  'Loading'
];

export default function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const embedId = urlParams.get('embed');
  const directId = urlParams.get('id');

  const [navSection, setNavSection] = useState(() => {
    return urlParams.get('page') === 'skills' ? 'skills' : 'components';
  });
  const [activeTab, setActiveTab] = useState(() => {
    return directId && CARDS.some(c => c.id === directId) ? directId : 'cardSwap';
  });
  const [viewMode, setViewMode] = useState(() => {
    return directId ? 'single' : 'showcase';
  });
  const [stageTheme, setStageTheme] = useState('Light'); // 'Light' | 'Dark'
  const [isAuto, setIsAuto] = useState(false);
  const [autoSpeed, setAutoSpeed] = useState(4.0);
  const [viewType, setViewType] = useState('preview'); // 'preview' | 'code'
  const [isMuted, setIsMuted] = useState(false);
  const [benchCards, setBenchCards] = useState(new Set());
  const [benchToast, setBenchToast] = useState('');
  const [modalCard, setModalCard] = useState(null); // active card for Embed modal
  const [copiedType, setCopiedType] = useState(''); // 'iframe' | 'url' | 'react' | 'single-code'
  const [activeFilter, setActiveFilter] = useState(''); // '' means all
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const heroSearchInputRef = useRef(null);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [reloads, setReloads] = useState({});

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (copiedType) {
      const timer = setTimeout(() => setCopiedType(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedType]);

  // Clean direct iframe embed mode
  if (embedId) {
    const embedCard = CARDS.find((c) => c.id === embedId) || CARDS[0];
    const EmbedComp = embedCard.component;
    return (
      <div style={styles.embedStage}>
        <style>{`
          .card-stage,
          .card-stage > div {
            background: transparent !important;
          }
        `}</style>
        <div className="card-stage" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EmbedComp />
        </div>
      </div>
    );
  }

  const switchNavSection = (section) => {
    setNavSection(section);
    if (section === 'skills') {
      setViewMode('showcase');
      try {
        const url = new URL(window.location);
        url.searchParams.delete('id');
        url.searchParams.set('page', 'skills');
        window.history.pushState({}, '', url);
      } catch (e) {}
    } else {
      try {
        const url = new URL(window.location);
        url.searchParams.delete('page');
        window.history.pushState({}, '', url);
      } catch (e) {}
    }
  };

  const openSingleView = (tabId) => {
    setNavSection('components');
    setActiveTab(tabId);
    setViewMode('single');
    try {
      const url = new URL(window.location);
      url.searchParams.delete('page');
      url.searchParams.set('id', tabId);
      window.history.pushState({}, '', url);
    } catch (e) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeSingleView = () => {
    setViewMode('showcase');
    try {
      const url = new URL(window.location);
      url.searchParams.delete('id');
      window.history.pushState({}, '', url);
    } catch (e) {}
  };

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const page = params.get('page');
      if (page === 'skills') {
        setNavSection('skills');
      } else {
        setNavSection('components');
        const id = params.get('id');
        if (id && CARDS.some(c => c.id === id)) {
          setActiveTab(id);
          setViewMode('single');
        } else {
          setViewMode('showcase');
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (viewMode === 'single') {
          closeSingleView();
          searchInputRef.current?.focus();
        } else {
          const heroRect = heroSearchInputRef.current?.getBoundingClientRect();
          if (heroRect && heroRect.top >= 0 && heroRect.bottom <= window.innerHeight) {
            heroSearchInputRef.current?.focus();
          } else {
            searchInputRef.current?.focus();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode]);

  const toggleBookmark = (e, id) => {
    e.stopPropagation();
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const reloadCard = (e, id) => {
    e.stopPropagation();
    setReloads(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const filteredCards = CARDS.filter((card) => {
    const matchesFilter = !activeFilter || (card.tags && card.tags.includes(activeFilter));
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || (
      card.title.toLowerCase().includes(q) ||
      (card.category && card.category.toLowerCase().includes(q)) ||
      (card.tags && card.tags.some(t => t.toLowerCase().includes(q)))
    );
    return matchesFilter && matchesSearch;
  });

  const activeCardInfo = CARDS.find((c) => c.id === activeTab) || CARDS[0];
  const ActiveComponent = activeCardInfo.component;

  const getEmbedIframeCode = (cardId) => {
    const origin = window.location.origin + window.location.pathname;
    return `<iframe src="${origin}?embed=${cardId}" width="100%" height="600px" style="border:none; border-radius: 28px; overflow: hidden;" allow="autoplay" loading="lazy"></iframe>`;
  };

  const getEmbedUrl = (cardId) => {
    return `${window.location.origin}${window.location.pathname}?embed=${cardId}`;
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
  };

  const toggleFilter = (pill) => {
    setActiveFilter(prev => prev === pill ? '' : pill);
  };

  return (
    <div style={{
      ...styles.appContainer,
      height: (navSection === 'components' && viewMode === 'single') ? '100vh' : 'auto',
      overflow: (navSection === 'components' && viewMode === 'single') ? 'hidden' : 'visible'
    }}>
      {/* Edge-to-edge masonry layout and overrides */}
      <style>{`
        .card-stage,
        .card-stage > div {
          background: transparent !important;
        }
        .masonry-columns {
          column-count: 3;
          column-gap: 20px;
          width: 100%;
        }
        @media (max-width: 1180px) {
          .masonry-columns {
            column-count: 2 !important;
          }
        }
        @media (max-width: 720px) {
          .masonry-columns {
            column-count: 1 !important;
          }
        }
        .masonry-card {
          break-inside: avoid;
          margin-bottom: 20px;
          position: relative;
          background: #F1F1F2;
          border-radius: 28px;
          overflow: hidden;
          box-shadow: none;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
        }
        .card-bottom-bar,
        .card-bookmark-btn {
          opacity: 0;
          transform: translateY(6px);
          transition: opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1), transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: none;
        }
        .card-bookmark-btn {
          transform: translateY(-6px);
        }
        .masonry-card:hover .card-bottom-bar,
        .masonry-card:hover .card-bookmark-btn {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }
        .search-pill-input::placeholder {
          color: #52525b !important;
          opacity: 1;
          font-weight: 500;
        }
        @media (hover: none) {
          .card-bottom-bar,
          .card-bookmark-btn {
            opacity: 1;
            transform: translateY(0);
            pointer-events: auto;
          }
        }
        @keyframes toastFade {
          from {
            opacity: 0;
            transform: translate(-50%, 14px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        @keyframes pulseRecord {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.28);
            opacity: 0.6;
          }
        }
        @media (max-width: 960px) {
          .single-split-layout {
            flex-direction: column !important;
            height: auto !important;
            max-height: none !important;
            overflow-y: auto !important;
          }
          .single-stage-wrapper {
            min-height: 440px !important;
          }
          .single-inspector-panel {
            width: 100% !important;
            height: auto !important;
          }
        }
      `}</style>

      {/* Simple Header with Monochrome Folded Figure Logo */}
      <header style={styles.simpleNavbar}>
        <div style={styles.simpleNavbarContent}>
          <div style={styles.simpleBrandGroup} onClick={() => switchNavSection('components')}>
            <img
              src="/Monochrome%20Folded%20Figure%20Logo.png"
              alt="Monochrome Folded Figure Logo"
              style={styles.simpleLogoImg}
            />
            <span style={styles.simpleBrandTitle}>repo.fw</span>
          </div>

          {/* Center: Segmented Navigation Switcher */}
          <div style={styles.navSectionSwitcher}>
            <button
              style={{
                ...styles.navSectionBtn,
                ...(navSection === 'components' ? styles.navSectionBtnActive : {})
              }}
              onClick={() => switchNavSection('components')}
            >
              Components
            </button>
            <button
              style={{
                ...styles.navSectionBtn,
                ...(navSection === 'skills' ? styles.navSectionBtnActive : {})
              }}
              onClick={() => switchNavSection('skills')}
            >
              Agentic Skills
            </button>
          </div>

          {/* Right Group: Search Bar & Actions */}
          <div style={styles.simpleNavRightGroup}>
            {/* Search Bar Input */}
            <div
              style={styles.searchBarBox}
              onClick={() => searchInputRef.current?.focus()}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="7.5"></circle>
                <line x1="21" y1="21" x2="16.5" y2="16.5"></line>
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                className="search-pill-input"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (viewMode === 'single') {
                    closeSingleView();
                  }
                }}
                placeholder="Search"
                style={styles.searchInput}
              />
              {searchQuery ? (
                <button
                  style={styles.searchClearBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                  title="Clear search"
                >
                  ✕
                </button>
              ) : (
                <span style={styles.searchShortcutText}>Ctrl K</span>
              )}
            </div>

            {viewMode === 'single' && (
              <button
                style={styles.simpleBackBtn}
                onClick={closeSingleView}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                <span>Back to Grid</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={styles.mainContent}>
        {navSection === 'skills' ? (
          <AgenticSkillsView
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        ) : viewMode === 'showcase' ? (
          <>
            {/* Hero Section matching reference design */}
            <section style={styles.heroSection}>
              <div style={styles.heroBadge}>
                Daily updates
              </div>
              <h1 style={styles.heroTitle}>Interactive UI Components</h1>
              <p style={styles.heroSubtitle}>
                A library of <strong style={styles.heroStrong}>interactive React components</strong> and <strong style={styles.heroStrong}>micro-interactions</strong> you can explore and take straight into your projects.
              </p>
              <div style={styles.heroSearchContainer}>
                <div
                  style={styles.heroSearchBar}
                  onClick={() => heroSearchInputRef.current?.focus()}
                >
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#52525b"
                    strokeWidth="2.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flexShrink: 0 }}
                  >
                    <circle cx="11" cy="11" r="7.5"></circle>
                    <line x1="21" y1="21" x2="16.5" y2="16.5"></line>
                  </svg>
                  <input
                    ref={heroSearchInputRef}
                    type="text"
                    className="search-pill-input"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      const gridEl = document.getElementById('components-grid');
                      if (gridEl && e.target.value.trim().length === 1) {
                        gridEl.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    placeholder="Search"
                    style={styles.heroSearchInput}
                  />
                  {searchQuery ? (
                    <button
                      style={styles.searchClearBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchQuery('');
                        heroSearchInputRef.current?.focus();
                      }}
                      title="Clear search"
                    >
                      ✕
                    </button>
                  ) : (
                    <span style={styles.heroSearchShortcutText}>Ctrl K</span>
                  )}
                </div>
              </div>
            </section>

            {/* Edge-to-Edge Left-Aligned Filter Pills Row */}
            <section style={styles.filterSection}>
              <div style={styles.filterPillsContainer}>
                {FILTER_PILLS.map((pill) => {
                  const isActive = activeFilter === pill;
                  return (
                    <button
                      key={pill}
                      style={{
                        ...styles.filterPill,
                        ...(isActive ? styles.filterPillActive : styles.filterPillInactive)
                      }}
                      onClick={() => toggleFilter(pill)}
                    >
                      {pill}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Edge-to-Edge Masonry Grid with Variable Heights */}
            <section id="components-grid" style={styles.gridSection}>
              {filteredCards.length === 0 ? (
                <div style={styles.emptySearchBox}>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: '#18181b', margin: '0 0 6px 0' }}>
                    No matching components found
                  </p>
                  <p style={{ fontSize: '13px', color: '#71717a', margin: '0 0 14px 0' }}>
                    No results for "{searchQuery}"
                  </p>
                  <button
                    style={styles.emptyClearBtn}
                    onClick={() => {
                      setSearchQuery('');
                      setActiveFilter('');
                    }}
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="masonry-columns">
                {filteredCards.map((card) => {
                  const Comp = card.component;
                  const isBookmarked = bookmarkedIds.has(card.id);
                  const reloadKey = reloads[card.id] || 0;

                  return (
                    <div
                      key={card.id}
                      className="masonry-card"
                      style={{
                        height: `${card.height}px`
                      }}
                    >
                      {/* Centered Interactive Component Canvas */}
                      <div className="card-stage" style={styles.componentCanvasStage}>
                        <Comp key={reloadKey} />
                      </div>

                      {/* Bottom Floating Bar */}
                      <div className="card-bottom-bar" style={styles.cardBottomBar}>
                        {/* Bottom-Left Component Name Pill */}
                        <button
                          style={styles.titlePill}
                          onClick={() => openSingleView(card.id)}
                          title="Open component view"
                        >
                          {card.title}
                        </button>

                        {/* Bottom-Right Circle Action Buttons (Settings/Embed) */}
                        <div style={styles.actionCirclesGroup}>
                          {/* Sliders / Inspector View Button */}
                          <button
                            style={styles.circleActionBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              openSingleView(card.id);
                            }}
                            title="Open Component Inspector"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#18181b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="4" y1="21" x2="4" y2="14"></line>
                              <line x1="4" y1="10" x2="4" y2="3"></line>
                              <line x1="12" y1="21" x2="12" y2="12"></line>
                              <line x1="12" y1="8" x2="12" y2="3"></line>
                              <line x1="20" y1="21" x2="20" y2="16"></line>
                              <line x1="20" y1="12" x2="20" y2="3"></line>
                              <line x1="1" y1="14" x2="7" y2="14"></line>
                              <line x1="9" y1="8" x2="15" y2="8"></line>
                              <line x1="17" y1="16" x2="23" y2="16"></line>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            </section>
          </>
        ) : (
          /* Focused Single View Split Inspector Mode */
          <div className="single-split-layout" style={styles.singleSplitLayout}>
            {/* Left Column: Stage Box */}
            <div
              className="single-stage-wrapper"
              style={{
                ...styles.singleStageWrapper,
                backgroundColor: stageTheme === 'Dark' ? '#18181b' : '#ECECED',
                color: stageTheme === 'Dark' ? '#ffffff' : '#18181b'
              }}
            >
              {/* Top-Left: 3D Preview / Code Mode Segmented Pill */}
              <div
                style={{
                  ...styles.stageTopLeftPill,
                  background: stageTheme === 'Dark' ? 'rgba(39, 39, 42, 0.85)' : 'rgba(255, 255, 255, 0.85)',
                  borderColor: stageTheme === 'Dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'
                }}
              >
                <button
                  style={{
                    ...styles.stagePillBtn,
                    background: viewType === 'preview' ? (stageTheme === 'Dark' ? '#27272a' : '#ffffff') : 'transparent',
                    boxShadow: viewType === 'preview' ? '0 2px 6px rgba(0, 0, 0, 0.08)' : 'none',
                    color: stageTheme === 'Dark' ? '#f4f4f5' : '#18181b'
                  }}
                  onClick={() => setViewType('preview')}
                  title="3D Live Interactive Preview"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
                </button>

                <button
                  style={{
                    ...styles.stagePillBtn,
                    background: viewType === 'code' ? (stageTheme === 'Dark' ? '#27272a' : '#ffffff') : 'transparent',
                    boxShadow: viewType === 'code' ? '0 2px 6px rgba(0, 0, 0, 0.08)' : 'none',
                    color: stageTheme === 'Dark' ? '#f4f4f5' : '#18181b'
                  }}
                  onClick={() => setViewType('code')}
                  title="View Embed Code"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                  </svg>
                </button>
              </div>

              {/* Top-Right: Audio Icon */}
              <div style={styles.stageTopRightActions}>
                <button
                  style={{
                    ...styles.stageIconActionBtn,
                    color: isMuted ? '#a1a1aa' : (stageTheme === 'Dark' ? '#d4d4d8' : '#71717a')
                  }}
                  onClick={() => setIsMuted(!isMuted)}
                  title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                >
                  {isMuted ? (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
                      <line x1="12" y1="19" x2="12" y2="23"></line>
                      <line x1="8" y1="23" x2="16" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    </svg>
                  )}
                </button>
              </div>

              {/* Center: Live Component or Code Viewer */}
              <div style={styles.stageContentCenter}>
                {viewType === 'preview' ? (
                  <ActiveComponent
                    key={`${activeCardInfo.id}-${stageTheme}-${reloads[activeCardInfo.id] || 0}`}
                    auto={isAuto}
                    speed={autoSpeed}
                    sound={!isMuted}
                    theme={stageTheme}
                  />
                ) : (
                  <div style={styles.codeViewerBox}>
                    <div style={styles.codeViewerBar}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>
                        {activeCardInfo.component.name || activeCardInfo.title}.jsx
                      </span>
                      <button
                        style={styles.codeViewerCopyBtn}
                        onClick={() => handleCopy(`import ${activeCardInfo.component.name} from './components/${activeCardInfo.component.name}.jsx';\n\n<${activeCardInfo.component.name} auto={${isAuto}} speed={${autoSpeed}} sound={${!isMuted}} theme="${stageTheme}" />`, 'single-code')}
                      >
                        {copiedType === 'single-code' ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                    <pre style={styles.codeViewerPre}>
{`import ${activeCardInfo.component.name} from './components/${activeCardInfo.component.name}.jsx';

export default function Example() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
      <${activeCardInfo.component.name}
        auto={${isAuto}}
        speed={${autoSpeed}}
        sound={${!isMuted}}
        theme="${stageTheme}"
      />
    </div>
  );
}`}
                    </pre>
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: Inspector Panel */}
            <div className="single-inspector-panel" style={styles.singleInspectorPanel}>
              {/* Header: Title + Close Button */}
              <div style={styles.inspectorHeader}>
                <h2 style={styles.inspectorTitle}>{activeCardInfo.title}</h2>
                <button
                  style={styles.inspectorCloseBtn}
                  onClick={closeSingleView}
                  title="Close and return to overview"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              {/* Description */}
              <p style={styles.inspectorDescription}>
                {CARD_DESCRIPTIONS[activeCardInfo.id] || "Interactive SwiftUI & React animation prototype featuring dynamic physics, spring transitions, and responsive gesture control."}
              </p>

              {/* Controls List */}
              <div style={styles.inspectorControlsList}>
                {/* Row 1: Fill */}
                <div style={styles.inspectorControlRow}>
                  <span style={styles.controlLabel}>Fill</span>
                  <div style={styles.segmentedToggleTrack}>
                    <button
                      style={{
                        ...styles.segmentedOption,
                        ...(stageTheme === 'Light' ? styles.segmentedOptionActive : {})
                      }}
                      onClick={() => setStageTheme('Light')}
                    >
                      Light
                    </button>
                    <button
                      style={{
                        ...styles.segmentedOption,
                        ...(stageTheme === 'Dark' ? styles.segmentedOptionActive : {})
                      }}
                      onClick={() => setStageTheme('Dark')}
                    >
                      Dark
                    </button>
                  </div>
                </div>

                {/* Row 2: Auto */}
                <div style={styles.inspectorControlRow}>
                  <span style={styles.controlLabel}>Auto</span>
                  <button
                    style={{
                      ...styles.iosSwitchTrack,
                      backgroundColor: isAuto ? '#18181b' : '#e4e4e7'
                    }}
                    onClick={() => setIsAuto(!isAuto)}
                    role="switch"
                    aria-checked={isAuto}
                  >
                    <div
                      style={{
                        ...styles.iosSwitchThumb,
                        transform: isAuto ? 'translateX(20px)' : 'translateX(0px)'
                      }}
                    />
                  </button>
                </div>

                {/* Row 3: Every */}
                <div style={styles.inspectorControlRow}>
                  <div style={styles.everyPill}>
                    <div style={styles.everyLabelPart}>Every</div>
                    <button
                      style={styles.everyValuePart}
                      onClick={() => {
                        const speeds = [2.0, 3.0, 4.0, 5.0, 6.0];
                        const nextIdx = (speeds.indexOf(autoSpeed) + 1) % speeds.length;
                        setAutoSpeed(speeds[nextIdx]);
                      }}
                      title="Click to change autoplay duration"
                    >
                      {autoSpeed.toFixed(1)}s
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Action Buttons */}
              <div style={styles.inspectorActionButtons}>
                <button
                  style={styles.inspectorShareBtn}
                  onClick={() => {
                    const shareUrl = `${window.location.origin}${window.location.pathname}?id=${activeCardInfo.id}`;
                    navigator.clipboard.writeText(shareUrl);
                    setBenchToast('Link copied to clipboard!');
                    setTimeout(() => setBenchToast(''), 2500);
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="17 1 21 5 17 9"></polyline>
                    <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                    <polyline points="7 23 3 19 7 15"></polyline>
                    <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                  </svg>
                  <span>Share</span>
                </button>

                <button
                  style={styles.inspectorBenchBtn}
                  onClick={() => {
                    setBenchCards(prev => {
                      const next = new Set(prev);
                      const isAdded = next.has(activeCardInfo.id);
                      if (isAdded) {
                        next.delete(activeCardInfo.id);
                        setBenchToast('Removed from bench');
                      } else {
                        next.add(activeCardInfo.id);
                        setBenchToast(`Added "${activeCardInfo.title}" to bench!`);
                      }
                      setTimeout(() => setBenchToast(''), 2500);
                      return next;
                    });
                  }}
                >
                  {benchCards.has(activeCardInfo.id) ? '✓ On bench' : 'Add to bench'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Feedback Toast Notification */}
      {benchToast && (
        <div style={styles.floatingToast}>
          <span>{benchToast}</span>
        </div>
      )}

      {/* Portfolio Embed Code Modal */}
      {modalCard && (
        <div style={styles.modalOverlay} onClick={() => setModalCard(null)}>
          <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalHeaderLeft}>
                <div style={styles.modalIconBox}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#18181b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                  </svg>
                </div>
                <div>
                  <h3 style={styles.modalTitle}>Embed "{modalCard.title}"</h3>
                  <p style={styles.modalSubtitle}>Drop into Framer, Webflow, Notion, or custom React portfolio.</p>
                </div>
              </div>
              <button style={styles.closeBtn} onClick={() => setModalCard(null)}>✕</button>
            </div>

            <div style={styles.modalBody}>
              {/* Option 1: Iframe HTML Embed */}
              <div style={styles.codeBlockGroup}>
                <div style={styles.codeBlockHeader}>
                  <span style={styles.codeBlockLabel}>HTML / Framer / Webflow Iframe Embed</span>
                  <button
                    style={styles.copyBtn}
                    onClick={() => handleCopy(getEmbedIframeCode(modalCard.id), 'iframe')}
                  >
                    {copiedType === 'iframe' ? '✓ Copied Iframe!' : 'Copy Iframe Code'}
                  </button>
                </div>
                <pre style={styles.codePre}>{getEmbedIframeCode(modalCard.id)}</pre>
              </div>

              {/* Option 2: Direct Embed URL */}
              <div style={styles.codeBlockGroup}>
                <div style={styles.codeBlockHeader}>
                  <span style={styles.codeBlockLabel}>Direct Interactive Embed URL</span>
                  <button
                    style={styles.copyBtn}
                    onClick={() => handleCopy(getEmbedUrl(modalCard.id), 'url')}
                  >
                    {copiedType === 'url' ? '✓ Copied URL!' : 'Copy Direct URL'}
                  </button>
                </div>
                <pre style={styles.codePre}>{getEmbedUrl(modalCard.id)}</pre>
              </div>

              {/* Option 3: React Import Snippet */}
              <div style={styles.codeBlockGroup}>
                <div style={styles.codeBlockHeader}>
                  <span style={styles.codeBlockLabel}>React Component Import</span>
                  <button
                    style={styles.copyBtn}
                    onClick={() => handleCopy(`import ${modalCard.component.name} from './components/${modalCard.component.name}.jsx';\n\n<${modalCard.component.name} />`, 'react')}
                  >
                    {copiedType === 'react' ? '✓ Copied React Code!' : 'Copy React Snippet'}
                  </button>
                </div>
                <pre style={styles.codePre}>{`import ${modalCard.component.name} from './components/${modalCard.component.name}.jsx';\n\n<${modalCard.component.name} />`}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  appContainer: {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: '#ffffff',
    color: '#09090b',
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
  },
  embedStage: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#ffffff',
    margin: 0,
    padding: 0,
    overflow: 'hidden'
  },
  simpleNavbar: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: '#ffffff',
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
    height: '52px',
    display: 'flex',
    alignItems: 'center'
  },
  simpleNavbarContent: {
    width: '100%',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxSizing: 'border-box'
  },
  navSectionSwitcher: {
    display: 'flex',
    alignItems: 'center',
    background: '#F1F1F2',
    padding: '3px',
    borderRadius: '999px',
    gap: '2px'
  },
  navSectionBtn: {
    border: 'none',
    padding: '6px 16px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#71717a',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.16s ease',
    userSelect: 'none'
  },
  navSectionBtnActive: {
    background: '#ffffff',
    color: '#09090b',
    fontWeight: '600',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
  },
  simpleBrandGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    userSelect: 'none'
  },
  simpleLogoImg: {
    height: '30px',
    width: '30px',
    objectFit: 'contain',
    mixBlendMode: 'multiply',
    display: 'block'
  },
  simpleBrandTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#09090b',
    letterSpacing: '-0.02em'
  },
  simpleNavRightGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  searchBarBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#F1F1F2',
    border: 'none',
    borderRadius: '999px',
    padding: '0 16px',
    height: '38px',
    width: '210px',
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
  emptySearchBox: {
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
  simpleBackBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#09090b',
    color: '#ffffff',
    border: 'none',
    padding: '6px 14px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'opacity 0.18s ease'
  },
  topNavbar: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(255, 255, 255, 0.88)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
  },
  navbarContent: {
    width: '100%',
    maxWidth: '100%',
    padding: '14px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  brandGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer'
  },
  brandIconBox: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: '#09090b',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  brandTitle: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#09090b',
    letterSpacing: '-0.02em'
  },
  brandCountBadge: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#71717a',
    background: '#f4f4f5',
    padding: '3px 8px',
    borderRadius: '999px',
    border: '1px solid #e4e4e7'
  },
  navRightGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  navActionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#f4f4f5',
    color: '#18181b',
    border: '1px solid #e4e4e7',
    padding: '7px 14px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  backShowcaseBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#09090b',
    color: '#ffffff',
    border: 'none',
    padding: '7px 14px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  mainContent: {
    flex: 1,
    width: '100%'
  },
  heroSection: {
    width: '100%',
    padding: '52px 20px 24px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    boxSizing: 'border-box'
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 18px',
    borderRadius: '999px',
    background: '#ffffff',
    border: '1px solid #e4e4e7',
    fontSize: '13px',
    fontWeight: '500',
    color: '#18181b',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
    marginBottom: '22px'
  },
  heroTitle: {
    fontSize: 'clamp(32px, 4.5vw, 48px)',
    fontWeight: '700',
    letterSpacing: '-0.03em',
    color: '#09090b',
    margin: '0 0 16px 0',
    lineHeight: 1.15
  },
  heroSubtitle: {
    fontSize: '16px',
    fontWeight: '400',
    lineHeight: 1.6,
    color: '#71717a',
    maxWidth: '580px',
    margin: '0 0 28px 0',
    letterSpacing: '-0.01em'
  },
  heroStrong: {
    fontWeight: '600',
    color: '#18181b'
  },
  heroSearchContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '8px'
  },
  heroSearchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '11px',
    background: '#F1F1F2',
    border: 'none',
    borderRadius: '999px',
    padding: '0 18px',
    height: '44px',
    width: '240px',
    maxWidth: '90vw',
    boxSizing: 'border-box',
    cursor: 'text',
    transition: 'all 0.18s ease'
  },
  heroSearchInput: {
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: '15px',
    color: '#18181b',
    width: '100%',
    fontFamily: 'inherit',
    fontWeight: '500',
    padding: 0
  },
  heroSearchShortcutText: {
    fontSize: '13.5px',
    fontWeight: '400',
    color: '#9ca3af',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    fontFamily: 'inherit',
    letterSpacing: '0.01em'
  },
  filterSection: {
    width: '100%',
    maxWidth: '100%',
    padding: '16px 20px 20px 20px',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  filterPillsContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '8px',
    flexWrap: 'wrap',
    width: '100%'
  },
  filterPill: {
    padding: '7px 16px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.16s ease',
    outline: 'none',
    border: 'none'
  },
  filterPillActive: {
    background: '#09090b',
    color: '#ffffff',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.18)'
  },
  filterPillInactive: {
    background: '#F1F1F2',
    color: '#4b5563'
  },
  gridSection: {
    width: '100%',
    maxWidth: '100%',
    padding: '0 20px 80px 20px',
    margin: 0
  },
  badgePill: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    background: '#ffffff',
    color: '#18181b',
    fontSize: '12px',
    fontWeight: '700',
    padding: '5px 13px',
    borderRadius: '999px',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
    zIndex: 15,
    pointerEvents: 'none'
  },
  bookmarkBtn: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 15,
    transition: 'transform 0.15s ease'
  },
  componentCanvasStage: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    overflow: 'hidden',
    boxSizing: 'border-box',
    background: 'transparent'
  },
  cardBottomBar: {
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    right: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 15,
    pointerEvents: 'none'
  },
  titlePill: {
    pointerEvents: 'auto',
    background: '#ffffff',
    border: 'none',
    color: '#18181b',
    padding: '8px 18px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    cursor: 'pointer',
    transition: 'all 0.18s ease'
  },
  actionCirclesGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    pointerEvents: 'auto'
  },
  circleActionBtn: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: '#ffffff',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    transition: 'transform 0.15s ease'
  },
  singleSplitLayout: {
    display: 'flex',
    gap: '20px',
    alignItems: 'stretch',
    width: '100%',
    maxWidth: '100%',
    margin: 0,
    padding: '16px 20px',
    height: 'calc(100vh - 52px)',
    boxSizing: 'border-box',
    overflow: 'hidden'
  },
  singleStageWrapper: {
    flex: '1 1 0%',
    minWidth: '0',
    height: '100%',
    borderRadius: '28px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    transition: 'background-color 0.28s ease',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
    border: '1px solid rgba(0, 0, 0, 0.04)'
  },
  stageTopLeftPill: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    padding: '4px',
    borderRadius: '999px',
    border: '1px solid',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    zIndex: 20
  },
  stagePillBtn: {
    border: 'none',
    width: '32px',
    height: '32px',
    borderRadius: '999px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.16s ease'
  },
  stageTopRightActions: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    zIndex: 20
  },
  stageIconActionBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: 'none',
    background: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.16s ease'
  },
  stageContentCenter: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    boxSizing: 'border-box'
  },
  stageBottomPlayBtn: {
    position: 'absolute',
    bottom: '22px',
    right: '22px',
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    background: '#ffffff',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
    zIndex: 20
  },
  singleInspectorPanel: {
    width: '360px',
    flexShrink: 0,
    height: '100%',
    background: '#ffffff',
    borderRadius: '28px',
    padding: '28px 26px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 8px 30px -4px rgba(0, 0, 0, 0.05)',
    border: '1px solid #f0f0f1',
    boxSizing: 'border-box',
    overflowY: 'auto'
  },
  inspectorHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px'
  },
  inspectorTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#18181b',
    letterSpacing: '-0.02em',
    margin: 0
  },
  inspectorCloseBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'transparent',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#71717a',
    cursor: 'pointer',
    transition: 'background 0.15s ease'
  },
  inspectorDescription: {
    fontSize: '13.5px',
    lineHeight: '1.55',
    color: '#71717a',
    margin: '14px 0 28px 0',
    fontWeight: '400'
  },
  inspectorControlsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inspectorControlRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  controlLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#71717a'
  },
  segmentedToggleTrack: {
    display: 'flex',
    alignItems: 'center',
    background: '#f4f4f5',
    padding: '3px',
    borderRadius: '999px',
    gap: '2px'
  },
  segmentedOption: {
    border: 'none',
    padding: '6px 14px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#71717a',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.16s ease'
  },
  segmentedOptionActive: {
    background: '#ffffff',
    color: '#18181b',
    fontWeight: '600',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)'
  },
  iosSwitchTrack: {
    width: '48px',
    height: '28px',
    borderRadius: '999px',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
    transition: 'background-color 0.22s ease',
    boxSizing: 'border-box'
  },
  iosSwitchThumb: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: '#ffffff',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
    transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
  },
  everyPill: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    height: '42px',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #f0f0f1'
  },
  everyLabelPart: {
    width: '42%',
    height: '100%',
    background: '#d4d4d8',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '16px',
    fontSize: '13.5px',
    fontWeight: '500',
    color: '#18181b',
    boxSizing: 'border-box'
  },
  everyValuePart: {
    flex: 1,
    height: '100%',
    background: '#f4f4f5',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: '16px',
    fontSize: '13.5px',
    fontWeight: '600',
    color: '#18181b',
    cursor: 'pointer',
    boxSizing: 'border-box',
    transition: 'background 0.15s ease'
  },
  inspectorActionButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: 'auto',
    paddingTop: '36px'
  },
  inspectorShareBtn: {
    width: '100%',
    height: '44px',
    borderRadius: '999px',
    background: '#ffffff',
    border: '1.5px solid #e4e4e7',
    color: '#18181b',
    fontSize: '13.5px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    transition: 'all 0.18s ease'
  },
  inspectorBenchBtn: {
    width: '100%',
    height: '46px',
    borderRadius: '999px',
    background: '#18181b',
    border: 'none',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background 0.18s ease'
  },
  codeViewerBox: {
    width: '100%',
    maxWidth: '560px',
    background: '#090d16',
    borderRadius: '18px',
    overflow: 'hidden',
    boxShadow: '0 12px 36px rgba(0, 0, 0, 0.25)',
    border: '1px solid #1e293b'
  },
  codeViewerBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 18px',
    background: '#0f172a',
    borderBottom: '1px solid #1e293b'
  },
  codeViewerCopyBtn: {
    background: '#1e293b',
    border: 'none',
    color: '#94a3b8',
    padding: '4px 12px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  codeViewerPre: {
    margin: 0,
    padding: '16px 20px',
    color: '#38bdf8',
    fontSize: '12px',
    lineHeight: '1.6',
    fontFamily: "'Fira Code', 'Courier New', monospace",
    overflowX: 'auto',
    whiteSpace: 'pre-wrap'
  },
  floatingToast: {
    position: 'fixed',
    bottom: '32px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#18181b',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '999px',
    fontSize: '13.5px',
    fontWeight: '600',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.22)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    animation: 'toastFade 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
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
    maxWidth: '580px',
    background: '#ffffff',
    borderRadius: '28px',
    border: '1px solid #e4e4e7',
    boxShadow: '0 24px 60px -12px rgba(0, 0, 0, 0.25)',
    overflow: 'hidden'
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '24px 28px 18px 28px',
    borderBottom: '1px solid #f4f4f5'
  },
  modalHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  modalIconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: '#f4f4f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#09090b',
    margin: 0
  },
  modalSubtitle: {
    fontSize: '13px',
    color: '#71717a',
    margin: '2px 0 0 0'
  },
  closeBtn: {
    background: '#f4f4f5',
    border: 'none',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    fontSize: '14px',
    color: '#71717a',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalBody: {
    padding: '20px 28px 28px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px'
  },
  codeBlockGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  codeBlockHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  codeBlockLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#27272a'
  },
  copyBtn: {
    background: '#09090b',
    color: '#ffffff',
    border: 'none',
    padding: '5px 12px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  codePre: {
    margin: 0,
    padding: '12px 14px',
    background: '#090d16',
    color: '#38bdf8',
    borderRadius: '12px',
    fontSize: '12px',
    fontFamily: "'Fira Code', 'Courier New', monospace",
    overflowX: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all'
  }
};
