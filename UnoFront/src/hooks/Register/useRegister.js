import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../service/authService';

export default function useRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    age: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.name || !formData.email || !formData.password || !formData.age) {
      setError('Preencha todos os campos.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Envia os dados de cadastro para a API
      await authService.register({
        ...formData,
        age: parseInt(formData.age, 10)
      });
      navigate('/login');
    } catch (err) {
      // Trata os erros de validação ou de rede
      if (err.response?.data?.error) {
        const serverError = err.response.data.error;
        if (Array.isArray(serverError)) {
          setError(serverError.map(e => e.message).join(' | '));
        } else {
          setError(serverError);
        }
      } else {
        setError('Erro ao realizar cadastro.');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    handleChange,
    error,
    loading,
    handleSubmit
  };
}
