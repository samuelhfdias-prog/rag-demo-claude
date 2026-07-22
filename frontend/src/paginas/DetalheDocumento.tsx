import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, ErroApi } from "../api/client";
import type { DetalheDocumento as DetalheDocumentoTipo } from "../api/types";
import { Alerta } from "../componentes/Alerta";

export function DetalheDocumento() {
  const { id } = useParams<{ id: string }>();
  const navegar = useNavigate();
  const [detalhe, setDetalhe] = useState<DetalheDocumentoTipo | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .obterDocumento(id)
      .then(setDetalhe)
      .catch((e) =>
        setErro(e instanceof ErroApi ? e.message : "Falha ao carregar documento.")
      );
  }, [id]);

  async function excluir() {
    if (!id || !detalhe) return;
    const confirmou = window.confirm(
      `Excluir o documento "${detalhe.documento.titulo}"? Essa ação não pode ser desfeita.`
    );
    if (!confirmou) return;

    setExcluindo(true);
    try {
      await api.excluirDocumento(id);
      navegar("/");
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Falha ao excluir documento.");
      setExcluindo(false);
    }
  }

  if (erro && !detalhe) return <Alerta tipo="erro">{erro}</Alerta>;
  if (!detalhe) return <p>Carregando...</p>;

  return (
    <div>
      <div className="cabecalho-pagina">
        <h1>{detalhe.documento.titulo}</h1>
        <div className="cabecalho-pagina__acoes">
          <Link to={`/documentos/${id}/editar`} className="botao botao--secundario">
            Editar
          </Link>
          <button
            type="button"
            className="botao botao--perigo"
            onClick={excluir}
            disabled={excluindo}
          >
            {excluindo ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </div>

      {erro && <Alerta tipo="erro">{erro}</Alerta>}

      <section className="cartao">
        <h2>Conteúdo original</h2>
        <p className="texto-preservado">{detalhe.documento.conteudo}</p>
      </section>

      <section className="cartao">
        <h2>Chunks gerados ({detalhe.chunks.length})</h2>
        <ol className="lista-chunks">
          {detalhe.chunks.map((chunk) => (
            <li key={chunk.id}>{chunk.texto}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}
