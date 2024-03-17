import { bigserial, date, pgTable, varchar } from "drizzle-orm/pg-core";

// may God have mercy on my soul
export const clientEntitySchema = pgTable("client", {
    clientDbId: varchar("clientDbId").notNull().primaryKey(),
    clientUsername: varchar("clientUsername").notNull(),
    clientColor: varchar("clientColor"),
    clientProfileImage: varchar("clientProfileImage"),
});

export const messageTypeSchema = pgTable("messageType", {
    messageDbId: bigserial("messageDbId", { mode: "number" }).primaryKey(),
    messageId: varchar("messageId").notNull(),
    messageContext: varchar("messageContext").notNull(),
    messageTime: varchar("messageTime").notNull(),
    messageDate: varchar("messageDate").notNull(),
});

export const quoteTypeSchema = pgTable("quoteType", {
    quoteDbId: bigserial("quoteDbId", { mode: "number" }).primaryKey(),
    quoteMessageId: varchar("quoteMessageId"),
    quoteClientId: varchar("quoteClientId"),
    quoteMessageContext: varchar("quoteMessageContext"),
    quoteTime: varchar("quoteTime"),
    quoteDate: varchar("quoteDate"),
    payloadId: varchar("payloadId")
        .notNull()
        .references(() => messagePayloadSchema.messagePayloadDbId),
});

export const reactionTypeSchema = pgTable("reactionType", {
    reactionDbId: bigserial("reactionDbId", { mode: "number" }).primaryKey(),
    reactionMessageId: varchar("reactionMessageId").notNull(),
    reactionContext: varchar("reactionContext").notNull(),
    reactionClientId: varchar("reactionClientId").notNull(),
    payloadId: bigserial("payloadId", { mode: "number" })
        .notNull()
        .references(() => messagePayloadSchema.messagePayloadDbId),
});

export const messagePayloadSchema = pgTable("messagePayloadType", {
    messagePayloadDbId: bigserial("messagePayloadDbId", { mode: "number" }).primaryKey(),
    clientDbId: varchar("clientDbId")
        .notNull()
        .references(() => clientEntitySchema.clientDbId),
    messageDbId: bigserial("messageDbId", { mode: "number" })
        .notNull()
        .references(() => messageTypeSchema.messageDbId),
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
