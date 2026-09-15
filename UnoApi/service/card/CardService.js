import Card from '../../repository/Card.js';
import NotFoundException from '../../config/exceptions/NotFoundException.js';

class CardService {
  // Cria uma nova carta no banco
  async create(data) {
    return await Card.create(data);
  }

  // Retorna o dicionário completo para o front-end
  async findAll() { 
    return await Card.findAll(); 
  }

  // Atualiza os campos de uma carta existente pelo id
  async update(id, data) {
    const existingCard = await Card.findByPk(id);
    if (!existingCard) throw new NotFoundException(`Carta com ID ${id} não encontrada.`);
    await Card.update(data, { where: { id } });
    return await Card.findByPk(id);
  }

  // Remove uma carta do banco pelo id
  async delete(id) {
    const existingCard = await Card.findByPk(id);
    if (!existingCard) throw new NotFoundException(`Carta com ID ${id} não encontrada.`);
    await Card.destroy({ where: { id } });
    return true;
  }

  // Método para gerar as 108 cartas oficiais do UNO de forma automatizada
  async seedCards() {
    const count = await Card.count();
    if (count > 0) return; // Trava de segurança: se já tem cartas, não duplica

    const colors = ['Red', 'Blue', 'Green', 'Yellow'];
    const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Skip', 'Reverse', 'Draw2'];
    const deck = [];

    colors.forEach(color => {
      values.forEach(value => {
        let points = parseInt(value);
        if (isNaN(points)) points = 20; // Cartas de ação (Skip, Reverse, Draw2) valem 20
        
        deck.push({ color, value, points });
        
        // No UNO, existe apenas um "0" por cor, mas duas cópias do restante
        if (value !== '0') {
          deck.push({ color, value, points });
        }
      });
    });

    // Cartas curingas (4 cópias de cada)
    for (let i = 0; i < 4; i++) {
      deck.push({ color: 'Wild', value: 'Wild', points: 50 });
      deck.push({ color: 'Wild', value: 'WildDraw4', points: 50 });
    }

    await Card.bulkCreate(deck);
    console.log("Dicionário de 108 cartas do UNO populado com sucesso no banco!");
  }
}

export default new CardService();