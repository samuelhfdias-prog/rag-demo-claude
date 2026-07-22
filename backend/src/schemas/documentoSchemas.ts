import { z } from "zod";

export const idParamSchema = z.object({
  id: z.string().uuid("id precisa ser um UUID válido."),
});

export const criarDocumentoSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(1, "titulo é obrigatório.")
    .max(200, "titulo pode ter no máximo 200 caracteres."),
  conteudo: z
    .string()
    .trim()
    .min(1, "conteudo é obrigatório.")
    .max(50_000, "conteudo pode ter no máximo 50.000 caracteres."),
});

export const atualizarDocumentoSchema = z
  .object({
    titulo: z
      .string()
      .trim()
      .min(1, "titulo não pode ser vazio.")
      .max(200, "titulo pode ter no máximo 200 caracteres.")
      .optional(),
    conteudo: z
      .string()
      .trim()
      .min(1, "conteudo não pode ser vazio.")
      .max(50_000, "conteudo pode ter no máximo 50.000 caracteres.")
      .optional(),
  })
  .refine((dados) => dados.titulo !== undefined || dados.conteudo !== undefined, {
    message: "Envie ao menos um campo para atualizar: titulo e/ou conteudo.",
  });
