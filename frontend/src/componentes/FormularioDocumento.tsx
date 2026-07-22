import { useState, type FormEvent } from "react";

const TITULO_MAXIMO = 200;
const CONTEUDO_MAXIMO = 50_000;

interface FormularioDocumentoProps {
  tituloInicial?: string;
  conteudoInicial?: string;
  enviando: boolean;
  textoBotao: string;
  aoSubmeter: (dados: { titulo: string; conteudo: string }) => void;
}

export function FormularioDocumento({
  tituloInicial = "",
  conteudoInicial = "",
  enviando,
  textoBotao,
  aoSubmeter,
}: FormularioDocumentoProps) {
  const [titulo, setTitulo] = useState(tituloInicial);
  const [conteudo, setConteudo] = useState(conteudoInicial);

  function lidarComEnvio(evento: FormEvent) {
    evento.preventDefault();
    aoSubmeter({ titulo: titulo.trim(), conteudo: conteudo.trim() });
  }

  return (
    <form className="cartao" onSubmit={lidarComEnvio}>
      <label htmlFor="titulo">Título</label>
      <input
        id="titulo"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        maxLength={TITULO_MAXIMO}
        required
      />
      <span className="texto-auxiliar texto-auxiliar--direita">
        {titulo.length}/{TITULO_MAXIMO}
      </span>

      <label htmlFor="conteudo">Conteúdo</label>
      <textarea
        id="conteudo"
        value={conteudo}
        onChange={(e) => setConteudo(e.target.value)}
        maxLength={CONTEUDO_MAXIMO}
        rows={14}
        required
      />
      <span className="texto-auxiliar texto-auxiliar--direita">
        {conteudo.length}/{CONTEUDO_MAXIMO}
      </span>

      <button type="submit" className="botao" disabled={enviando}>
        {enviando ? "Salvando..." : textoBotao}
      </button>
    </form>
  );
}
