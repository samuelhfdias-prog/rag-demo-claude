import { Route, Routes } from "react-router-dom";
import { CabecalhoNav } from "./componentes/CabecalhoNav";
import { useAutenticacao } from "./context/AutenticacaoContext";
import { DetalheDocumento } from "./paginas/DetalheDocumento";
import { EditarDocumento } from "./paginas/EditarDocumento";
import { ListaDocumentos } from "./paginas/ListaDocumentos";
import { NovoDocumento } from "./paginas/NovoDocumento";
import { Perguntar } from "./paginas/Perguntar";
import { TelaChaveApi } from "./paginas/TelaChaveApi";

function App() {
  const { autenticado } = useAutenticacao();

  if (!autenticado) {
    return <TelaChaveApi />;
  }

  return (
    <>
      <CabecalhoNav />
      <main className="conteudo">
        <Routes>
          <Route path="/" element={<ListaDocumentos />} />
          <Route path="/documentos/novo" element={<NovoDocumento />} />
          <Route path="/documentos/:id" element={<DetalheDocumento />} />
          <Route path="/documentos/:id/editar" element={<EditarDocumento />} />
          <Route path="/perguntar" element={<Perguntar />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
