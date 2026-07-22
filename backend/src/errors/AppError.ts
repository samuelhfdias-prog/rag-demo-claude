export class AppError extends Error {
  public readonly statusCode: number;

  constructor(mensagem: string, statusCode = 400) {
    super(mensagem);
    this.name = "AppError";
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NaoEncontradoError extends AppError {
  constructor(mensagem = "Recurso não encontrado.") {
    super(mensagem, 404);
    this.name = "NaoEncontradoError";
  }
}

export class NaoAutorizadoError extends AppError {
  constructor(mensagem = "Não autorizado.") {
    super(mensagem, 401);
    this.name = "NaoAutorizadoError";
  }
}
