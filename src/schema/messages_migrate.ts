import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { messagesDb } from "./messagesDatabase";

const db = messagesDb;
migrate(db, { migrationsFolder: "./drizzle" });
