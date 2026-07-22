export interface ChunkOptions {
  tamanho?: number;
  sobreposicao?: number;
}

export function chunkText(texto: string, options: ChunkOptions = {}): string[] {
  const tamanho = options.tamanho ?? 500;
  const sobreposicao = options.sobreposicao ?? 80;

  const textoLimpo = texto.replace(/\s+/g, " ").trim();
  const chunks: string[] = [];

  let inicio = 0;

  while (inicio < textoLimpo.length) {
    const fim = Math.min(inicio + tamanho, textoLimpo.length);
    const trecho = textoLimpo.slice(inicio, fim).trim();

    if (trecho.length > 0) {
      chunks.push(trecho);
    }

    if (fim === textoLimpo.length) break;
    inicio = fim - sobreposicao;
  }

  return chunks;
}
