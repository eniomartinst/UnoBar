import React from 'react';
import styles from './LobbyModal.module.css';
import PlayerProfile from '../PlayerProfile/PlayerProfile';

const AVATARS = ['🐶', '🐱', '🦊', '🐼', '🦁', '🐸', '🐨'];
const AVATAR_BGS = ['#34c759', '#d8b4fe', '#312e81', '#10b981', '#f59e0b', '#ec4899'];

export default function LobbyModal({ roomId, players = [], currentUser, isCreator, onStart }) {
  const currentUsername = currentUser?.username || currentUser?.name || 'Você';
  const playerCount = players.length;
  const canStart = isCreator && playerCount >= 2;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <h2 className={styles.title}>Sala #{roomId}</h2>
        <p className={styles.subtitle}>
          {playerCount < 2 
            ? 'Aguardando jogadores (mínimo 2)...' 
            : `${playerCount} jogador${playerCount > 1 ? 'es' : ''} conectado${playerCount > 1 ? 's' : ''}`}
        </p>
        
        <div className={styles.playersList}>
          {players.map((p, idx) => {
            const isMe = p.username === currentUsername;
            return (
              <div key={p.username || idx} className={styles.playerItem}>
                <PlayerProfile 
                  name={isMe ? `${p.username} (Você)` : p.username} 
                  avatar={AVATARS[idx % AVATARS.length]} 
                  cardCount={0} 
                  avatarBg={AVATAR_BGS[idx % AVATAR_BGS.length]} 
                  avatarBorder={isMe ? '#34c759' : '#3f3f46'} 
                  layout="horizontal-right" 
                />
                <span className={styles.statusReady}>
                  {p.isCreator ? '👑 Criador' : 'Pronto'}
                </span>
              </div>
            );
          })}
        </div>

        {isCreator ? (
          <button 
            id="start-game-btn"
            className={styles.startButton} 
            onClick={onStart}
            disabled={!canStart}
            style={{ 
              opacity: canStart ? 1 : 0.6, 
              cursor: canStart ? 'pointer' : 'not-allowed',
              background: canStart ? 'linear-gradient(180deg, #ff3b30 0%, #cc1e18 100%)' : '#555'
            }}
          >
            {playerCount < 2 ? 'Aguardando 2º Jogador...' : 'Iniciar Partida'}
          </button>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '12px' }}>
            <p style={{ color: '#ead426', fontSize: '15px', fontWeight: 'bold' }}>
              ⏳ Aguardando o criador iniciar a partida...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
