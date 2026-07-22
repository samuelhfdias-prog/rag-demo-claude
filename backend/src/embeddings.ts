import { pipeline, type FeatureExtractionPipeline } from "@xenova/transformers";

let extractorPromise: Promise<FeatureExtractionPipeline> | null = null;

function obterExtrator(): Promise<FeatureExtractionPipeline> {
  if (!extractorPromise) {
    extractorPromise = pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    ) as Promise<FeatureExtractionPipeline>;
  }
  return extractorPromise;
}

export async function gerarEmbedding(texto: string): Promise<number[]> {
  const extrator = await obterExtrator();
  const saida = await extrator(texto, { pooling: "mean", normalize: true });
  return Array.from(saida.data as Float32Array);
}

export async function gerarEmbeddingsEmLote(textos: string[]): Promise<number[][]> {
  const resultados: number[][] = [];
  for (const texto of textos) {
    resultados.push(await gerarEmbedding(texto));
  }
  return resultados;
}
