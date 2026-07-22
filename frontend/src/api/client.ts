import { obterChaveApi } from "./chaveApi";
import type {
  DetalheDocumento,
  Documento,
  DocumentoResumo,
  RespostaPergunta,
} from "./types";

const URL_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export class ErroApi extends Error {
  readonly status: number;
  readonly detalhes?: { campo: string; mensagem: string }[];

  constructor(
    message: string,
    status: number,
    detalhes?: { campo: string; mensagem: string }[]
  ) {
    super(message);
    this.name = "ErroApi";
    this.status = status;
    this.detalhes = detalhes;
  }
}

async function requisitar<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  const chave = obterChaveApi();

  const resposta = await fetch(`${URL_BASE}${caminho}`, {
    ...opcoes,
    headers: {
      "Content-Type": "application/json",
      ...(chave ? { "x-api-key": chave } : {}),
      ...opcoes.headers,
    },
  });

  if (resposta.status === 204) {
    return undefined as T;
  }

  const corpo = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    const mensagem = corpo?.erro ?? `Erro inesperado (HTTP ${resposta.status}).`;
    throw new ErroApi(mensagem, resposta.status, corpo?.detalhes);
  }

  return corpo as T;
}

export const api = {
  listarDocumentos: () => requisitar<DocumentoResumo[]>("/api/documentos"),

  obterDocumento: (id: string) =>
    requisitar<DetalheDocumento>(`/api/documentos/${id}`),

  criarDocumento: (dados: { titulo: string; conteudo: string }) =>
    requisitar<Documento>("/api/documentos", {
      method: "POST",
      body: JSON.stringify(dados),
    }),

  atualizarDocumento: (
    id: string,
    dados: { titulo?: string; conteudo?: string }
  ) =>
    requisitar<Documento>(`/api/documentos/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    }),

  excluirDocumento: (id: string) =>
    requisitar<void>(`/api/documentos/${id}`, { method: "DELETE" }),

  perguntar: (pergunta: string, topK?: number) =>
    requisitar<RespostaPergunta>("/api/perguntas", {
      method: "POST",
      body: JSON.stringify({ pergunta, topK }),
    }),

  verificarChave: async (chave: string): Promise<boolean> => {
    const resposta = await fetch(`${URL_BASE}/api/documentos`, {
      headers: { "x-api-key": chave },
    });
    if (resposta.status === 401) return false;
    if (!resposta.ok) {
      throw new ErroApi("Não foi possível validar a chave agora.", resposta.status);
    }
    return true;
  },
};
