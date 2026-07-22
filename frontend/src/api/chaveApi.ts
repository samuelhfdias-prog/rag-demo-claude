const CHAVE_STORAGE = "rag_demo_api_key";

export function obterChaveApi(): string | null {
  return sessionStorage.getItem(CHAVE_STORAGE);
}

export function salvarChaveApi(chave: string): void {
  sessionStorage.setItem(CHAVE_STORAGE, chave);
}

export function removerChaveApi(): void {
  sessionStorage.removeItem(CHAVE_STORAGE);
}
