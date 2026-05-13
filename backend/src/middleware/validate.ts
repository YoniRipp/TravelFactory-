import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";

export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: "Validation failed",
        details: result.error.issues.map((e) => e.message),
      });
      return;
    }
    req.body = result.data;
    next();
  };

export const createRequestSchema = z
  .object({
    user_id: z.string().uuid(),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "start_date must be YYYY-MM-DD"),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "end_date must be YYYY-MM-DD"),
    reason: z.string().max(500).optional().nullable(),
  })
  .refine((d) => d.end_date >= d.start_date, {
    message: "end_date must be on or after start_date",
    path: ["end_date"],
  });

export const updateStatusSchema = z
  .object({
    status: z.enum(["Approved", "Rejected"]),
    comments: z.string().optional().nullable(),
  })
  .refine((d) => !(d.status === "Rejected" && !d.comments?.trim()), {
    message: "A comment is required when rejecting a request",
    path: ["comments"],
  });
