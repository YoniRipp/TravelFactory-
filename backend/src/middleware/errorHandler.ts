import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  status?: number;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const status = err.status ?? 500;
  const message = status === 500 ? "Internal server error" : err.message;

  if (status === 500) console.error(err);

  res.status(status).json({ error: message });
};
