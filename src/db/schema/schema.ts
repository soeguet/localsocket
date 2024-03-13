import { bigserial, pgTable, varchar } from "drizzle-orm/pg-core";

export const usersSchema = pgTable("users", {
    id: varchar("id").notNull().primaryKey(),
    username: varchar("username").notNull(),
    clientColor: varchar("clientColor"),
    profilePhotoUrl: varchar("profilePhotoUrl"),
});

export const messageTypeSchema = pgTable("messageType", {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    messageId: varchar("messageId").notNull(),
    time: varchar("time").notNull(),
    message: varchar("message").notNull(),
});

export const quoteTypeSchema = pgTable("quoteType", {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    quoteId: varchar("quoteId"),
    quoteSenderId: varchar("quoteSenderId"),
    quoteMessage: varchar("quoteMessage"),
    quoteTime: varchar("quoteTime"),
    payloadId: bigserial("payloadId", { mode: "number" })
        .notNull()
        .references(() => messagesPayloadSchema.id),
});

export const reactionTypeSchema = pgTable("reactionType", {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    messageId: varchar("messageId").notNull(),
    emojiName: varchar("emojiName").notNull(),
    userId: varchar("userId").notNull(),
    payloadId: bigserial("payloadId", { mode: "number" })
        .notNull()
        .references(() => messagesPayloadSchema.id),
});

export const messagesPayloadSchema = pgTable("messagePayload", {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: varchar("userId"),
    messageId: bigserial("messageId", { mode: "number" })
        .notNull()
        .references(() => messageTypeSchema.id),
});

// export const messagePayloadRelations = relations(
//     messagesPayloadSchema,
//     ({ one, many }) => ({
//         quoteTypeSchema: one(quoteTypeSchema),
//         reactionTypeSchema: many(reactionTypeSchema),
//     })
// );
//
// export const usersRelations = relations(reactionTypeSchema, ({ one }) => ({
//     messagesPayloadSchema: one(messagesPayloadSchema),
// }));
//
// export const quoteRelations = relations(quoteTypeSchema, ({ one }) => ({
//     messagesPayloadSchema: one(messagesPayloadSchema),
// }));
