import type { ServerWebSocket } from "bun";

import {
    PayloadSubType,
    type MessageListPayload,
    type MessagePayload,
    type MessagePayloadType,
} from "./types/payloadTypes";
import { desc, eq } from "drizzle-orm";
import { postgresDb } from "./db/db";
import {
    messagePayloadTypeSchema,
    messageTypeSchema,
    quoteTypeSchema,
    reactionTypeSchema,
} from "./db/schema/schema";

export async function sendLast100MessagesToNewClient(
    ws: ServerWebSocket<WebSocket>
) {
    // grab all messages
    const messages: MessagePayload[] = await postgresDb
        .select()
        .from(messagePayloadTypeSchema)
        .leftJoin(
            messageTypeSchema,
            eq(messagePayloadTypeSchema.messageId, messageTypeSchema.id)
        )
        .leftJoin(
            quoteTypeSchema,
            eq(messagePayloadTypeSchema.id, quoteTypeSchema.payloadId)
        )
        .execute();

    // grab all reactions and add them to result
    for (const message of messages) {
        const reactions = await postgresDb
            .select()
            .from(reactionTypeSchema)
            .where(
                eq(reactionTypeSchema.payloadId, message.messagePayloadType.id)
            )
            .execute();

        message.reactionType = reactions;
    }

    console.log("lastMessages", messages);

    // .orderBy(desc(messagesPayloadSchema.id));
    const messageListPayload: MessageListPayload = {
        payloadType: PayloadSubType.messageList,
        messageList: messages,
    };
    // console.log("messageListPayload", messageListPayload);
    ws.send(JSON.stringify(messageListPayload));
}

export async function retrieveLastMessageFromDatabase() {
    const lastMessage = await postgresDb
        .select()
        .from(messagePayloadTypeSchema)
        .leftJoin(
            messageTypeSchema,
            eq(messagePayloadTypeSchema.messageId, messageTypeSchema.id)
        )
        .leftJoin(
            quoteTypeSchema,
            eq(messagePayloadTypeSchema.id, quoteTypeSchema.payloadId)
        )
        .orderBy(desc(messagePayloadTypeSchema.id))
        .limit(1)
        .execute();

    if (
        lastMessage.length > 1 ||
        lastMessage === undefined ||
        lastMessage === null
    ) {
        console.error(
            "More than one message retrieved from database, expected 1, got: ",
            lastMessage.length
        );
        console.error("lastMessage", lastMessage);
        return;
    }

    return lastMessage[0];
}

export async function persistMessageInDatabase(message: string | Buffer) {
    //
    if (typeof message !== "string") {
        console.error(
            "Invalid message type, expected string, got: ",
            typeof message
        );
        return;
    }
    const payloadFromClientAsObject: MessagePayload = JSON.parse(message);

    if (
        payloadFromClientAsObject.messageType?.time === undefined ||
        payloadFromClientAsObject.messageType?.message === undefined ||
        payloadFromClientAsObject.messageType?.messageId === undefined
    ) {
        console.error(
            "Invalid message type, messageType is undefined or missing properties",
            payloadFromClientAsObject.messageType
        );
        return;
    }

    const messageId = await postgresDb
        .insert(messageTypeSchema)
        .values({
            messageId: payloadFromClientAsObject.messageType.messageId,
            message: payloadFromClientAsObject.messageType.message,
            time: payloadFromClientAsObject.messageType.time,
        })
        .returning();

    const messagePayloadFromDatabase: MessagePayloadType[] = await postgresDb
        .insert(messagePayloadTypeSchema)
        .values({
            userId: payloadFromClientAsObject.messagePayloadType.userId,
            messageId: messageId[0].id,
        })
        .returning();

    // if no quote, skip
    // a new message cannot have a reaction yet
    if (payloadFromClientAsObject.quoteType !== undefined) {
        await postgresDb.insert(quoteTypeSchema).values({
            quoteId: payloadFromClientAsObject.quoteType?.quoteId,
            quoteSenderId: payloadFromClientAsObject.quoteType?.quoteSenderId,
            quoteMessage: payloadFromClientAsObject.quoteType?.quoteMessage,
            quoteTime: payloadFromClientAsObject.quoteType?.quoteTime,
            payloadId: messagePayloadFromDatabase[0].id,
        });
    }

    return messagePayloadFromDatabase[0].id;
}
