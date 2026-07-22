import rateLimit from "express-rate-limit";

export const limitadorGeral = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: "Muitas requisições. Tente novamente em alguns minutos." },
});

export const limitadorDePerguntas = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    erro: "Muitas perguntas em pouco tempo. Aguarde um minuto antes de tentar de novo.",
  },
});
