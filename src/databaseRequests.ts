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
        select: {
            messageType: true,
            quoteType: true,
            reactionType: true,
            clientType: {
                select: {
                    clientDbId: true,
                },
            },
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
    const lastMessage = await prisma.messagePayload.findFirst({
        take: -1,
        orderBy: {
            messagePayloadDbId: "asc",
        },
        select: {
            messageType: true,
            quoteType: true,
            reactionType: true,
            clientType: {
                select: {
                    clientDbId: true,
                },
            },
        },
    });

    return lastMessage;
}

export async function persistMessageInDatabase(payload: MessagePayload) {
    const dataObject = {
        clientType: {
            connect: {
                clientDbId: payload.clientType.clientDbId,
            },
        },
        messagePayloadDbId: payload.messageType.messageDbId,
        messageType: {
            create: {
                messageDate: payload.messageType.messageDate,
                messageTime: payload.messageType.messageTime,
                messageContext: payload.messageType.messageContext,
            },
        },
    };

    if (payload.quoteType !== undefined && payload.quoteType !== null) {
        const quotedObject = {
            ...dataObject,
            quoteType: {
                create: {
                    quoteDate: payload.quoteType.quoteDate,
                    quoteTime: payload.quoteType.quoteTime,
                    quoteMessageContext: payload.quoteType.quoteMessageContext,
                    quoteClientId: payload.quoteType.quoteClientId,
                },
            },
        };
        await prisma.messagePayload.create({
            data: quotedObject,
        });
        //
    } else {
        await prisma.messagePayload.create({
            data: dataObject,
        });
    }
}

// const messagePayloadEntry = await prisma.messagePayload.create({
//     data: {
//
//         // clientDbId: payload.clientType.clientDbId,
//         // messageDbId: payload.messageType.messageDbId,
//     },
// });
//
// await prisma.messageType.create({
//     data: {
//         messageDbId: payload.messageType.messageDbId,
//         messageContext: payload.messageType.messageContext,
//         messageTime: payload.messageType.messageTime,
//         messageDate: payload.messageType.messageDate,
//         messagePayloadId: messagePayloadEntry.messagePayloadDbId,
//     },
// });
//
// if (payload.quoteType !== undefined && payload.quoteType !== null) {
//     await prisma.quoteType.create({
//         data: {
//             quoteMessageId: payload.quoteType.quoteMessageId,
//             quoteClientId: payload.quoteType.quoteClientId,
//             quoteMessageContext: payload.quoteType.quoteMessageContext,
//             quoteTime: payload.quoteType.quoteTime,
//             quoteDate: payload.quoteType.quoteDate,
//             payloadId: messagePayloadEntry.messagePayloadDbId,
//         },
//     });
// }
