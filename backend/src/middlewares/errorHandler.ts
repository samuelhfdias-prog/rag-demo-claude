import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { env } from "../config/env";
import { AppError } from "../errors/AppError";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      erro: "Dados inválidos na requisição.",
      detalhes: err.issues.map((problema) => ({
        campo: problema.path.join("."),
        mensagem: problema.message,
      })),
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ erro: err.message });
    return;
  }

  console.error("Erro inesperado:", err);

  const detalheDev =
    env.NODE_ENV === "development" && err instanceof Error
      ? { mensagemOriginal: err.message, stack: err.stack }
      : undefined;

  res.status(500).json({
    erro: "Erro interno do servidor.",
    ...(detalheDev ? { detalheDev } : {}),
  });
}

export function rotaNaoEncontrada(req: Request, res: Response): void {
  res.status(404).json({ erro: `Rota "${req.method} ${req.path}" não existe.` });
}
