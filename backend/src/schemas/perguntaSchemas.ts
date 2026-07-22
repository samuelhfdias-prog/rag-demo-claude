import { z } from "zod";

export const perguntaSchema = z.object({
  pergunta: z
    .string()
    .trim()
    .min(1, "pergunta é obrigatória.")
    .max(1000, "pergunta pode ter no máximo 1000 caracteres."),
  topK: z.number().int().min(1).max(10).optional(),
});
