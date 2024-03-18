import prisma from "./db/db";
import {
    PayloadSubType,
    type MessageListPayload,
    type MessagePayload,
} from "./types/payloadTypes";

export async function sendLast100MessagesToNewClient() {
    // grab all messages
    const messageList = await prisma.messagePayload.findMany({
        take: 100,
        orderBy: {
            messagePayloadDbId: "desc",
        },
        include: {
            Client: true,
            QuoteType: true,
            ReactionType: true,
            MessageType: true,
        },
    });
    return {
        payloadType: PayloadSubType.messageList,
        messageList: messageList,
    };
}

export async function retrieveLastMessageFromDatabase() {
    const lastMessage = await prisma.messagePayload.findMany({
        take: -1,
        orderBy: {
            messagePayloadDbId: "desc",
        },
        include: {
            Client: true,
            QuoteType: true,
            ReactionType: true,
            MessageType: true,
        },
    });
    return lastMessage;
}

export async function persistMessageInDatabase(payload: MessagePayload) {
    const messagePayloadEntry = await prisma.messagePayload.create({
        data: {
            clientDbId: payload.clientType.clientId,
            messageId: payload.messageType.messageId,
        },
    });

    await prisma.messageType.create({
        data: {
            messageId: payload.messageType.messageId,
            messageContext: payload.messageType.messageConext,
            messageTime: payload.messageType.messageTime,
            messageDate: payload.messageType.messageDate,
            messagePayloadId: messagePayloadEntry.messagePayloadDbId,
        },
    });

    if (payload.quoteType !== undefined && payload.quoteType !== null) {
        await prisma.quoteType.create({
            data: {
                quoteMessageId: payload.quoteType.quoteMessageId,
                quoteClientId: payload.quoteType.quoteClientId,
                quoteMessageContext: payload.quoteType.quoteMessageContext,
                quoteTime: payload.quoteType.quoteTime,
                quoteDate: payload.quoteType.quoteDate,
                payloadId: messagePayloadEntry.messagePayloadDbId,
            },
        });
    }
}
