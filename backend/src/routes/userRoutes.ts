import { Router } from "express";
import { findAll } from "../controllers/userController";

export const userRoutes = Router();

userRoutes.get("/", findAll);
