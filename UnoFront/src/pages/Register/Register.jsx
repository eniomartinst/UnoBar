import React from 'react';
import { Link } from 'react-router-dom';
import useRegister from '../../hooks/Register/useRegister';
import styles from './Register.module.css';

const UNO_COLORS = ['#b01e35', '#ead426', '#075ca9', '#73aa2c'];

export default function Register() {
  const {
    formData,
    handleChange,
    error,
    loading,
    handleSubmit
  } = useRegister();

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
            <h2 className={styles.cardTitle}>Criar conta</h2>
            <p className={styles.cardSub}>
              Crie seu perfil para jogar
            </p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="reg-name">Nome completo</label>
              <input
                id="reg-name"
                name="name"
                className={styles.input}
                type="text"
                placeholder="Seu nome"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            
            <div className={styles.field}>
              <label className={styles.label} htmlFor="reg-email">E-mail</label>
              <input
                id="reg-email"
                name="email"
                className={styles.input}
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="reg-username">Usuário</label>
              <input
                id="reg-username"
                name="username"
                className={styles.input}
                type="text"
                placeholder="Nome de jogador"
                value={formData.username}
                onChange={handleChange}
                autoComplete="username"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="reg-age">Idade</label>
              <input
                id="reg-age"
                name="age"
                className={styles.input}
                type="number"
                placeholder="Ex: 25"
                value={formData.age}
                onChange={handleChange}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="reg-password">Senha</label>
              <input
                id="reg-password"
                name="password"
                className={styles.input}
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button id="submit-btn" className={styles.submitBtn} type="submit" disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <div className={styles.divider}>
            <span>ou</span>
          </div>

          <Link to="/login" id="toggle-mode-btn" className={styles.toggleBtn} style={{display: 'block', textAlign: 'center', textDecoration: 'none'}}>
            Já tenho conta
          </Link>
        </div>
      </div>
    </div>
  );
}
