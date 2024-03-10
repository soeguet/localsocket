import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersSchema = sqliteTable("registered_users", {
    id: text("id").primaryKey(),
    username: text("username").notNull(),
    clientColor: text("client_color"),
    profilePhotoUrl: text("profile_photo_url"),
});
