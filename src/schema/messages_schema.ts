import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

const userType = sqliteTable("user_type", {
    clientId: text("client_id").primaryKey(),
    clientUsername: text("client_username").notNull(),
    clientProfilePhoto: text("client_profile_photo").notNull(),
});

const messageType = sqliteTable("message_type", {
    messageId: text("message_id").primaryKey(),
    messageSenderId: text("message_sender_id")
        .notNull()
        .references(() => userType.clientId),
    time: text("time").notNull(),
    message: text("message").notNull(),
});

const quoteType = sqliteTable("quote_type", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    quoteId: text("quote_id").notNull().unique(),
    quoteSenderId: text("quote_sender_id")
        .notNull()
        .references(() => userType.clientId),
    quoteMessage: text("quote_message").notNull(),
    quoteTime: text("quote_time").notNull(),
});

const reactionType = sqliteTable("reaction_type", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    messageId: text("message_id")
        .notNull()
        .references(() => messageType.messageId),
    emojiName: text("emoji_name").notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => userType.clientId),
});

export const messagesPayloadSchema = sqliteTable("message_payload", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    payloadType: integer("payload_type").notNull(),
    clientId: text("client_id")
        .notNull()
        .references(() => userType.clientId),
    messageId: text("message_id")
        .notNull()
        .references(() => messageType.messageId),
    quoteId: text("quote_id").references(() => quoteType.quoteId),
    reactionId: integer("reaction_id").references(() => reactionType.id),
});
