#!/usr/bin/env bash

rm -rf ./drizzle
bunx drizzle-kit generate:sqlite --schema ./src/schema/users_schema.ts
bun run ./src/schema/users_migrate.ts

rm -rf ./drizzle
bunx drizzle-kit generate:sqlite --schema ./src/schema/messages_schema.ts
bun run ./src/schema/messages_migrate.ts

rm -rf ./drizzle
