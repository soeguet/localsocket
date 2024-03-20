import prisma from "./db/db";
import {
    PayloadSubType,
    type ClientUpdatePayload,
    type MessagePayload,
} from "./types/payloadTypes";

export async function sendLast100MessagesToNewClient() {
    // grab all messages
    const messageList = await prisma.messagePayload.findMany({
        take: 100,
        orderBy: {
            messagePayloadDbId: "asc",
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

export async function updateClientProfileInformation(
    payload: ClientUpdatePayload
) {
    await prisma.client.upsert({
        where: { clientDbId: payload.clientDbId },
        update: {
            clientUsername: payload.clientUsername,
            clientProfileImage: payload.clientProfileImage,
            clientColor: payload.clientColor,
        },
        create: {
            clientDbId: payload.clientDbId,
            clientUsername: payload.clientUsername,
            clientProfileImage: payload.clientProfileImage,
            clientColor: payload.clientColor,
        },
    });
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

    const messagePayload: MessagePayload = {
        clientType: {
            clientDbId: lastMessage[0].clientDbId,
        },
        messageType: {
            messageDbId: lastMessage[0].MessageType?.messageDbId ?? "",
            messageConext: lastMessage[0].MessageType?.messageContext ?? "",
            messageTime: lastMessage[0].MessageType?.messageTime ?? "",
            messageDate: lastMessage[0].MessageType?.messageDate ?? "",
        },
        payloadType: PayloadSubType.message,
    };

    // if (lastMessage[0].QuoteType !== undefined) {
    //     messagePayload.quoteType = {
    //         quoteMessageId: lastMessage[0].QuoteType?.quoteMessageId ?? "",
    //         quoteClientId: lastMessage[0].QuoteType?.quoteClientId ?? "",
    //         quoteMessageContext: lastMessage[0].QuoteType?.quoteMessageContext?? "",
    //         quoteTime: lastMessage[0].QuoteType?.quoteTime ?? "",
    //         quoteDate: lastMessage[0].QuoteType?.quoteDate ?? "",
    //     };
    // }
    //
    // if (lastMessage[0].ReactionType !== undefined) {
    //     messagePayload.reactionType = {
    //         reactionMessageId: lastMessage[0].reactionMessageId,
    //         reactionClientId: lastMessage[0].reactionClientId,
    //         reactionContext: lastMessage[0].reactionContext,
    //     };
    // }
    return messagePayload;
}

export async function persistMessageInDatabase(payload: MessagePayload) {
    const messagePayloadEntry = await prisma.messagePayload.create({
        data: {
            
            // clientDbId: payload.clientType.clientDbId,
            // messageDbId: payload.messageType.messageDbId,
        },
    });

    await prisma.messageType.create({
        data: {
            messageDbId: payload.messageType.messageDbId,
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
