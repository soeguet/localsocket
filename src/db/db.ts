import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import { messageTypeSchema } from "./schema/schema";

const client = new Client({
    host: "127.0.0.1",
    port: 5432,
    user: "postgres",
    password: "postgres",
    database: "postgres",
});

await client.connect();
export const postgresDb = drizzle(client);

postgresDb.query.$drizzleTypeError
