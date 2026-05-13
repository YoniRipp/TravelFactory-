import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../database/dataSource";
import { User } from "../entities/User";

const repo = () => AppDataSource.getRepository(User);

export const findAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await repo().find({ order: { name: "ASC" } });
    res.json(users);
  } catch (err) {
    next(err);
  }
};
