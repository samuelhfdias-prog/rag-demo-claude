import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, ErroApi } from "../api/client";
import { Alerta } from "../componentes/Alerta";
import { FormularioDocumento } from "../componentes/FormularioDocumento";

export function NovoDocumento() {
  const navegar = useNavigate();
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function criar(dados: { titulo: string; conteudo: string }) {
    setErro(null);
    setEnviando(true);
    try {
      const documento = await api.criarDocumento(dados);
      navegar(`/documentos/${documento.id}`);
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Falha ao criar documento.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div>
      <h1>Novo documento</h1>
      <p className="texto-auxiliar">
        O conteúdo é quebrado em pedaços menores (chunks) e cada um vira um
        vetor de embedding, usado depois na busca por similaridade quando
        você fizer uma pergunta.
      </p>
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      <FormularioDocumento
        enviando={enviando}
        textoBotao="Criar documento"
        aoSubmeter={criar}
      />
    </div>
  );
}
