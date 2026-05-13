import { Router } from "express";
import { create, findAll, findByUser, updateStatus } from "../controllers/vacationRequestController";
import { validate, createRequestSchema, updateStatusSchema } from "../middleware/validate";

export const vacationRequestRoutes = Router();

// POST /api/requests — submit a new request
vacationRequestRoutes.post("/", validate(createRequestSchema), create);

// GET /api/requests — all requests (validator view), optional ?status=Pending|Approved|Rejected
// GET /api/requests?userId=<uuid> — requests by user (requester view)
vacationRequestRoutes.get("/", (req, res, next) => {
  if (req.query.userId) return findByUser(req, res, next);
  return findAll(req, res, next);
});

// PATCH /api/requests/:id/status — approve or reject
vacationRequestRoutes.patch("/:id/status", validate(updateStatusSchema), updateStatus);
