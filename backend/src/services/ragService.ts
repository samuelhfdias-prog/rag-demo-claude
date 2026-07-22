import { responderComContexto } from "../claude";
import { listarTodosChunksComEmbedding } from "../db/documentosRepository";
import { AppError } from "../errors/AppError";
import { gerarEmbedding } from "../embeddings";
import { similaridadeDeCosseno } from "../utils/similaridade";

export interface TrechoEncontrado {
  chunkId: string;
  documentoId: string;
  texto: string;
  similaridade: number;
}

export interface RespostaRag {
  pergunta: string;
  resposta: string;
  trechosUsados: TrechoEncontrado[];
}

function buscarTrechosRelevantes(
  embeddingDaPergunta: number[],
  topK: number
): TrechoEncontrado[] {
  const chunks = listarTodosChunksComEmbedding();

  return chunks
    .map((chunk) => ({
      chunkId: chunk.id,
      documentoId: chunk.documentoId,
      texto: chunk.texto,
      similaridade: similaridadeDeCosseno(embeddingDaPergunta, chunk.embedding),
    }))
    .sort((a, b) => b.similaridade - a.similaridade)
    .slice(0, topK);
}

export async function responderPergunta(
  pergunta: string,
  topK: number
): Promise<RespostaRag> {
  const chunksDisponiveis = listarTodosChunksComEmbedding();
  if (chunksDisponiveis.length === 0) {
    throw new AppError(
      "Nenhum documento foi cadastrado ainda. Crie um documento antes de perguntar.",
      400
    );
  }

  const embeddingDaPergunta = await gerarEmbedding(pergunta);
  const trechos = buscarTrechosRelevantes(embeddingDaPergunta, topK);
  const resposta = await responderComContexto(
    pergunta,
    trechos.map((t) => t.texto)
  );

  return { pergunta, resposta, trechosUsados: trechos };
}
