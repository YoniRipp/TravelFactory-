import "reflect-metadata";
import { AppDataSource } from "./dataSource";
import { User, UserRole } from "../entities/User";

async function seed() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(User);

  const existing = await repo.count();
  if (existing > 0) {
    console.log("Database already seeded.");
    await AppDataSource.destroy();
    return;
  }

  await repo.save([
    repo.create({ name: "Alice Martin", role: UserRole.Requester }),
    repo.create({ name: "Bob Dupont", role: UserRole.Requester }),
    repo.create({ name: "Carol Dubois", role: UserRole.Validator }),
  ]);

  console.log("Seeded 3 users (2 requesters, 1 validator).");
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
