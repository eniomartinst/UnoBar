import React from 'react';
import { Link } from 'react-router-dom';
import useLogin from '../../hooks/Login/useLogin';
import styles from './Login.module.css';

const UNO_COLORS = ['#b01e35', '#ead426', '#075ca9', '#73aa2c'];

export default function Login() {
  const {
    username, setUsername,
    password, setPassword,
    error,
    loading,
    handleSubmit
  } = useLogin();

  return (
    <div className={styles.page}>
      <div className={styles.bgCards} aria-hidden="true">
        {UNO_COLORS.map((color, i) => (
          <div key={i} className={`${styles.bgCard} ${styles[`bgCard${i}`]}`} style={{ '--card-color': color }} />
        ))}
      </div>

      <div className={styles.container}>
        <div className={styles.logoSection}>
          <div className={styles.logoBadge}>
            <span className={styles.logoU}>U</span>
            <span className={styles.logoN}>N</span>
            <span className={styles.logoO}>O</span>
          </div>
          <p className={styles.tagline}>Jogue. Grite. Vença.</p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Entrar</h2>
            <p className={styles.cardSub}>
              Bem-vindo de volta
            </p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="login-username">Usuário</label>
              <input
                id="login-username"
                className={styles.input}
                type="text"
                placeholder="Seu nome de jogador"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="login-password">Senha</label>
              <input
                id="login-password"
                className={styles.input}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button id="submit-btn" className={styles.submitBtn} type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar no jogo'}
            </button>
          </form>

          <div className={styles.divider}>
            <span>ou</span>
          </div>

          <Link to="/register" id="toggle-mode-btn" className={styles.toggleBtn} style={{display: 'block', textAlign: 'center', textDecoration: 'none'}}>
            Criar nova conta
          </Link>
        </div>
      </div>
    </div>
  );
}
