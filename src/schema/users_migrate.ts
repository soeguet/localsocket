import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { usersDatabase } from "./usersDatabase";

const db = usersDatabase;
migrate(db, { migrationsFolder: "./drizzle" });
