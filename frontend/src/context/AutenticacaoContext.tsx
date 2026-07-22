import { createContext, useContext, useState, type ReactNode } from "react";
import { obterChaveApi, removerChaveApi, salvarChaveApi } from "../api/chaveApi";

interface AutenticacaoContextValor {
  autenticado: boolean;
  entrar: (chave: string) => void;
  sair: () => void;
}

const AutenticacaoContext = createContext<AutenticacaoContextValor | null>(null);

export function AutenticacaoProvider({ children }: { children: ReactNode }) {
  const [autenticado, setAutenticado] = useState(() => obterChaveApi() !== null);

  function entrar(chave: string) {
    salvarChaveApi(chave);
    setAutenticado(true);
  }

  function sair() {
    removerChaveApi();
    setAutenticado(false);
  }

  return (
    <AutenticacaoContext.Provider value={{ autenticado, entrar, sair }}>
      {children}
    </AutenticacaoContext.Provider>
  );
}

export function useAutenticacao(): AutenticacaoContextValor {
  const contexto = useContext(AutenticacaoContext);
  if (!contexto) {
    throw new Error("useAutenticacao precisa ser usado dentro de AutenticacaoProvider.");
  }
  return contexto;
}
