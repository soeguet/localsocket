import type { ServerWebSocket } from "bun";
import { PayloadSubType, type MessagePayload } from "./types/payloadTypes";
import { messagesDb } from "./schema/messagesDatabase";
import {
    messageType,
    messagesPayloadSchema,
    quoteType,
    reactionType,
    userType,
} from "./schema/messages_schema";
import { eq } from "drizzle-orm";

export async function sendLast100MessagesToNewClient(
    ws: ServerWebSocket<WebSocket>
) {
    const lastMessages: MessagePayload[] = await messagesDb
        .select({
            userType: {
                userId: userType.userId,
                userName: userType.userName,
                userProfilePhoto: userType.userProfilePhoto,
            },
            messageType: {
                messageId: messageType.messageId,
                message: messageType.message,
                time: messageType.time,
            },
            quoteType: {
                quoteId: quoteType.quoteId,
                quoteSenderId: quoteType.quoteSenderId,
                quoteMessage: quoteType.quoteMessage,
                quoteTime: quoteType.quoteTime,
            },
            reactionType: [
                messageId: reactionType.messageId,
                emojiName: reactionType.emojiName,
                userId: reactionType.userId,
            ],
        })
        .from(messagesPayloadSchema)
        .leftJoin(userType, eq(messagesPayloadSchema.userId, userType.userId))
        .leftJoin(
            messageType,
            eq(messagesPayloadSchema.messageId, messageType.messageId)
        )
        .leftJoin(
            quoteType,
            eq(messagesPayloadSchema.quoteId, quoteType.quoteId)
        )
        .leftJoin(
            reactionType,
            eq(messagesPayloadSchema.messageId, reactionType.messageId)
        )
        .limit(100);
    // .orderBy(desc(messagesPayloadSchema.id));
    const messageListPayload: {
        payloadType: PayloadSubType.messageList;
        messageList: MessagePayload[];
    } = {
        payloadType: PayloadSubType.messageList,
        messageList: lastMessages,
    };
    console.log("messageListPayload", messageListPayload);
    ws.send(JSON.stringify(messageListPayload));
}

export async function persistMessageInDatabase(message: string | Buffer) {
    if (typeof message !== "string") {
        console.error("Invalid message type");
        return;
    }
    const payloadFromClientAsObject: MessagePayload = JSON.parse(message);

    await messagesDb.insert(messagesPayloadSchema).values({
        userId: payloadFromClientAsObject.userType.userId,
        messageId: payloadFromClientAsObject.messageType.messageId,
        quoteId: payloadFromClientAsObject.quoteType?.quoteId,
    });

    await messagesDb.insert(userType).values({
        userId: payloadFromClientAsObject.userType.userId,
        userName: payloadFromClientAsObject.userType.userName,
        userProfilePhoto: payloadFromClientAsObject.userType.userProfilePhoto,
    });

    await messagesDb.insert(messageType).values({
        messageId: payloadFromClientAsObject.messageType.messageId,
        message: payloadFromClientAsObject.messageType.message,
        time: payloadFromClientAsObject.messageType.time,
    });

    // if no quote, skip
    // a new message cannot have a reaction yet
    if (payloadFromClientAsObject.quoteType !== undefined) {
        await messagesDb.insert(quoteType).values({
            quoteId: payloadFromClientAsObject.quoteType?.quoteId,
            quoteSenderId: payloadFromClientAsObject.quoteType?.quoteSenderId,
            quoteMessage: payloadFromClientAsObject.quoteType?.quoteMessage,
            quoteTime: payloadFromClientAsObject.quoteType?.quoteTime,
        });
    }
}
