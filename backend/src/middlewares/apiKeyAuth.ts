import { createHash, timingSafeEqual } from "node:crypto";
import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { NaoAutorizadoError } from "../errors/AppError";

function hash(valor: string): Buffer {
  return createHash("sha256").update(valor).digest();
}

const hashDaChaveEsperada = hash(env.API_KEY);

export function apiKeyAuth(req: Request, _res: Response, next: NextFunction): void {
  const chaveEnviada = req.header("x-api-key");

  if (!chaveEnviada || !timingSafeEqual(hash(chaveEnviada), hashDaChaveEsperada)) {
    throw new NaoAutorizadoError("Chave de API ausente ou inválida.");
  }

  next();
}
