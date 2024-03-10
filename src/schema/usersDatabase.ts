import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";

const sqlite = new Database("users.db");
export const usersDatabase = drizzle(sqlite);
