import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export const validate =
  (schema: Joi.ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      res.status(400).json({
        error: "Validation failed",
        details: error.details.map((d) => d.message),
      });
      return;
    }
    next();
  };

export const createRequestSchema = Joi.object({
  user_id: Joi.string().uuid().required(),
  start_date: Joi.date().iso().required(),
  end_date: Joi.date().iso().min(Joi.ref("start_date")).required().messages({
    "date.min": "end_date must be on or after start_date",
  }),
  reason: Joi.string().max(500).optional().allow("", null),
});

export const updateStatusSchema = Joi.object({
  status: Joi.string().valid("Approved", "Rejected").required(),
  comments: Joi.when("status", {
    is: "Rejected",
    then: Joi.string().min(1).required().messages({
      "any.required": "A comment is required when rejecting a request",
      "string.empty": "A comment is required when rejecting a request",
    }),
    otherwise: Joi.string().optional().allow("", null),
  }),
});
