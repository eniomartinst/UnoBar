import React from 'react';
import styles from './Card.module.css';

const COLOR_MAP = {
  Red: '#b01e35',
  Blue: '#075ca9',
  Green: '#73aa2c',
  Yellow: '#ead426',
  Wild: '#222'
};

const normalizeValue = (val) => {
  if (!val && val !== 0) return '7';
  const s = String(val).toLowerCase();
  if (s === 'skip' || s === 'bloqueio') return 'skip';
  if (s === 'reverse' || s === 'reverso') return 'reverse';
  if (s === 'draw2' || s === '+2') return '+2';
  if (s === 'wild' || s === 'mudar_cor') return 'wild';
  if (s === 'wilddraw4' || s === 'wild_draw4' || s === '+4') return '+4';
  return String(val);
};

const renderContent = (val, position) => {
  const norm = normalizeValue(val);
  const isCenter = position === 'center';
  const iconSize = isCenter ? '60px' : '20px';
  const dropShadow = isCenter ? 'drop-shadow(-2px 2px 0px rgba(0,0,0,0.8))' : 'drop-shadow(-1px 1px 0px rgba(0,0,0,0.8))';

  if (norm === 'skip') {
    return (
      <svg width={iconSize} height={iconSize} viewBox="0 0 100 100" fill="none" stroke="white" strokeWidth="16" style={{ filter: dropShadow, display: 'block', margin: 'auto' }}>
        <circle cx="50" cy="50" r="34" />
        <line x1="26" y1="26" x2="74" y2="74" />
      </svg>
    );
  }
  
  if (norm === 'reverse') {
    return (
      <svg width={iconSize} height={iconSize} viewBox="0 0 100 100" fill="none" stroke="white" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" style={{ filter: dropShadow, display: 'block', margin: 'auto' }}>
        <path d="M 40 25 A 25 25 0 0 1 75 50 M 75 50 L 65 40 M 75 50 L 85 40" />
        <path d="M 60 75 A 25 25 0 0 1 25 50 M 25 50 L 15 60 M 25 50 L 35 60" />
      </svg>
    );
  }

  if (norm === 'wild') {
    return (
      <svg width={iconSize} height={iconSize} viewBox="0 0 100 100" style={{ filter: dropShadow, display: 'block', margin: 'auto' }}>
        <g transform="translate(50 50) rotate(-60) scale(0.65 1) translate(-50 -50)">
          <path d="M 50 10 A 40 40 0 0 1 90 50 L 50 50 Z" fill="#b01e35" stroke="white" strokeWidth="2" />
          <path d="M 90 50 A 40 40 0 0 1 50 90 L 50 50 Z" fill="#075ca9" stroke="white" strokeWidth="2" />
          <path d="M 50 90 A 40 40 0 0 1 10 50 L 50 50 Z" fill="#73aa2c" stroke="white" strokeWidth="2" />
          <path d="M 10 50 A 40 40 0 0 1 50 10 L 50 50 Z" fill="#ead426" stroke="white" strokeWidth="2" />
        </g>
      </svg>
    );
  }

  if (norm === '+4') {
    if (!isCenter) {
      return <p>+4</p>;
    }
    return (
      <svg width={iconSize} height={iconSize} viewBox="0 0 100 100" style={{ filter: dropShadow, display: 'block', margin: 'auto' }}>
         <rect x="15" y="40" width="30" height="45" rx="5" fill="#73aa2c" stroke="white" strokeWidth="3" />
         <rect x="35" y="15" width="30" height="45" rx="5" fill="#075ca9" stroke="white" strokeWidth="3" />
         <rect x="45" y="45" width="30" height="45" rx="5" fill="#b01e35" stroke="white" strokeWidth="3" />
         <rect x="60" y="25" width="30" height="45" rx="5" fill="#ead426" stroke="white" strokeWidth="3" />
      </svg>
    );
  }

  if (norm === '+2') {
    return <p style={{ fontSize: isCenter ? '42px' : '18px', fontWeight: 900 }}>+2</p>;
  }

  return <p>{val}</p>;
};

export default function Card({ type = 'back', color = '#ff3b30', value = '7', rotation = 0, style = {}, shadowStyle }) {
  if (type === 'back') {
    return (
      <div className={styles.cardContainer} style={{ transform: `rotate(${rotation}deg)`, ...style }}>
        <div className={styles.cardBackBg} style={{ boxShadow: shadowStyle || '2px 2px 5px 0px rgba(0,0,0,0.3)' }}>
          <div className={styles.cardBackRedOval}></div>
          <div className={styles.cardBackInner}>
            <div className={styles.unoTextContainer}>
              <div className={styles.unoTextRotate}>
                <svg width="60" height="30" viewBox="0 0 100 40" style={{ overflow: 'visible' }}>
                  <defs>
                    <filter id="uno-shadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="-2" dy="2" stdDeviation="0" floodColor="#000" floodOpacity="1"/>
                    </filter>
                  </defs>
                  
                  <text x="47" y="31" fontFamily="'Arial Black', sans-serif" fontSize="36" fontWeight="900" fill="#000" stroke="#fff" strokeWidth="9" strokeLinejoin="round" textAnchor="middle" style={{ letterSpacing: '-1.5px' }}>UNO</text>
                  <text x="48" y="32" fontFamily="'Arial Black', sans-serif" fontSize="36" fontWeight="900" fill="#000" stroke="#fff" strokeWidth="0.5" strokeLinejoin="round" textAnchor="middle" style={{ letterSpacing: '-1.5px' }}>UNO</text>
                  <text x="49" y="31" fontFamily="'Arial Black', sans-serif" fontSize="36" fontWeight="900" fill="#000" stroke="#000000ff" strokeWidth="5.5" strokeLinejoin="round" textAnchor="middle" style={{ letterSpacing: '-1.5px' }}>UNO</text>
                  <text x="50" y="30" fontFamily="'Arial Black', sans-serif" fontSize="36" fontWeight="900" fill="#ffde00" stroke="#fff" strokeWidth="1" strokeLinejoin="round" textAnchor="middle" style={{ letterSpacing: '-1.5px' }}>UNO</text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const normVal = normalizeValue(value);
  const isWildCard = normVal === 'wild' || normVal === '+4' || color === 'Wild' || color === '#222';
  const resolvedColor = isWildCard ? '#222' : (COLOR_MAP[color] || color || '#b01e35');

  return (
      <div className={styles.cardContainer} style={{ transform: `rotate(${rotation}deg)`, ...style }}>
        <div className={styles.cardFrontBg} style={{ boxShadow: shadowStyle || '2px 2px 5px 0px rgba(0,0,0,0.3)' }}>
          <div className={styles.cardFrontInner} style={{ backgroundColor: resolvedColor }}>
            <div className={styles.cardFrontEllipse}>
               <div className={styles.ellipseInner}></div>
            </div>
            <div className={styles.topNumber}>{renderContent(value, 'top')}</div>
            <div className={styles.bottomNumber}>{renderContent(value, 'bottom')}</div>
            <div className={styles.centerNumber}>{renderContent(value, 'center')}</div>
          </div>
        </div>
      </div>
  );
}

