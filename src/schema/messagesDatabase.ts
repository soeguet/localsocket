import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";

const sqlite = new Database("messages.db");
export const messagesDb = drizzle(sqlite);
