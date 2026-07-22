import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { env } from "../config/env";

const caminhoAbsoluto = path.resolve(process.cwd(), env.DATABASE_PATH);
fs.mkdirSync(path.dirname(caminhoAbsoluto), { recursive: true });

export const db = new DatabaseSync(caminhoAbsoluto);

db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS documentos (
    id            TEXT PRIMARY KEY,
    titulo        TEXT NOT NULL,
    conteudo      TEXT NOT NULL,
    criado_em     TEXT NOT NULL,
    atualizado_em TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS chunks (
    id            TEXT PRIMARY KEY,
    documento_id  TEXT NOT NULL REFERENCES documentos(id) ON DELETE CASCADE,
    ordem         INTEGER NOT NULL,
    texto         TEXT NOT NULL,
    embedding     TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_chunks_documento_id ON chunks (documento_id);
`);

export function executarEmTransacao<T>(operacao: () => T): T {
  db.exec("BEGIN");
  try {
    const resultado = operacao();
    db.exec("COMMIT");
    return resultado;
  } catch (erro) {
    db.exec("ROLLBACK");
    throw erro;
  }
}
