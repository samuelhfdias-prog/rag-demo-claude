import { randomUUID } from "node:crypto";
import { db, executarEmTransacao } from "./database";

export interface ChunkParaSalvar {
  texto: string;
  embedding: number[];
}

export interface ChunkArmazenado {
  id: string;
  documentoId: string;
  ordem: number;
  texto: string;
  embedding: number[];
}

export interface Documento {
  id: string;
  titulo: string;
  conteudo: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface DocumentoResumo {
  id: string;
  titulo: string;
  criadoEm: string;
  atualizadoEm: string;
  totalChunks: number;
}

interface LinhaDocumento {
  id: string;
  titulo: string;
  conteudo: string;
  criado_em: string;
  atualizado_em: string;
}

interface LinhaChunk {
  id: string;
  documento_id: string;
  ordem: number;
  texto: string;
  embedding: string;
}

function linhaParaDocumento(linha: LinhaDocumento): Documento {
  return {
    id: linha.id,
    titulo: linha.titulo,
    conteudo: linha.conteudo,
    criadoEm: linha.criado_em,
    atualizadoEm: linha.atualizado_em,
  };
}

function linhaParaChunk(linha: LinhaChunk): ChunkArmazenado {
  return {
    id: linha.id,
    documentoId: linha.documento_id,
    ordem: linha.ordem,
    texto: linha.texto,
    embedding: JSON.parse(linha.embedding) as number[],
  };
}

const stmtInserirDocumento = db.prepare(`
  INSERT INTO documentos (id, titulo, conteudo, criado_em, atualizado_em)
  VALUES (@id, @titulo, @conteudo, @criadoEm, @atualizadoEm)
`);

const stmtInserirChunk = db.prepare(`
  INSERT INTO chunks (id, documento_id, ordem, texto, embedding)
  VALUES (@id, @documentoId, @ordem, @texto, @embedding)
`);

const stmtApagarChunksDoDocumento = db.prepare(
  `DELETE FROM chunks WHERE documento_id = ?`
);

const stmtAtualizarDocumento = db.prepare(`
  UPDATE documentos
  SET titulo = @titulo, conteudo = @conteudo, atualizado_em = @atualizadoEm
  WHERE id = @id
`);

const stmtBuscarDocumento = db.prepare(`
  SELECT id, titulo, conteudo, criado_em, atualizado_em
  FROM documentos WHERE id = ?
`);

const stmtListarDocumentosComContagem = db.prepare(`
  SELECT
    d.id AS id,
    d.titulo AS titulo,
    d.criado_em AS criado_em,
    d.atualizado_em AS atualizado_em,
    COUNT(c.id) AS total_chunks
  FROM documentos d
  LEFT JOIN chunks c ON c.documento_id = d.id
  GROUP BY d.id
  ORDER BY d.criado_em DESC
`);

const stmtApagarDocumento = db.prepare(`DELETE FROM documentos WHERE id = ?`);
const stmtApagarTodosDocumentos = db.prepare(`DELETE FROM documentos`);
const stmtContarDocumentos = db.prepare(`SELECT COUNT(*) AS total FROM documentos`);

const stmtChunksDoDocumento = db.prepare(`
  SELECT id, documento_id, ordem, texto, embedding
  FROM chunks WHERE documento_id = ? ORDER BY ordem ASC
`);

const stmtTodosChunks = db.prepare(`
  SELECT id, documento_id, ordem, texto, embedding FROM chunks
`);

function inserirChunks(documentoId: string, chunks: ChunkParaSalvar[]): void {
  chunks.forEach((chunk, ordem) => {
    stmtInserirChunk.run({
      id: randomUUID(),
      documentoId,
      ordem,
      texto: chunk.texto,
      embedding: JSON.stringify(chunk.embedding),
    });
  });
}

export function criarDocumento(
  titulo: string,
  conteudo: string,
  chunks: ChunkParaSalvar[]
): Documento {
  return executarEmTransacao(() => {
    const agora = new Date().toISOString();
    const documento: LinhaDocumento = {
      id: randomUUID(),
      titulo,
      conteudo,
      criado_em: agora,
      atualizado_em: agora,
    };

    stmtInserirDocumento.run({
      id: documento.id,
      titulo: documento.titulo,
      conteudo: documento.conteudo,
      criadoEm: documento.criado_em,
      atualizadoEm: documento.atualizado_em,
    });

    inserirChunks(documento.id, chunks);

    return linhaParaDocumento(documento);
  });
}

export function listarDocumentos(): DocumentoResumo[] {
  const linhas = stmtListarDocumentosComContagem.all() as unknown as Array<
    LinhaDocumento & { total_chunks: number }
  >;

  return linhas.map((linha) => ({
    id: linha.id,
    titulo: linha.titulo,
    criadoEm: linha.criado_em,
    atualizadoEm: linha.atualizado_em,
    totalChunks: linha.total_chunks,
  }));
}

export function buscarDocumentoPorId(id: string): Documento | null {
  const linha = stmtBuscarDocumento.get(id) as unknown as LinhaDocumento | undefined;
  return linha ? linhaParaDocumento(linha) : null;
}

export function buscarChunksDoDocumento(documentoId: string): ChunkArmazenado[] {
  const linhas = stmtChunksDoDocumento.all(documentoId) as unknown as LinhaChunk[];
  return linhas.map(linhaParaChunk);
}

export function atualizarDocumento(
  id: string,
  titulo: string,
  conteudo: string,
  novosChunks: ChunkParaSalvar[]
): Documento | null {
  return executarEmTransacao(() => {
    const existente = stmtBuscarDocumento.get(id) as unknown as
      | LinhaDocumento
      | undefined;
    if (!existente) return null;

    const atualizadoEm = new Date().toISOString();

    stmtAtualizarDocumento.run({ id, titulo, conteudo, atualizadoEm });
    stmtApagarChunksDoDocumento.run(id);
    inserirChunks(id, novosChunks);

    return linhaParaDocumento({
      ...existente,
      titulo,
      conteudo,
      atualizado_em: atualizadoEm,
    });
  });
}

export function excluirDocumento(id: string): boolean {
  const resultado = stmtApagarDocumento.run(id);
  return resultado.changes > 0;
}

export function excluirTodosDocumentos(): void {
  stmtApagarTodosDocumentos.run();
}

export function contarDocumentos(): number {
  const linha = stmtContarDocumentos.get() as unknown as { total: number };
  return linha.total;
}

export function listarTodosChunksComEmbedding(): ChunkArmazenado[] {
  const linhas = stmtTodosChunks.all() as unknown as LinhaChunk[];
  return linhas.map(linhaParaChunk);
}
