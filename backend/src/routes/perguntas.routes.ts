import { Router } from "express";
import { apiKeyAuth } from "../middlewares/apiKeyAuth";
import { limitadorDePerguntas } from "../middlewares/rateLimiters";
import { validarCorpo } from "../middlewares/validate";
import { perguntaSchema } from "../schemas/perguntaSchemas";
import { responderPergunta } from "../services/ragService";
import { asyncHandler } from "../utils/asyncHandler";

export const perguntasRouter = Router();

perguntasRouter.post(
  "/",
  apiKeyAuth,
  limitadorDePerguntas,
  validarCorpo(perguntaSchema),
  asyncHandler(async (req, res) => {
    const { pergunta, topK } = req.body as { pergunta: string; topK?: number };
    const resultado = await responderPergunta(pergunta, topK ?? 3);
    res.json(resultado);
  })
);
