export interface DocumentoResumo {
  id: string;
  titulo: string;
  criadoEm: string;
  atualizadoEm: string;
  totalChunks: number;
}

export interface Documento {
  id: string;
  titulo: string;
  conteudo: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface ChunkResumo {
  id: string;
  ordem: number;
  texto: string;
}

export interface DetalheDocumento {
  documento: Documento;
  chunks: ChunkResumo[];
}

export interface TrechoEncontrado {
  chunkId: string;
  documentoId: string;
  texto: string;
  similaridade: number;
}

export interface RespostaPergunta {
  pergunta: string;
  resposta: string;
  trechosUsados: TrechoEncontrado[];
}
