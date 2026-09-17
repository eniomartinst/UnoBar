import { createContext, useEffect, useState } from 'react';
import { socket } from '../socket/socket';
import useTestSocket from '../socket/handlers/useTestSocket';

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  // Inicializamos nosso hook de Teste/Exemplo
  const { resposta, enviarTeste, enviarAlertaParaTodos } = useTestSocket(socket);

  useEffect(() => {
    const token = localStorage.getItem('token');

    // Só tenta conectar se tiver token
    if (token && !socket.connected) {
      socket.auth = { token };
      socket.connect();
    }

    const onConnect = () => {
      setIsConnected(true);
      console.log('Socket conectado com ID:', socket.id);
      
      // APENAS PARA TESTE: Dispara um evento para o backend logo após conectar
      setTimeout(() => {
        console.log('Enviando mensagem de teste...');
        enviarTeste('Estou testando o boilerplate!');
      }, 1000);
    };

    const onDisconnect = () => {
      setIsConnected(false);
      console.log('Socket desconectado');
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [enviarTeste]);

  return (
    <GameContext.Provider value={{ isConnected, resposta, enviarTeste, enviarAlertaParaTodos, socket }}>
      {children}
    </GameContext.Provider>
  );
};
