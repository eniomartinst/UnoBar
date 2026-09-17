import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Rooms.module.css';
import { IconStar, IconSettings, IconLogOut, IconUser } from '../../components/Icons/Icons';
import useRooms from '../../hooks/Rooms/useRooms';
import backgroundImg from '../../assets/background.jpg';

const UNO_COLORS = ['#b01e35', '#ead426', '#075ca9', '#73aa2c'];

export default function Rooms() {
  const navigate = useNavigate();
  const {
    user, rooms,
    activeTab, setActiveTab,
    maxPlayers, setMaxPlayers,
    settingsOpen, setSettingsOpen,
    handleCreateRoom, handleJoinRoom
  } = useRooms();

  const settingsRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className={styles.page}>
      {/* Background Image & Overlay */}
      <div className={styles.bgWrap} aria-hidden="true">
        <img src={backgroundImg} alt="" className={styles.bgImg} />
        <div className={styles.bgOverlay} />
      </div>

      {/* Floating background cards */}
      <div className={styles.bgCards} aria-hidden="true">
        {UNO_COLORS.map((color, i) => (
          <div key={i} className={`${styles.bgCard} ${styles[`bgCard${i}`]}`} style={{ '--card-color': color }} />
        ))}
      </div>

      {/* Top Header */}
      <header className={styles.header}>
        {/* Logo left */}
        <div className={styles.headerLogo}>
          <span className={styles.logoU}>U</span>
          <span className={styles.logoN}>N</span>
          <span className={styles.logoO}>O</span>
        </div>

        <div className={styles.headerRight}>
          {/* User info & settings dropdown */}
          <div className={styles.settingsWrap} ref={settingsRef}>
            <div className={styles.userInfo} onClick={() => setSettingsOpen(o => !o)}>
              <div className={styles.userMeta}>
                <span className={styles.userName}>{user?.name}</span>
                <span className={styles.userScore}><IconStar size={11} color="#ead426" /> {user?.score.toLocaleString('pt-BR')} pts</span>
              </div>
              <div className={styles.userAvatar}><IconUser size={18} color="#888" /></div>
            </div>

            {settingsOpen && (
              <div className={styles.settingsDropdown}>
                <button className={styles.dropdownItem} onClick={() => { 
                  setSettingsOpen(false); 
                  navigate('/settings'); 
                }}>
                  <IconSettings size={14} /> Configurações
                </button>
                
                <button className={styles.dropdownItem} onClick={() => { 
                  setSettingsOpen(false); 
                  localStorage.removeItem('token'); 
                  localStorage.removeItem('currentRoomId');
                  navigate('/login'); 
                }}>
                  <IconLogOut size={14} /> Sair da conta
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className={styles.container}>
        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            id="tab-salas"
            className={`${styles.tab} ${activeTab === 'salas' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('salas')}
          >
            Salas Abertas
          </button>
          <button
            id="tab-criar"
            className={`${styles.tab} ${activeTab === 'criar' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('criar')}
          >
            Criar Sala
          </button>
        </div>

        {/* Panel */}
        <div className={styles.panel}>
          {activeTab === 'salas' && (
            <div className={styles.tabContent}>
              {/* Room list */}
              <ul className={styles.roomList}>
                {rooms.map(room => (
                  <li key={room.id} className={styles.roomItem}>
                    <div className={styles.roomInfo}>
                      <span className={styles.roomId}>#{room.id}</span>
                      <span className={`${styles.roomStatus} ${room.status === 'em jogo' ? styles.roomStatusBusy : ''}`}>
                        {room.status}
                      </span>
                    </div>
                    <div className={styles.roomSlots}>
                      {Array.from({ length: room.max }).map((_, i) => (
                        <div key={i} className={`${styles.slot} ${i < room.players ? styles.slotFull : ''}`} />
                      ))}
                    </div>
                    
                    {/* Renderiza o botão de ENTRAR apenas se o jogo NÃO estiver em andamento */}
                    {room.status !== 'em jogo' && (
                      <button
                        id={`join-room-${room.id}`}
                        className={styles.enterBtn}
                        disabled={room.players >= room.max}
                        onClick={() => handleJoinRoom(room.id)}
                      >
                        Entrar
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'criar' && (
            <div className={styles.tabContent}>
              <p className={styles.createLabel}>Número de jogadores</p>
              <div className={styles.playerOptions}>
                {[2, 3, 4].map(n => (
                  <button
                    key={n}
                    id={`players-${n}`}
                    className={`${styles.playerOpt} ${maxPlayers === n ? styles.playerOptActive : ''}`}
                    onClick={() => setMaxPlayers(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <div className={styles.createPreview}>
                <span className={styles.previewLabel}>Sua sala</span>
                <div className={styles.previewSlots}>
                  {Array.from({ length: maxPlayers }).map((_, i) => (
                    <div key={i} className={`${styles.slot} ${i === 0 ? styles.slotYou : ''}`} />
                  ))}
                </div>
                <span className={styles.previewYou}>Você</span>
              </div>

              <button id="create-room-btn" className={styles.createBtn} onClick={handleCreateRoom}>
                Criar e Entrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}