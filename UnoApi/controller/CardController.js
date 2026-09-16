import CardService from '../service/card/CardService.js';
import { createCardSchema, updateCardSchema } from '../dtos/request/CardRequestDTO.js';
import { formatCardResponse, formatManyCardsResponse } from '../dtos/response/CardResponseDTO.js';

class CardController {
  async create(req, res, next) {
    try {
      const validatedData = createCardSchema.parse(req.body);
      const card = await CardService.create(validatedData);
      return res.status(201).json(formatCardResponse(card));
    } catch (error) { next(error); }
  }

  async findAll(req, res, next) {
    try {
      const cards = await CardService.findAll();
      return res.status(200).json(formatManyCardsResponse(cards));
    } catch (error) { next(error); }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const validatedData = updateCardSchema.parse(req.body); 
      const updatedCard = await CardService.update(id, validatedData);
      return res.status(200).json(formatCardResponse(updatedCard));
    } catch (error) { next(error); }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await CardService.delete(id);
      return res.status(204).send();
    } catch (error) { next(error); }
  }
}
export default new CardController();
