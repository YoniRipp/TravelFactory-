import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../database/dataSource";
import { VacationRequest, RequestStatus } from "../entities/VacationRequest";

const repo = () => AppDataSource.getRepository(VacationRequest);

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { user_id, start_date, end_date, reason } = req.body;
    const request = repo().create({ user_id, start_date, end_date, reason: reason ?? null });
    const saved = await repo().save(request);
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
};

export const findByUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.query;
    const requests = await repo().find({
      where: { user_id: userId as string },
      order: { created_at: "DESC" },
    });
    res.json(requests);
  } catch (err) {
    next(err);
  }
};

export const findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.query;
    const where = status ? { status: status as RequestStatus } : {};
    const requests = await repo().find({
      where,
      relations: ["user"],
      order: { created_at: "DESC" },
    });
    res.json(requests);
  } catch (err) {
    next(err);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, comments } = req.body;

    const request = await repo().findOne({ where: { id } });
    if (!request) {
      res.status(404).json({ error: "Request not found" });
      return;
    }

    if (request.status !== RequestStatus.Pending) {
      res.status(409).json({ error: "Only pending requests can be updated" });
      return;
    }

    request.status = status;
    request.comments = comments ?? null;
    const updated = await repo().save(request);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
