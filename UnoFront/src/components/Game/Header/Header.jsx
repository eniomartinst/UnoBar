import React, { useState } from 'react';
import styles from './Header.module.css';

export default function Header({ score = 0, roomId = '---', onLeaveGame, onLogout, totalScores = {} }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPlacarOpen, setIsPlacarOpen] = useState(false);

  const carregarPlacar = () => {
    setIsPlacarOpen(!isPlacarOpen);
  };

  return (
    <div className={styles.headerContainer}>
      <div className={styles.leftSection}>
        <div className={styles.badge}>
          <span className={styles.scoreText}>🏆 {score}</span>
        </div>
        <div className={styles.badge}>
          <span className={styles.roomText}>Sala: #{roomId}</span>
        </div>
        <button onClick={carregarPlacar} className={styles.badge} style={{ cursor: 'pointer', color: 'white' }}>
          🏆 Ver Placar
        </button>
      </div>

      <div className={styles.rightSection}>
        <button 
          className={styles.hamburgerMenu} 
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        {menuOpen && (
          <div className={styles.dropdownMenu}>
            <button className={styles.dropdownItem} onClick={onLeaveGame}>
              🚪 Sair da Partida
            </button>
            <button className={styles.dropdownItem} onClick={onLogout}>
              🛑 Sair da Conta
            </button>
          </div>
        )}
      </div>

      {isPlacarOpen && (
        <div style={{
          position: 'absolute',
          top: '75px',
          left: '40px',
          background: 'rgba(30, 30, 30, 0.95)',
          color: '#fff',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          pointerEvents: 'auto',
          minWidth: '220px',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>🏆 Placar</h4>
            <button 
              onClick={() => setIsPlacarOpen(false)} 
              style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '14px' }}
            >
              ✕
            </button>
          </div>
          {Object.keys(totalScores).length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {Object.entries(totalScores).map(([username, pts], idx) => (
                <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <span>{username}</span>
                  <strong>{pts} pts</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ margin: 0, fontSize: '14px', color: '#ccc' }}>Nenhuma pontuação registrada.</p>
          )}
        </div>
      )}
    </div>
  );
}