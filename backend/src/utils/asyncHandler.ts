import { NextFunction, Request, Response } from "express";

type RotaAssincrona = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

export function asyncHandler(rota: RotaAssincrona) {
  return (req: Request, res: Response, next: NextFunction): void => {
    rota(req, res, next).catch(next);
  };
}
