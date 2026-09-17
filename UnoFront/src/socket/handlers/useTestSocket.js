// EXEMPLO DE HOOK PARA A EQUIPE SEGUIR
// Sempre crie um Hook para cada domínio (Ex: useGameSocket.js, useChatSocket.js)

import { useEffect, useState } from 'react';

export default function useTestSocket(socket) {
  // Estado local para guardar a última resposta recebida
  const [resposta, setResposta] = useState('');

  useEffect(() => {
    // Regra de segurança: se o socket não existir, não faz nada
    if (!socket) return;

    // 1. Criamos as funções que vão escutar os eventos
    const onReply = (data) => {
      console.log('[TestSocket] Resposta recebida:', data);
      setResposta(data.texto);
    };

    const onBroadcast = (data) => {
      console.log('[TestSocket] Alerta Global recebido:', data);
    };

    // 2. Ligamos o ouvinte no socket
    socket.on('test:reply', onReply);
    socket.on('test:broadcast_reply', onBroadcast);

    // 3. IMPORTANTÍSSIMO: Sempre limpe o ouvinte quando o componente morrer
    return () => {
      socket.off('test:reply', onReply);
      socket.off('test:broadcast_reply', onBroadcast);
    };
  }, [socket]); // Recria o useEffect caso a instância do socket mude

  // --- FUNÇÕES DISPARADORAS (EMIT) ---
  // A equipe vai usar essas funções nos botões do React (ex: onClick={enviarTeste})

  const enviarTeste = (mensagem) => {
    if (socket && socket.connected) {
      socket.emit('test:hello', { mensagem });
    }
  };

  const enviarAlertaParaTodos = (mensagem) => {
    if (socket && socket.connected) {
      socket.emit('test:broadcast', { mensagem });
    }
  };

  // 4. Exportamos tudo o que as telas do React vão precisar
  return { 
    resposta, 
    enviarTeste, 
    enviarAlertaParaTodos 
  };
}
