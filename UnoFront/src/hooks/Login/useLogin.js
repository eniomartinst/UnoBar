import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../service/authService';
import api from '../../api/api';

const fetchAndStoreCards = async () => {
  try {
    const cardsResponse = await api.get('/api/cards');
    localStorage.setItem('cards', JSON.stringify(cardsResponse.data));
  } catch (cardErr) {
    console.error('Erro ao buscar as cartas:', cardErr);
  }
};

export default function useLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Preencha todos os campos.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const data = await authService.login({ username, password });
      
      // Salva o token localmente
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        
        // Busca as 108 cartas e salva no local storage
        await fetchAndStoreCards();
      }
      
      navigate('/rooms');
    } catch (err) {
      // Trata erros vindos da API
      if (err.response?.data?.error) {
        // Extrai mensagens de erro detalhadas se houver
        const serverError = err.response.data.error;
        if (Array.isArray(serverError)) {
          setError(serverError.map(e => e.message).join(' | '));
        } else {
          setError(serverError);
        }
      } else {
        setError('Erro ao realizar login.');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    username, setUsername,
    password, setPassword,
    error,
    loading,
    handleSubmit
  };
}
