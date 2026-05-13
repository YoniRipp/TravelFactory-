import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { VacationRequest } from "../entities/VacationRequest";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? "postgres",
  password: process.env.DB_PASS ?? "postgres",
  database: process.env.DB_NAME ?? "vacation_manager",
  synchronize: true,
  logging: process.env.NODE_ENV === "development",
  entities: [User, VacationRequest],
});
