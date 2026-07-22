# Front-end — RAG Demo

SPA em React + Vite + TypeScript que consome a API do back-end (pasta
`../backend`). Documentação completa (arquitetura, segurança, como rodar
os dois projetos juntos) está no [README da raiz](../README.md).

## Comandos

```bash
npm install
cp .env.example .env
npm run dev      # http://localhost:5173
npm run build    # build de produção em dist/
npm run lint      # oxlint
```

> **Atenção:** este é um projeto **Vite + React**, não Angular. Se você tem
> o `@angular/cli` instalado globalmente, **não rode `ng build` aqui** — não
> existe `angular.json` neste projeto, e o comando falha (exit code 1) por
> não encontrar um workspace Angular. O comando de build correto é sempre
> `npm run build`.
