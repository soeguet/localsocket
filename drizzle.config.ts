import { defineConfig } from "drizzle-kit";
export default defineConfig({
    schema: "./src/db/schema/*.ts",
    driver: "pg",
    dbCredentials: {
        host: "127.0.0.1",
        port: 5432,
        user: "postgres",
        password: "postgres",
        database: "postgres",
        ssl: false,
    },
    out: "./drizzle",
    verbose: true,
    strict: true,
});
