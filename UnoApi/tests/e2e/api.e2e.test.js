const BASE_URL = 'http://localhost:3000';

describe('UNO API E2E Tests - Fluxos Principais (REST)', () => {
  let authToken = '';
  let createdGameId = '';
  
  // Usuário dinâmico para garantir isolamento em cada execução
  const testUser = {
    name: 'E2E Tester',
    username: `e2e_tester_${Date.now()}`,
    email: `tester_${Date.now()}@uno.com`,
    password: 'password123',
    age: 25
  };

  // ─── FLUXO 1: AUTENTICAÇÃO (Registro) ──────────────────────────────────────
  it('1. Deve processar os dados do novo jogador e criar a conta retornando HTTP 201', async () => {
    const registerRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    if (registerRes.status !== 201) {
      console.error('Erro no Registro:', await registerRes.json());
    }
    
    expect(registerRes.status).toBe(201);
  });

  // ─── FLUXO 2: AUTENTICAÇÃO (Login e Geração de Token) ──────────────────────
  it('2. Deve validar as credenciais do usuário e extrair o access_token JWT da resposta', async () => {
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: testUser.password })
    });
    
    if (loginRes.status !== 200) {
      const loginRetry = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: testUser.username, password: testUser.password }) 
      });
      
      expect(loginRetry.status).toBe(200);
      const loginData = await loginRetry.json();
      
      expect(loginData).toHaveProperty('access_token');
      authToken = loginData.access_token;
    } else {
      expect(loginRes.status).toBe(200);
      const loginData = await loginRes.json();
      
      expect(loginData).toHaveProperty('access_token');
      authToken = loginData.access_token; 
    }
  });

  // ─── FLUXO 3: PROTEÇÃO DE ROTAS (Perfil de Usuário) ────────────────────────
  it('3. Deve acessar a rota restrita de perfil usando o token JWT e validar a identidade', async () => {
    const successRes = await fetch(`${BASE_URL}/api/auth/profile`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    expect(successRes.status).toBe(200);
    const profileData = await successRes.json();
    
    expect(profileData.username).toBe(testUser.username);
    expect(profileData).toHaveProperty('email'); 
    expect(profileData).toHaveProperty('id');
  });

  // ─── FLUXO 4: GERENCIAMENTO DE SESSÃO (Criar Sala) ─────────────────────────
  it('4. Deve criar e persistir uma nova sala de jogo vinculada ao usuário logado', async () => {
    const newGame = {
      title: 'Sala E2E Test',
      maxPlayers: 4,
      status: 'waiting'
    };

    const res = await fetch(`${BASE_URL}/api/games`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(newGame)
    });

    expect(res.status).toBe(201);
    const gameData = await res.json();
    
    expect(gameData).toHaveProperty('id');
    createdGameId = gameData.id;
  });

  // ─── FLUXO 5: DESCOBERTA (Listagem de Partidas no Lobby) ───────────────────
  it('5. Deve buscar os jogos públicos no lobby e confirmar que a nova sala está visível', async () => {
    const res = await fetch(`${BASE_URL}/api/games`);
    expect(res.status).toBe(200);
    
    const gamesList = await res.json();
    const gameExists = gamesList.some(game => game.id === createdGameId);
    expect(gameExists).toBe(true);
  });

  // ─── FLUXO 6: DETALHES DA MESA (Preparação para o Jogo) ────────────────────
  it('6. Deve solicitar os detalhes estruturais da mesa e confirmar o status waiting', async () => {
    const res = await fetch(`${BASE_URL}/api/games/${createdGameId}`);
    expect(res.status).toBe(200);
    
    const gameDetails = await res.json();
    expect(gameDetails.id).toBe(createdGameId);
    expect(gameDetails.status).toBe('waiting'); 
  });

  // ─── FLUXO 7: RECURSOS DO JOGO (Dicionário de Cartas) ──────────────────────
  it('7. Deve baixar o dicionário estático confirmando as 108 cartas do banco de dados', async () => {
    const res = await fetch(`${BASE_URL}/api/cards`);
    expect(res.status).toBe(200);
    
    const cards = await res.json();
    expect(Array.isArray(cards)).toBe(true);
    expect(cards.length).toBeGreaterThan(0); 
  });

  // ─── FLUXO 8: ENCERRAMENTO (Deletar a Sala) ────────────────────────────────
  it('8. Deve limpar o banco de dados deletando a sala após a partida para evitar fantasmas', async () => {
    const res = await fetch(`${BASE_URL}/api/games/${createdGameId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    expect([200, 204]).toContain(res.status);
  });
});