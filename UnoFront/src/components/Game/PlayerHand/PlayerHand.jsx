import React, { useState } from 'react';
import Card from '../Card/Card';
import styles from './PlayerHand.module.css';

export const isCardPlayable = (card, topCard, activeColor) => {
  if (!card) return false;
  if (!topCard) return true;

  const val = String(card.value || '').toLowerCase();
  const col = String(card.color || '').toLowerCase();

  // Curingas (Wild e WildDraw4) são sempre jogáveis no seu turno
  if (col === 'wild' || val === 'wild' || val === 'wilddraw4' || val === '+4' || val === 'mudar_cor') {
    return true;
  }

  // Cor ativa na mesa
  const currentActiveColor = String(activeColor || topCard.color || '').toLowerCase();
  if (currentActiveColor && col === currentActiveColor) {
    return true;
  }

  // Mesmo valor / número / ação (ex: 5 em 5, Skip em Skip, Draw2 em Draw2)
  const topVal = String(topCard.value || '').toLowerCase();
  if (val === topVal || (val === '+2' && topVal === 'draw2') || (val === 'draw2' && topVal === '+2')) {
    return true;
  }

  return false;
};

export default function PlayerHand({ style, cards = [], topCard, activeColor, isMyTurn = true, onPlayCard }) {
  const [scrollIndex, setScrollIndex] = useState(0);

  const maxVisibleCards = 15;

  const handleWheel = (e) => {
    if (cards.length <= maxVisibleCards) return;
    
    if (e.deltaY > 0) {
      setScrollIndex((prev) => Math.min(prev + 1, cards.length - maxVisibleCards));
    } else if (e.deltaY < 0) {
      setScrollIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  return (
    <div className={styles.playerHandContainer} style={style} onWheel={handleWheel}>
      {cards.map((card, index) => {
        const visibleCount = Math.min(cards.length, maxVisibleCards);
        const midPoint = (visibleCount - 1) / 2;
        const shiftAmount = Math.max(0, (cards.length - maxVisibleCards) * 35 / 2);

        let layoutIndex;
        let targetX;

        if (index < scrollIndex) {
          layoutIndex = 0;
          const hiddenCount = scrollIndex - index;
          targetX = -hiddenCount * 2;
        } else if (index >= scrollIndex + visibleCount) {
          layoutIndex = visibleCount - 1;
          const hiddenCount = index - (scrollIndex + visibleCount - 1);
          targetX = layoutIndex * 35 + hiddenCount * 2;
        } else {
          layoutIndex = index - scrollIndex;
          targetX = layoutIndex * 35;
        }

        const physicalX = index * 35;
        const offsetX = targetX - physicalX + shiftAmount;

        const angle = (layoutIndex - midPoint) * 4;
        const yOffset = Math.abs(layoutIndex - midPoint) * 2;

        return (
          <div 
            key={card.id || index} 
            className={styles.cardWrapper} 
            onClick={(e) => onPlayCard && onPlayCard(index, e.currentTarget)}
            style={{ 

              '--card-rot': `${angle}deg`,
              '--card-y': `${yOffset}px`,
              '--card-x': `${offsetX}px`,
              zIndex: index 
            }}
          >
            <Card {...card} rotation={0} />
          </div>
        );
      })}
    </div>
  );
}
