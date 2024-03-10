import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

const userType = sqliteTable("user_type", {
    client_id: text("client_id").primaryKey(),
    client_username: text("client_username").notNull(),
    client_profile_photo: text("client_profile_photo").notNull(),
});

const messageType = sqliteTable("message_type", {
    message_id: text("message_id").primaryKey(),
    message_sender_id: text("message_sender_id")
        .notNull()
        .references(() => userType.client_id),
    time: text("time").notNull(),
    message: text("message").notNull(),
});

const quoteType = sqliteTable("quote_type", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    quote_id: text("quote_id").notNull().unique(),
    quote_sender_id: text("quote_sender_id")
        .notNull()
        .references(() => userType.client_id),
    quote_message: text("quote_message").notNull(),
    quote_time: text("quote_time").notNull(),
});

const reactionType = sqliteTable("reaction_type", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    message_id: text("message_id")
        .notNull()
        .references(() => messageType.message_id),
    emoji_name: text("emoji_name").notNull(),
    user_id: text("user_id")
        .notNull()
        .references(() => userType.client_id),
});

export const messagesPayloadSchema = sqliteTable("message_payload", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    payload_type: integer("payload_type").notNull(),
    client_id: text("client_id")
        .notNull()
        .references(() => userType.client_id),
    message_id: text("message_id")
        .notNull()
        .references(() => messageType.message_id),
    quote_id: text("quote_id").references(() => quoteType.quote_id),
    reaction_id: integer("reaction_id").references(() => reactionType.id),
});
