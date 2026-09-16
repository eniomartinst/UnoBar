import ScoreService from '../service/game/ScoreService.js';
import { createScoreSchema, updateScoreSchema } from '../dtos/request/ScoreRequestDTO.js';
import { formatScoreResponse, formatManyScoresResponse } from '../dtos/response/ScoreResponseDTO.js';

class ScoreController {
  async create(req, res, next) {
    try {
      const validatedData = createScoreSchema.parse(req.body);
      const score = await ScoreService.create(validatedData);
      return res.status(201).json(formatScoreResponse(score));
    } catch (error) { next(error); }
  }

  async findAll(req, res, next) {
    try {
      const scores = await ScoreService.findAll();
      return res.status(200).json(formatManyScoresResponse(scores));
    } catch (error) { next(error); }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const validatedData = updateScoreSchema.parse(req.body); 
      const updatedScore = await ScoreService.update(id, validatedData);
      return res.status(200).json(formatScoreResponse(updatedScore));
    } catch (error) { next(error); }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await ScoreService.delete(id);
      return res.status(204).send();
    } catch (error) { next(error); }
  }
}
export default new ScoreController();
