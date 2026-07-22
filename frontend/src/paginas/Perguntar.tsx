import { useState, type FormEvent } from "react";
import { api, ErroApi } from "../api/client";
import type { RespostaPergunta } from "../api/types";
import { Alerta } from "../componentes/Alerta";

export function Perguntar() {
  const [pergunta, setPergunta] = useState("");
  const [resultado, setResultado] = useState<RespostaPergunta | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function perguntar(evento: FormEvent) {
    evento.preventDefault();
    const textoLimpo = pergunta.trim();
    if (!textoLimpo) return;

    setErro(null);
    setCarregando(true);
    setResultado(null);

    try {
      const resposta = await api.perguntar(textoLimpo);
      setResultado(resposta);
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Falha ao responder a pergunta.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div>
      <h1>Perguntar</h1>
      <p className="texto-auxiliar">
        A pergunta é comparada (por similaridade de embeddings) com os
        chunks de todos os documentos cadastrados; os trechos mais parecidos
        viram o contexto enviado ao Claude para gerar a resposta.
      </p>

      <form className="cartao" onSubmit={perguntar}>
        <label htmlFor="pergunta">Sua pergunta</label>
        <textarea
          id="pergunta"
          value={pergunta}
          onChange={(e) => setPergunta(e.target.value)}
          maxLength={1000}
          rows={3}
          required
        />
        <button type="submit" className="botao" disabled={carregando}>
          {carregando ? "Pensando..." : "Perguntar"}
        </button>
      </form>

      {erro && <Alerta tipo="erro">{erro}</Alerta>}

      {resultado && (
        <>
          <section className="cartao">
            <h2>Resposta</h2>
            <p className="texto-preservado">{resultado.resposta}</p>
          </section>

          <section className="cartao">
            <h2>Trechos usados como contexto</h2>
            <ul className="lista-trechos">
              {resultado.trechosUsados.map((trecho) => (
                <li key={trecho.chunkId}>
                  <span className="etiqueta">
                    similaridade: {trecho.similaridade.toFixed(3)}
                  </span>
                  <p className="texto-preservado">{trecho.texto}</p>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
