import React from 'react';
import styles from './PlayerProfile.module.css';

export default function PlayerProfile({ name, avatar, cardCount, avatarBg, avatarBorder, layout = 'vertical', score }) {
  const isHorizontalLeft = layout === 'horizontal-left';
  const isHorizontalRight = layout === 'horizontal-right';
  
  const infoContent = (
    <div className={isHorizontalLeft || isHorizontalRight ? styles.infoWrapperHorizontal : styles.infoWrapperVertical} style={isHorizontalRight ? { alignItems: 'flex-start' } : {}}>
      <div className={styles.nameWrapper}>
        <p className={styles.nameText}>{name}</p>
      </div>
      <div className={styles.cardCountWrapper} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div className={styles.cardCountBg}>
          <p className={styles.cardCountText}>{cardCount} Cartas</p>
        </div>
        {score !== undefined && (
          <div className={styles.cardCountBg} style={{ backgroundColor: '#ead426', color: '#000' }}>
            <p className={styles.cardCountText} style={{ color: '#000', fontWeight: 'bold' }}>🏆 {score}</p>
          </div>
        )}
      </div>
    </div>
  );

  const avatarContent = (
    <div 
      className={styles.avatarWrapper} 
      style={{ backgroundColor: avatarBg, borderColor: avatarBorder }}
    >
      <span className={styles.avatarEmoji}>{avatar}</span>
    </div>
  );

  if (isHorizontalLeft) {
    return (
      <div className={`${styles.profileContainer} ${styles.horizontalLeft}`}>
        {infoContent}
        {avatarContent}
      </div>
    );
  }

  if (isHorizontalRight) {
    return (
      <div className={`${styles.profileContainer} ${styles.horizontalRight}`}>
        {avatarContent}
        {infoContent}
      </div>
    );
  }

  return (
    <div className={`${styles.profileContainer} ${styles.vertical}`}>
      {avatarContent}
      {infoContent}
    </div>
  );
}
