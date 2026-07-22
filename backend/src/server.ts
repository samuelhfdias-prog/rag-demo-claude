import { env } from "./config/env";
import "./db/database";

import cors from "cors";
import express from "express";
import helmet from "helmet";
import { errorHandler, rotaNaoEncontrada } from "./middlewares/errorHandler";
import { limitadorGeral } from "./middlewares/rateLimiters";
import { documentosRouter } from "./routes/documentos.routes";
import { perguntasRouter } from "./routes/perguntas.routes";
import { totalDeDocumentos } from "./services/documentosService";

const app = express();

app.use(helmet());

app.use(cors({ origin: env.FRONTEND_URL }));

app.use(express.json({ limit: "1mb" }));
app.use(limitadorGeral);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", totalDocumentos: totalDeDocumentos() });
});

app.use("/api/documentos", documentosRouter);
app.use("/api/perguntas", perguntasRouter);

app.use(rotaNaoEncontrada);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`RAG demo rodando em http://localhost:${env.PORT}`);
  console.log(`CORS liberado apenas para: ${env.FRONTEND_URL}`);
});
