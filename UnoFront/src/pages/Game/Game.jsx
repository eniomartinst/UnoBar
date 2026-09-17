import React from 'react';
import useGame from '../../hooks/Game/useGame';
import styles from './Game.module.css';
import OpponentHand from '../../components/Game/OpponentHand/OpponentHand';
import PlayerProfile from '../../components/Game/PlayerProfile/PlayerProfile';
import PlayerHand from '../../components/Game/PlayerHand/PlayerHand';
import CenterArea from '../../components/Game/CenterArea/CenterArea';
import Header from '../../components/Game/Header/Header';
import Card from '../../components/Game/Card/Card';
import LobbyModal from '../../components/Game/LobbyModal/LobbyModal';
import backgroundImg from '../../assets/background.jpg';
import tableImg from '../../assets/mesa-bar-itens svg.svg';

export default function Game() {
  const {
    currentUser,
    isLobbyMode,
    isCreator,
    lobbyPlayers,
    startGame,
    isShaking,
    animatingCard,
    gameState,
    opponents,
    playedCards,
    playerCards,
    handlePlayCard,
    handleDrawCard,
    handleUnoClick,
    handleChallenge,
    colorPickerOpen,
    handleSelectColor,
    feedbackMessage,
    handleLeaveGame,
    handleLogout,
    timeLeft, // Desestruturação do timer visual
    drawingCardAnim
  } = useGame();

  const myUsername = currentUser?.username || currentUser?.name || 'Você';
  const isMyTurn = gameState.currentTurnPlayer === myUsername;
  const topCard = playedCards[playedCards.length - 1];

  return (
    <div className={styles.htmlBody}>
      <div className={styles.gameBoard}>
        {/* Background Image */}
        <div className={styles.backgroundImageWrapper}>
          <img src={backgroundImg} alt="Background" className={styles.backgroundImage} />
        </div>

        {/* Background dark overlay */}
        <div className={styles.boardOverlay}></div>

        {/* Top Header */}
        <Header 
          score={gameState.score}
          roomId={gameState.roomId}
          onLeaveGame={handleLeaveGame}
          onLogout={handleLogout}
          totalScores={gameState.totalScores}
        />

        {/* Turn Banner (When game is running) */}
        {!isLobbyMode && gameState.currentTurnPlayer && (
          <div className={`${styles.turnBanner} ${isMyTurn ? styles.turnBannerMyTurn : ''}`}>
            {isMyTurn ? (
              <span>🎯 SUA VEZ DE JOGAR!</span>
            ) : (
              <span>⏳ Vez de {gameState.currentTurnPlayer}...</span>
            )}
          </div>
        )}

        {/* Notifications (Victory / End of Round / Challenges) */}
        {feedbackMessage && (
          <div 
            className={`${styles.feedbackToast} ${feedbackMessage.type === 'warning' ? styles.toastWarning : styles.toastError}`} 
            style={feedbackMessage.type === 'success' ? { background: 'rgba(52, 199, 89, 0.95)', border: '2px solid #34c759' } : {}}
          >
            {feedbackMessage.text}
          </div>
        )}


        {/* Bar Table Image */}
        <div className={`${styles.tableImageWrapper} ${isShaking ? styles.shake : ''}`}>
          <img src={tableImg} alt="Table" className={styles.tableImage} />
        </div>

        {/* Dynamic Opponents (supports 1v1 up to 4 players) */}
        {opponents.map(opp => {
          const isOppTurn = gameState.currentTurnPlayer === opp.name;

          if (opp.position === 'top') {
            return (
              <React.Fragment key={opp.id}>
                <div className={styles.topPlayerProfile}>
                  <PlayerProfile name={opp.name} avatar={opp.avatar} cardCount={opp.cardCount} avatarBg={opp.avatarBg} avatarBorder={isOppTurn ? '#ead426' : opp.avatarBorder} layout="horizontal-right" score={gameState.totalScores[opp.name] || 0} />
                </div>
                <OpponentHand style={{ left: '50%', top: '130px', transform: 'translateX(-50%) scale(1.3)' }} cardCount={opp.cardCount} />
              </React.Fragment>
            );
          }
          if (opp.position === 'left') {
            return (
              <React.Fragment key={opp.id}>
                <div className={styles.leftPlayerProfile}>
                  <PlayerProfile name={opp.name} avatar={opp.avatar} cardCount={opp.cardCount} avatarBg={opp.avatarBg} avatarBorder={isOppTurn ? '#ead426' : opp.avatarBorder} score={gameState.totalScores[opp.name] || 0} />
                </div>
                <OpponentHand style={{ left: '150px', top: '50%', transform: 'translateY(-50%) scale(1.3)' }} containerTransform="rotate(-90deg)" cardCount={opp.cardCount} />
              </React.Fragment>
            );
          }
          if (opp.position === 'right') {
            return (
              <React.Fragment key={opp.id}>
                <div className={styles.rightPlayerProfile}>
                  <PlayerProfile name={opp.name} avatar={opp.avatar} cardCount={opp.cardCount} avatarBg={opp.avatarBg} avatarBorder={isOppTurn ? '#ead426' : opp.avatarBorder} score={gameState.totalScores[opp.name] || 0} />
                </div>
                <OpponentHand style={{ right: '150px', top: '50%', transform: 'translateY(-50%) scale(1.3)' }} containerTransform="rotate(90deg)" cardCount={opp.cardCount} />
              </React.Fragment>
            );
          }
          return null;
        })}

        {/* Center Area (Discard / Draw Pile) */}
        <CenterArea 
          playedCards={playedCards} 
          activeColor={gameState.activeColor}
          isShaking={isShaking || !!drawingCardAnim}
          onDrawCard={handleDrawCard}
          isMyTurn={isMyTurn}
          style={{ transform: 'translate(-50%, -50%) scale(1.3)' }} 
        />



        {/* Bottom Player (You) Profile */}
        <div className={styles.bottomPlayerProfile}>
          <PlayerProfile name={`${myUsername} (Você)`} avatar="🐶" cardCount={playerCards.length} avatarBg="#34c759" avatarBorder={isMyTurn ? '#34c759' : '#3f3f46'} layout="horizontal-left" score={gameState.score} />
        </div>

        {/* Action Buttons */}
        <div className={styles.unoButton} onClick={handleUnoClick}>
          <p className={styles.unoButtonText}>UNO!</p>
        </div>

        <div className={styles.challengeButton} onClick={handleChallenge} title="Desafiar jogador que esqueceu de gritar UNO">
          <span style={{ fontSize: '24px' }}>🚨</span>
        </div>

        {/* Timer UI Element */}
        {!isLobbyMode && gameState.currentTurnPlayer && (
          <div style={{
            position: 'absolute',
            bottom: '30px',
            right: '30px',
            backgroundColor: timeLeft <= 3 ? '#ff3b30' : '#1c1c1e',
            color: '#fff',
            padding: '6px 14px',
            borderRadius: '20px',
            fontWeight: 'bold',
            fontSize: '16px',
            border: `2px solid ${timeLeft <= 3 ? '#fff' : '#444'}`,
            zIndex: 100,
            boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
            transition: 'all 0.3s ease',
            transform: timeLeft <= 3 && isMyTurn ? 'scale(1.1)' : 'scale(1)'
          }}>
            ⏱️ {timeLeft}s
          </div>
        )}

        {/* Bottom Player Hand (Highlights playable cards when it's your turn) */}
        <PlayerHand 
          cards={playerCards} 
          topCard={topCard}
          activeColor={gameState.activeColor}
          isMyTurn={isMyTurn}
          onPlayCard={handlePlayCard} 
        />

        {/* Flying Card Overlay */}
        {animatingCard && (
          <div 
            className={styles.flyingCardOverlay}
            style={{
              left: animatingCard.left,
              top: animatingCard.top,
              width: animatingCard.width,
              height: animatingCard.height,
              transform: animatingCard.flying ? `translate(${animatingCard.targetLeft - animatingCard.left}px, ${animatingCard.targetTop - animatingCard.top}px) rotate(${animatingCard.targetRotation}deg) scale(${animatingCard.targetScale})` : 'none',
              transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
          >
            <Card {...animatingCard.card} rotation={0} />
          </div>
        )}

        {/* Draw Card Flying Overlay */}
        {drawingCardAnim && (
          <div 
            className={styles.flyingCardOverlay}
            style={{
              left: drawingCardAnim.left,
              top: drawingCardAnim.top,
              width: 70,
              height: 105,
              transform: drawingCardAnim.flying ? `translate(${drawingCardAnim.targetLeft - drawingCardAnim.left}px, ${drawingCardAnim.targetTop - drawingCardAnim.top}px) scale(1.4) rotate(180deg)` : 'scale(0.8)',
              transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
            }}
          >
            <Card type="back" rotation={-20} />
          </div>
        )}

        {/* Color Picker Modal for Wild Cards */}
        {colorPickerOpen && (
          <div className={styles.colorPickerOverlay}>
            <div className={styles.colorPickerBox}>
              <h3 className={styles.colorPickerTitle}>Escolha a nova cor</h3>
              <div className={styles.colorGrid}>
                <button className={styles.colorBtn} style={{ backgroundColor: '#b01e35' }} onClick={() => handleSelectColor('Red')}>
                  Vermelho
                </button>
                <button className={styles.colorBtn} style={{ backgroundColor: '#075ca9' }} onClick={() => handleSelectColor('Blue')}>
                  Azul
                </button>
                <button className={styles.colorBtn} style={{ backgroundColor: '#73aa2c' }} onClick={() => handleSelectColor('Green')}>
                  Verde
                </button>
                <button className={styles.colorBtn} style={{ backgroundColor: '#ead426', color: '#000' }} onClick={() => handleSelectColor('Yellow')}>
                  Amarelo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lobby Overlay */}
        {isLobbyMode && (
          <LobbyModal 
            roomId={gameState.roomId}
            players={lobbyPlayers}
            currentUser={currentUser}
            isCreator={isCreator}
            onStart={startGame} 
          />
        )}
      </div>
    </div>
  );
}