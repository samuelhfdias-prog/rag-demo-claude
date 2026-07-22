import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, ErroApi } from "../api/client";
import type { DetalheDocumento } from "../api/types";
import { Alerta } from "../componentes/Alerta";
import { FormularioDocumento } from "../componentes/FormularioDocumento";

export function EditarDocumento() {
  const { id } = useParams<{ id: string }>();
  const navegar = useNavigate();
  const [detalhe, setDetalhe] = useState<DetalheDocumento | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .obterDocumento(id)
      .then(setDetalhe)
      .catch((e) =>
        setErro(e instanceof ErroApi ? e.message : "Falha ao carregar documento.")
      );
  }, [id]);

  async function salvar(dados: { titulo: string; conteudo: string }) {
    if (!id) return;
    setErro(null);
    setEnviando(true);
    try {
      await api.atualizarDocumento(id, dados);
      navegar(`/documentos/${id}`);
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Falha ao salvar alterações.");
    } finally {
      setEnviando(false);
    }
  }

  if (erro && !detalhe) return <Alerta tipo="erro">{erro}</Alerta>;
  if (!detalhe) return <p>Carregando...</p>;

  return (
    <div>
      <h1>Editar documento</h1>
      <p className="texto-auxiliar">
        Se o conteúdo for alterado, os chunks e embeddings são recalculados
        automaticamente ao salvar.
      </p>
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      <FormularioDocumento
        tituloInicial={detalhe.documento.titulo}
        conteudoInicial={detalhe.documento.conteudo}
        enviando={enviando}
        textoBotao="Salvar alterações"
        aoSubmeter={salvar}
      />
    </div>
  );
}
