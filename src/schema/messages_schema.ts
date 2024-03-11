import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const userType = sqliteTable("user_type", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id").notNull(),
    userName: text("user_name").notNull(),
    userProfilePhoto: text("user_profile_photo").notNull(),
});

export const messageType = sqliteTable("message_type", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    messageId: text("message_id").notNull(),
    time: text("time").notNull(),
    message: text("message").notNull(),
});

export const quoteType = sqliteTable("quote_type", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    quoteId: text("quote_id"),
    quoteSenderId: text("quote_sender_id")
        .references(() => userType.id),
    quoteMessage: text("quote_message"),
    quoteTime: text("quote_time"),
});

export const reactionType = sqliteTable("reaction_type", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    messageId: text("message_id")
        .notNull()
        .references(() => messagesPayloadSchema.id),
    emojiName: text("emoji_name").notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => userType.userId),
});

export const messagesPayloadSchema = sqliteTable("message_payload", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
        .notNull()
        .references(() => userType.id),
    messageId: text("message_id")
        .notNull()
        .references(() => messageType.id),
    quoteId: text("quote_id").references(() => quoteType.id),
});
