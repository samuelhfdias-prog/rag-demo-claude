import { useState, type FormEvent } from "react";
import { api } from "../api/client";
import { Alerta } from "../componentes/Alerta";
import { useAutenticacao } from "../context/AutenticacaoContext";

export function TelaChaveApi() {
  const { entrar } = useAutenticacao();
  const [chave, setChave] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);
    setCarregando(true);

    try {
      const valida = await api.verificarChave(chave.trim());
      if (!valida) {
        setErro("Chave de API inválida.");
        return;
      }
      entrar(chave.trim());
    } catch {
      setErro("Não foi possível conectar com a API. Confira se o back-end está rodando.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="tela-chave">
      <form className="cartao cartao--estreito" onSubmit={aoEnviar}>
        <h1>Acessar o painel</h1>
        <p className="texto-auxiliar">
          Informe a chave de API configurada no back-end (variável{" "}
          <code>API_KEY</code> do arquivo <code>.env</code>). Ela fica
          guardada só nesta aba do navegador e some quando você a fechar.
        </p>

        <label htmlFor="chave-api">Chave de API</label>
        <input
          id="chave-api"
          type="password"
          autoComplete="off"
          value={chave}
          onChange={(evento) => setChave(evento.target.value)}
          required
          minLength={16}
        />

        {erro && <Alerta tipo="erro">{erro}</Alerta>}

        <button type="submit" className="botao" disabled={carregando}>
          {carregando ? "Verificando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
