// EXEMPLO DE HANDLER PARA A EQUIPE SEGUIR
// Sempre crie um Handler para cada "domínio" do projeto (ex: GameHandler, ChatHandler)

export default function setupTestEvents(io, socket) {
  
  // Exemplo de Evento 1: Recebendo dados do Front-end
  socket.on('test:hello', (data) => {
    // Quem enviou a mensagem? O middleware já colocou o "socket.user" pra gente!
    const username = socket.user?.username;
    
    console.log(`[TestHandler] O usuário ${username} disse: ${data.mensagem}`);
    
    // Exemplo: Devolvendo uma resposta SÓ para a pessoa que enviou (socket.emit)
    socket.emit('test:reply', {
      status: 'Sucesso',
      texto: `Olá ${username}, o back-end recebeu sua mensagem com sucesso!`
    });
  });

  // Exemplo de Evento 2: Broadcast (Avisar todo mundo)
  socket.on('test:broadcast', (data) => {
    console.log(`[TestHandler] Broadcast solicitado por ${socket.user?.username}`);
    
    // io.emit avisa TODO MUNDO que está conectado no Socket!
    io.emit('test:broadcast_reply', {
      alerta: 'Alerta Global: ' + data.mensagem
    });
  });
}
