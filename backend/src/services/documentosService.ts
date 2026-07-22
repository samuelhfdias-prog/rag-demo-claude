import { chunkText } from "../chunker";
import { gerarEmbeddingsEmLote } from "../embeddings";
import { NaoEncontradoError } from "../errors/AppError";
import {
  atualizarDocumento as atualizarDocumentoNoBanco,
  buscarChunksDoDocumento,
  buscarDocumentoPorId,
  criarDocumento as criarDocumentoNoBanco,
  contarDocumentos,
  Documento,
  DocumentoResumo,
  excluirDocumento as excluirDocumentoNoBanco,
  excluirTodosDocumentos,
  listarDocumentos as listarDocumentosNoBanco,
  ChunkParaSalvar,
} from "../db/documentosRepository";

async function gerarChunksComEmbedding(conteudo: string): Promise<ChunkParaSalvar[]> {
  const textos = chunkText(conteudo);
  const embeddings = await gerarEmbeddingsEmLote(textos);
  return textos.map((texto, i) => ({ texto, embedding: embeddings[i] }));
}

export async function criarDocumento(
  titulo: string,
  conteudo: string
): Promise<Documento> {
  const chunks = await gerarChunksComEmbedding(conteudo);
  return criarDocumentoNoBanco(titulo, conteudo, chunks);
}

export function listarDocumentos(): DocumentoResumo[] {
  return listarDocumentosNoBanco();
}

export function obterDocumento(id: string): {
  documento: Documento;
  chunks: { id: string; ordem: number; texto: string }[];
} {
  const documento = buscarDocumentoPorId(id);
  if (!documento) {
    throw new NaoEncontradoError(`Documento "${id}" não encontrado.`);
  }

  const chunks = buscarChunksDoDocumento(id).map((chunk) => ({
    id: chunk.id,
    ordem: chunk.ordem,
    texto: chunk.texto,
  }));

  return { documento, chunks };
}

export async function atualizarDocumento(
  id: string,
  dados: { titulo?: string; conteudo?: string }
): Promise<Documento> {
  const existente = buscarDocumentoPorId(id);
  if (!existente) {
    throw new NaoEncontradoError(`Documento "${id}" não encontrado.`);
  }

  const titulo = dados.titulo ?? existente.titulo;
  const conteudoMudou = dados.conteudo !== undefined && dados.conteudo !== existente.conteudo;
  const conteudo = dados.conteudo ?? existente.conteudo;

  const chunks = conteudoMudou
    ? await gerarChunksComEmbedding(conteudo)
    : buscarChunksDoDocumento(id).map((chunk) => ({
        texto: chunk.texto,
        embedding: chunk.embedding,
      }));

  const atualizado = atualizarDocumentoNoBanco(id, titulo, conteudo, chunks);
  if (!atualizado) {
    throw new NaoEncontradoError(`Documento "${id}" não encontrado.`);
  }

  return atualizado;
}

export function excluirDocumento(id: string): void {
  const removido = excluirDocumentoNoBanco(id);
  if (!removido) {
    throw new NaoEncontradoError(`Documento "${id}" não encontrado.`);
  }
}

export function excluirTodos(): void {
  excluirTodosDocumentos();
}

export function totalDeDocumentos(): number {
  return contarDocumentos();
}
