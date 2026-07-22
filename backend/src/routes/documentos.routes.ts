import { Router } from "express";
import { apiKeyAuth } from "../middlewares/apiKeyAuth";
import { validarCorpo, validarParametros } from "../middlewares/validate";
import {
  atualizarDocumentoSchema,
  criarDocumentoSchema,
  idParamSchema,
} from "../schemas/documentoSchemas";
import {
  atualizarDocumento,
  criarDocumento,
  excluirDocumento,
  excluirTodos,
  listarDocumentos,
  obterDocumento,
} from "../services/documentosService";
import { asyncHandler } from "../utils/asyncHandler";

export const documentosRouter = Router();

documentosRouter.use(apiKeyAuth);

documentosRouter.post(
  "/",
  validarCorpo(criarDocumentoSchema),
  asyncHandler(async (req, res) => {
    const { titulo, conteudo } = req.body as { titulo: string; conteudo: string };
    const documento = await criarDocumento(titulo, conteudo);
    res.status(201).json(documento);
  })
);

documentosRouter.get("/", (_req, res) => {
  res.json(listarDocumentos());
});

documentosRouter.get(
  "/:id",
  validarParametros(idParamSchema),
  (req, res) => {
    const resultado = obterDocumento(req.params.id);
    res.json(resultado);
  }
);

documentosRouter.put(
  "/:id",
  validarParametros(idParamSchema),
  validarCorpo(atualizarDocumentoSchema),
  asyncHandler(async (req, res) => {
    const documento = await atualizarDocumento(req.params.id, req.body);
    res.json(documento);
  })
);

documentosRouter.delete(
  "/:id",
  validarParametros(idParamSchema),
  (req, res) => {
    excluirDocumento(req.params.id);
    res.status(204).send();
  }
);

documentosRouter.delete("/", (_req, res) => {
  excluirTodos();
  res.json({ mensagem: "Todos os documentos foram removidos." });
});
