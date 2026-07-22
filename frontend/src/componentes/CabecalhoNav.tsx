import { NavLink } from "react-router-dom";
import { useAutenticacao } from "../context/AutenticacaoContext";

export function CabecalhoNav() {
  const { sair } = useAutenticacao();

  return (
    <header className="cabecalho">
      <div className="cabecalho__marca">RAG Demo</div>
      <nav className="cabecalho__nav">
        <NavLink to="/" end>
          Documentos
        </NavLink>
        <NavLink to="/perguntar">Perguntar</NavLink>
      </nav>
      <button type="button" className="botao botao--fantasma" onClick={sair}>
        Sair
      </button>
    </header>
  );
}
