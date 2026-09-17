import React from 'react';
import Card from '../Card/Card';
import styles from './CenterArea.module.css';

const COLOR_CONFIG = {
  Red: { label: 'VERMELHO', bg: '#b01e35', text: '#ffffff' },
  Blue: { label: 'AZUL', bg: '#075ca9', text: '#ffffff' },
  Green: { label: 'VERDE', bg: '#73aa2c', text: '#ffffff' },
  Yellow: { label: 'AMARELO', bg: '#ead426', text: '#000000' },
  Wild: { label: 'CURINGA', bg: '#222222', text: '#ffffff' }
};

export default function CenterArea({ style, playedCards = [], isShaking, activeColor = 'Red', onDrawCard, isMyTurn }) {
  const colorInfo = COLOR_CONFIG[activeColor] || COLOR_CONFIG['Red'];

  return (
    <div className={styles.centerAreaContainer} style={style}>
       {/* Visual indicator of chosen active color for all players */}
       <div 
         className={styles.activeColorBadge} 
         style={{ backgroundColor: colorInfo.bg, color: colorInfo.text }}
       >
         <span className={styles.activeColorDot} />
         COR: {colorInfo.label}
       </div>

       {/* Draw Deck */}
       <div 
         className={`${isShaking ? styles.jump : ''} ${styles.drawDeck} ${isMyTurn ? styles.myTurnDeck : ''}`}
         onClick={isMyTurn ? onDrawCard : undefined}
         title={isMyTurn ? "Comprar Carta" : undefined}
       >
         <Card type="back" rotation={-20} style={{ position: 'relative', marginRight: '20px' }} shadowStyle="-2px 2px 0px 0px #aaa, -4px 4px 0px 0px #888" />
       </div>
       
       {/* Discard Pile */}
       <div 
         id="center-card-area" 
         className={`${styles.activeCardWrapper} ${isShaking ? styles.jumpDelay : ''}`} 
         style={{ position: 'relative' }}
       >
         <div style={{ opacity: 0, pointerEvents: 'none' }}>
            <Card type="front" value="7" color="transparent" />
         </div>
         {playedCards && playedCards.length > 0 ? (
           playedCards.map((card, index) => (
             <div 
               key={card.id || index} 
               style={{ 
                 position: 'absolute', 
                 left: '50%',
                 top: '50%',
                 transform: `translate(calc(-50% + ${card.offsetX || 0}px), calc(-50% + ${card.offsetY || 0}px))`,
                 zIndex: index
               }}
             >
               <Card {...card} rotation={card.rotation !== undefined ? card.rotation : 5} />
             </div>
           ))
         ) : (
           <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
             <Card type="front" value="7" color="#34c759" rotation={5} />
           </div>
         )}
       </div>
    </div>
  );
}

