import React, { useState, useRef, useEffect } from 'react';

// Web Audio API tactile haptics
const playSound = (type = 'click') => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'swap') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 0.08);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.16);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.21);
    } else if (type === 'tap') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(480, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'select') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.setValueAtTime(800, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    }
  } catch (e) {}
};

// Available token assets with exact SVG icons & rates
const TOKENS = {
  BTC: {
    symbol: 'BTC',
    name: 'Bitcoin',
    priceUsd: 97700.0,
    renderIcon: () => (
      <div
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: '#F7931A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: '700',
          fontSize: '14px',
          fontFamily: 'system-ui, sans-serif'
        }}
      >
        ₿
      </div>
    )
  },
  HYPE: {
    symbol: 'HYPE',
    name: 'Hyperliquid',
    priceUsd: 38.2,
    renderIcon: () => (
      <div
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: '#0B2F28',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <circle cx="8" cy="12" r="5" fill="#4EEDB4" />
          <circle cx="16" cy="12" r="5" fill="#4EEDB4" />
          <path d="M12 9v6" stroke="#0B2F28" strokeWidth="2.5" />
        </svg>
      </div>
    )
  },
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    priceUsd: 3350.0,
    renderIcon: () => (
      <div
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: '#627EEA',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: '700',
          fontSize: '13px'
        }}
      >
        Ξ
      </div>
    )
  },
  SOL: {
    symbol: 'SOL',
    name: 'Solana',
    priceUsd: 195.0,
    renderIcon: () => (
      <div
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #9945FF, #14F195)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: '800',
          fontSize: '11px'
        }}
      >
        S
      </div>
    )
  }
};

export default function CryptoSwapMorph() {
  const [payToken, setPayToken] = useState('BTC');
  const [receiveToken, setReceiveToken] = useState('HYPE');
  const [payAmount, setPayAmount] = useState('0.05');
  const [rotation, setRotation] = useState(0);
  const [isSwapping, setIsSwapping] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'pay' | 'receive' | null

  // Calculate receive amount with ~0.3% dex fee
  const numPay = parseFloat(payAmount) || 0;
  const payPrice = TOKENS[payToken]?.priceUsd || 0;
  const recPrice = TOKENS[receiveToken]?.priceUsd || 1;

  const totalUsdPay = numPay * payPrice;
  const feeRate = 0.003;
  const totalUsdReceive = totalUsdPay * (1 - feeRate);
  const calculatedReceiveAmount = (totalUsdReceive / recPrice).toLocaleString(
    undefined,
    {
      minimumFractionDigits: 3,
      maximumFractionDigits: 4
    }
  );

  // Formatted fiat values
  const payFiatStr = `$${totalUsdPay.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

  const receiveFiatStr = `$${totalUsdReceive.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

  const handleSwap = () => {
    playSound('swap');
    setRotation((r) => r + 180);
    setIsSwapping(true);

    setTimeout(() => {
      setPayToken(receiveToken);
      setReceiveToken(payToken);
      // Recalculate equivalent pay amount to match current receive
      const newPayAmount = (
        (parseFloat(calculatedReceiveAmount.replace(/,/g, '')) || 0) * 0.997
      ).toFixed(3);
      setPayAmount(newPayAmount === '0.000' ? '1.0' : newPayAmount);
      setIsSwapping(false);
    }, 180);
  };

  const handlePayAmountChange = (e) => {
    const val = e.target.value;
    if (/^\d*\.?\d*$/.test(val)) {
      setPayAmount(val);
      playSound('tap');
    }
  };

  const selectToken = (symbol) => {
    playSound('select');
    if (activeModal === 'pay') {
      if (symbol === receiveToken) setReceiveToken(payToken);
      setPayToken(symbol);
    } else if (activeModal === 'receive') {
      if (symbol === payToken) setPayToken(receiveToken);
      setReceiveToken(symbol);
    }
    setActiveModal(null);
  };

  return (
    <div style={styles.stage}>
      {/* Outer Stack Container */}
      <div style={styles.wrapper}>
        {/* Top Card: You Pay */}
        <div
          style={{
            ...styles.card,
            transform: isSwapping ? 'translateY(12px) scale(0.98)' : 'none',
            opacity: isSwapping ? 0.7 : 1,
            transition: 'transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease'
          }}
        >
          <span style={styles.label}>You pay</span>

          <div style={styles.row}>
            <div style={styles.inputCol}>
              <input
                type="text"
                value={payAmount}
                onChange={handlePayAmountChange}
                style={styles.amountInput}
                placeholder="0.0"
              />
              <span style={styles.fiatText}>{payFiatStr}</span>
            </div>

            {/* Token Selector Pill */}
            <button
              style={styles.tokenPill}
              onClick={() => setActiveModal('pay')}
              title="Select Token"
            >
              {TOKENS[payToken]?.renderIcon()}
              <span style={styles.tokenSymbol}>{payToken}</span>
            </button>
          </div>
        </div>

        {/* Center Swap Action Button */}
        <div style={styles.swapButtonSlot}>
          <button
            style={styles.swapButton}
            onClick={handleSwap}
            title="Swap tokens"
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `rotate(${rotation}deg)`,
                transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#18181b"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <polyline points="19 12 12 19 5 12" />
              </svg>
            </div>
          </button>
        </div>

        {/* Bottom Card: You Receive */}
        <div
          style={{
            ...styles.card,
            transform: isSwapping ? 'translateY(-12px) scale(0.98)' : 'none',
            opacity: isSwapping ? 0.7 : 1,
            transition: 'transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease'
          }}
        >
          <span style={styles.label}>You receive</span>

          <div style={styles.row}>
            <div style={styles.inputCol}>
              <span style={styles.amountDisplay}>
                {calculatedReceiveAmount}
              </span>
              <span style={styles.fiatText}>{receiveFiatStr}</span>
            </div>

            {/* Token Selector Pill */}
            <button
              style={styles.tokenPill}
              onClick={() => setActiveModal('receive')}
              title="Select Token"
            >
              {TOKENS[receiveToken]?.renderIcon()}
              <span style={styles.tokenSymbol}>{receiveToken}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mini Token Selection Popover / Modal */}
      {activeModal && (
        <div
          style={styles.modalOverlay}
          onClick={() => setActiveModal(null)}
        >
          <div
            style={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>
                Select {activeModal === 'pay' ? 'Payment' : 'Receive'} Token
              </span>
              <button
                style={styles.closeBtn}
                onClick={() => setActiveModal(null)}
              >
                ✕
              </button>
            </div>

            <div style={styles.tokenList}>
              {Object.keys(TOKENS).map((sym) => {
                const item = TOKENS[sym];
                const isCurrent =
                  activeModal === 'pay'
                    ? payToken === sym
                    : receiveToken === sym;
                return (
                  <button
                    key={sym}
                    style={{
                      ...styles.tokenRowItem,
                      background: isCurrent ? '#f4f4f5' : 'transparent'
                    }}
                    onClick={() => selectToken(sym)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {item.renderIcon()}
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: '600', fontSize: '14px', color: '#18181b' }}>
                          {item.symbol}
                        </div>
                        <div style={{ fontSize: '12px', color: '#71717a' }}>
                          {item.name}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: '13px', color: '#71717a', fontWeight: '500' }}>
                      ${item.priceUsd.toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
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
    position: 'relative',
    userSelect: 'none',
    boxSizing: 'border-box',
    padding: '24px'
  },
  wrapper: {
    width: '360px',
    maxWidth: '92vw',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  },
  card: {
    width: '100%',
    background: '#ffffff',
    borderRadius: '24px',
    padding: '20px 24px',
    boxSizing: 'border-box',
    boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.04), 0 2px 6px -2px rgba(0, 0, 0, 0.02)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#9ca3af',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '48px'
  },
  inputCol: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '2px',
    flex: 1
  },
  amountInput: {
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: '28px',
    fontWeight: '600',
    color: '#18181b',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: 0,
    width: '100%',
    letterSpacing: '-0.02em'
  },
  amountDisplay: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#18181b',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    letterSpacing: '-0.02em',
    lineHeight: 1.15
  },
  fiatText: {
    fontSize: '13.5px',
    color: '#9ca3af',
    fontWeight: '400',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  tokenPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#f4f4f5',
    border: 'none',
    borderRadius: '999px',
    padding: '6px 14px 6px 8px',
    cursor: 'pointer',
    transition: 'background 0.16s ease, transform 0.12s ease',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)'
  },
  tokenSymbol: {
    fontSize: '14.5px',
    fontWeight: '600',
    color: '#18181b',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  swapButtonSlot: {
    width: '100%',
    height: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 10
  },
  swapButton: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: '#eaebee',
    border: '4px solid #f1f1f2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0,
    transition: 'transform 0.15s ease, background 0.15s ease',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.28)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  },
  modalContent: {
    width: '320px',
    background: '#ffffff',
    borderRadius: '24px',
    padding: '20px',
    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  modalTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#18181b'
  },
  closeBtn: {
    background: '#f4f4f5',
    border: 'none',
    borderRadius: '50%',
    width: '26px',
    height: '26px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#71717a',
    fontSize: '12px'
  },
  tokenList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  tokenRowItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    borderRadius: '14px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.15s ease'
  }
};
