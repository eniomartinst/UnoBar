import React from 'react';
import Card from '../Card/Card';
import styles from './OpponentHand.module.css';

const getFanLayout = (count) => {
  if (count <= 0) return [];
  if (count === 1) return [{ rot: 0, left: 0, top: -5 }];
  if (count === 2) return [
    { rot: -10, left: -35, top: 2 }, 
    { rot: 10, left: 35, top: 2 }
  ];
  if (count === 3) return [
    { rot: -10, left: -50, top: 5 }, 
    { rot: 0, left: 0, top: -5 }, 
    { rot: 10, left: 50, top: 5 }
  ];
  if (count === 4) return [
    { rot: -15, left: -70, top: 10 }, 
    { rot: -5, left: -25, top: 0 }, 
    { rot: 5, left: 25, top: 0 }, 
    { rot: 15, left: 70, top: 10 }
  ];
  return [
    { rot: -15, left: -80, top: 15 }, 
    { rot: -7.5, left: -40, top: 5 }, 
    { rot: 0, left: 0, top: -2 }, 
    { rot: 7.5, left: 40, top: 5 }, 
    { rot: 15, left: 80, top: 15 }
  ];
};

export default function OpponentHand({ style = {}, containerTransform = 'none', cardCount = 7 }) {
  const displayCount = Math.min(cardCount, 5);
  const layout = getFanLayout(displayCount);

  return (
    <div className={styles.handContainer} style={{ ...style }}>
      <div className={styles.wrapper} style={{ transform: containerTransform }}>
        {layout.map((pos, index) => {
          const isLast = index === displayCount - 1;
          const hasStack = isLast && cardCount > 5;
          const baseZ = index * 3;

          return (
            <React.Fragment key={index}>
              {hasStack && (
                <>
                  <Card type="back" rotation={pos.rot} style={{ position: 'absolute', left: `calc(50% + ${pos.left + 6}px)`, top: `${pos.top + 6}px`, zIndex: baseZ }} shadowStyle="-1px 1px 0px 0px #666, -2px 2px 0px 0px #444" />
                  <Card type="back" rotation={pos.rot} style={{ position: 'absolute', left: `calc(50% + ${pos.left + 3}px)`, top: `${pos.top + 3}px`, zIndex: baseZ + 1 }} shadowStyle="-1px 1px 0px 0px #666, -2px 2px 0px 0px #444" />
                </>
              )}
              <Card type="back" rotation={pos.rot} style={{ position: 'absolute', left: `calc(50% + ${pos.left}px)`, top: `${pos.top}px`, zIndex: baseZ + 2 }} />
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
