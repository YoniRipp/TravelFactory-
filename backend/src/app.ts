import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./database/dataSource";
import { corsMiddleware } from "./middleware/cors";
import { errorHandler } from "./middleware/errorHandler";
import { userRoutes } from "./routes/userRoutes";
import { vacationRequestRoutes } from "./routes/vacationRequestRoutes";

const app = express();

app.use(corsMiddleware);
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/requests", vacationRequestRoutes);

app.use(errorHandler);

const PORT = process.env.PORT ?? 3000;

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected.");
    app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });

export { app, AppDataSource };
