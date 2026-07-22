import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ErroApi } from "../api/client";
import type { DocumentoResumo } from "../api/types";
import { Alerta } from "../componentes/Alerta";

function formatarData(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR");
}

export function ListaDocumentos() {
  const [documentos, setDocumentos] = useState<DocumentoResumo[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);

  async function carregar() {
    try {
      setErro(null);
      const lista = await api.listarDocumentos();
      setDocumentos(lista);
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Falha ao carregar documentos.");
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function excluir(id: string, titulo: string) {
    const confirmou = window.confirm(`Excluir o documento "${titulo}"? Essa ação não pode ser desfeita.`);
    if (!confirmou) return;

    setExcluindoId(id);
    try {
      await api.excluirDocumento(id);
      setDocumentos((atual) => atual?.filter((d) => d.id !== id) ?? null);
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Falha ao excluir documento.");
    } finally {
      setExcluindoId(null);
    }
  }

  return (
    <div>
      <div className="cabecalho-pagina">
        <h1>Documentos</h1>
        <Link to="/documentos/novo" className="botao">
          + Novo documento
        </Link>
      </div>

      {erro && <Alerta tipo="erro">{erro}</Alerta>}

      {documentos === null && !erro && <p>Carregando...</p>}

      {documentos?.length === 0 && (
        <p className="texto-auxiliar">
          Nenhum documento cadastrado ainda. Crie o primeiro para poder fazer
          perguntas sobre ele.
        </p>
      )}

      {documentos && documentos.length > 0 && (
        <table className="tabela">
          <thead>
            <tr>
              <th>Título</th>
              <th>Chunks</th>
              <th>Atualizado em</th>
              <th aria-label="Ações"></th>
            </tr>
          </thead>
          <tbody>
            {documentos.map((doc) => (
              <tr key={doc.id}>
                <td>
                  <Link to={`/documentos/${doc.id}`}>{doc.titulo}</Link>
                </td>
                <td>{doc.totalChunks}</td>
                <td>{formatarData(doc.atualizadoEm)}</td>
                <td className="tabela__acoes">
                  <Link to={`/documentos/${doc.id}/editar`}>Editar</Link>
                  <button
                    type="button"
                    className="botao botao--perigo botao--pequeno"
                    onClick={() => excluir(doc.id, doc.titulo)}
                    disabled={excluindoId === doc.id}
                  >
                    {excluindoId === doc.id ? "Excluindo..." : "Excluir"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
