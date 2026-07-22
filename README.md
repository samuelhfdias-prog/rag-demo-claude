# RAG Demo com Claude API — CRUD de documentos

Projeto de portfólio: uma aplicação full-stack com **back-end e front-end
separados** que implementa um CRUD completo de documentos em cima de um
pipeline de **RAG (Retrieval Augmented Generation)**, usando a API da
Anthropic (Claude), Node.js, Express, TypeScript, SQLite e React.

Feito para treinar e comprovar, na prática, os conceitos pedidos em vagas de
estágio de IA generativa: ingestão de documentos, chunking, geração de
embeddings, consulta a vector store, integração com a API de um LLM — além
de boas práticas de back-end (validação, autenticação, rate limiting) e de
front-end (SPA em React consumindo uma API REST).

## O que é RAG, em uma frase

Em vez de perguntar direto pro modelo (que pode "alucinar" ou não conhecer
seus dados específicos), primeiro **buscamos** os trechos mais relevantes
dos seus próprios documentos e só depois **geramos** a resposta, pedindo pro
Claude responder com base só nesses trechos.

## Estrutura do repositório

```
rag-demo-claude/
├── backend/    → API REST (Express + TypeScript + SQLite)
└── frontend/   → SPA (React + Vite + TypeScript)
```

Cada pasta tem seu próprio `package.json` e roda como um processo
independente — é assim que back-end e front-end ficam "separados": o
front-end só conversa com o back-end através de HTTP, nunca importa código
dele diretamente.

## Arquitetura do back-end

```
POST /api/documentos          → cria (chunking + embeddings automáticos)
GET  /api/documentos          → lista (resumo, sem o conteúdo completo)
GET  /api/documentos/:id      → detalhe (conteúdo completo + chunks)
PUT  /api/documentos/:id      → atualiza título e/ou conteúdo
DELETE /api/documentos/:id    → remove um documento específico
DELETE /api/documentos        → remove todos os documentos

POST /api/perguntas           → pergunta RAG (retrieval + geração com Claude)

GET  /health                  → healthcheck público (sem chave de API)
```

Pipeline de cada documento ao ser criado/editado:

```
conteúdo (texto)
      │
      ▼
  chunker.ts          → quebra o texto em pedaços menores, com sobreposição
      │
      ▼
  embeddings.ts        → gera um vetor numérico pra cada pedaço (local, gratuito)
      │
      ▼
  db/ (SQLite)          → guarda documento + chunks + embeddings em disco
```

E ao perguntar (`POST /api/perguntas`):

```
pergunta do usuário
      │
      ▼
  embeddings.ts        → gera o vetor da pergunta
      │
      ▼
  ragService.ts         → busca os chunks mais parecidos (similaridade de cosseno)
      │                   entre TODOS os documentos cadastrados
      ▼
  claude.ts              → manda pergunta + trechos relevantes pro Claude responder
```

## Segurança — o que foi implementado e por quê

| Proteção | Onde | Por quê |
|---|---|---|
| Chave de API obrigatória (`x-api-key`) | `middlewares/apiKeyAuth.ts` | O CRUD gerencia a base de conhecimento da aplicação — tratamos como área administrativa, não endpoint público. Comparação feita com hash + `timingSafeEqual` para não vazar informação por tempo de resposta. |
| Validação de toda entrada (Zod) | `schemas/`, `middlewares/validate.ts` | Nenhuma rota confia em `req.body`/`req.params` sem checar tipo, tamanho e formato antes de tocar no banco ou no LLM. |
| Limites de tamanho de payload | `criarDocumentoSchema` (50k chars), `express.json({ limit: "1mb" })` | Evita que um payload gigante trave o chunking/embeddings (negação de serviço simples). |
| Rate limiting | `middlewares/rateLimiters.ts` | Limite geral por IP (300 req/15min) e um limite mais rígido só para `/api/perguntas` (10 req/min), já que cada pergunta aciona a API paga do Claude. |
| CORS restrito | `server.ts` (`FRONTEND_URL`) | Só a origem configurada pode chamar a API a partir do navegador — sem isso, `cors()` sem argumentos liberaria qualquer site. |
| Headers de segurança | `helmet()` em `server.ts` | Content-Security-Policy básica, remoção do header `X-Powered-By`, proteção contra MIME-sniffing, etc. |
| SQL Injection | `db/documentosRepository.ts` | Toda query usa *prepared statements* com parâmetros (`?` / `@nome`) — nunca concatenação de string. |
| Erros sem vazamento de detalhes | `middlewares/errorHandler.ts` | Erros inesperados (bugs, falhas de rede) nunca expõem stack trace ou mensagem interna ao cliente; só os erros "esperados" (`AppError`) retornam mensagem amigável. |
| Variáveis de ambiente validadas na subida | `config/env.ts` (Zod) | Falha rápido: se faltar `ANTHROPIC_API_KEY` ou `API_KEY`, o servidor nem sobe — evita erro confuso no meio de uma requisição em produção. |
| Chave de API nunca embutida no build do front-end | `frontend/src/api/chaveApi.ts` | Se a chave fosse `VITE_API_KEY` embutida no bundle, ficaria visível a qualquer visitante. Em vez disso, quem usa o painel digita a chave uma vez e ela fica só em `sessionStorage` (some ao fechar a aba). |
| XSS | React (escapamento automático) | O front-end nunca usa `dangerouslySetInnerHTML` — todo conteúdo de documento/resposta é renderizado como texto, não como HTML. |

### Limitação conhecida (e honesta) da autenticação

A proteção por `API_KEY` é uma **chave compartilhada**, adequada para um
projeto de portfólio/uso pessoal (um único "dono" da base de conhecimento).
Ela não substitui um sistema de login multiusuário (com hash de senha por
usuário, sessões/JWT por conta, etc.) — se este projeto crescesse para
atender vários usuários com permissões diferentes, o próximo passo seria
trocar esse modelo por autenticação real de usuários.

## Pré-requisitos

- **Node.js 22.5 ou superior** (o back-end usa o módulo nativo `node:sqlite`,
  disponível a partir dessa versão — assim o projeto não depende de
  compilar código nativo como `better-sqlite3`, que costuma travar o
  `npm install` em máquinas Windows sem Visual Studio Build Tools instalado)
- Uma chave de API da Anthropic — crie a sua em https://console.anthropic.com

## Como rodar

Back-end e front-end rodam como dois processos separados, em dois terminais.

### 1. Back-end

```bash
cd backend
npm install
cp .env.example .env
```

Edite o `.env`:
- `ANTHROPIC_API_KEY` → sua chave da Anthropic
- `API_KEY` → gere uma chave aleatória forte:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

```bash
npm run dev
```

A API sobe em `http://localhost:3001`. O arquivo do banco SQLite é criado
automaticamente em `backend/data/rag.db` na primeira execução.

### 2. Front-end

Em outro terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

O painel sobe em `http://localhost:5173`. Na primeira vez, ele pede a
mesma chave que você colocou em `API_KEY` no `.env` do back-end.

## Como testar o back-end isoladamente (sem o front-end)

```bash
API_KEY="sua-chave-do-.env"

# criar um documento
curl -X POST http://localhost:3001/api/documentos \
  -H "Content-Type: application/json" -H "x-api-key: $API_KEY" \
  -d '{"titulo": "CuidaBem", "conteudo": "O CuidaBem é um sistema de gestão de cuidados para idosos, construído com Node.js, Express e Prisma no back-end."}'

# listar documentos
curl http://localhost:3001/api/documentos -H "x-api-key: $API_KEY"

# perguntar
curl -X POST http://localhost:3001/api/perguntas \
  -H "Content-Type: application/json" -H "x-api-key: $API_KEY" \
  -d '{"pergunta": "Com que tecnologia o back-end do CuidaBem foi construído?"}'
```

## Próximos passos (se quiser evoluir o projeto)

- Trocar o modelo de chave compartilhada por login real (usuários + JWT)
- Suportar upload de PDF/DOCX em vez de só texto colado
- Streaming da resposta do Claude no front-end
- Histórico de conversas (multi-turno) em vez de perguntas isoladas
- Testes automatizados (Vitest no back-end, Testing Library no front-end)
- Trocar o SQLite por um vector store dedicado (pgvector, Pinecone, Weaviate) se o volume de documentos crescer muito

## Como isso conecta com os requisitos da vaga

| Requisito da vaga | Onde está neste projeto |
|---|---|
| Integração com API de LLMs (Claude) | `backend/src/claude.ts` |
| Pipeline RAG: ingestão, chunking, embeddings, consulta | `backend/src/chunker.ts`, `backend/src/embeddings.ts`, `backend/src/services/ragService.ts` |
| CRUD completo com persistência | `backend/src/db/`, `backend/src/routes/documentos.routes.ts` |
| Node.js e APIs REST | `backend/src/server.ts` (Express) |
| Front-end consumindo API REST | `frontend/src/api/client.ts` e `frontend/src/paginas/` |
| Boas práticas de segurança de API | ver seção "Segurança" acima |
| TypeScript (back-end e front-end) | Projeto inteiro em TypeScript |
