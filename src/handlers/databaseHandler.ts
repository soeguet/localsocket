import prisma from "../db/db";
import {
    type AuthenticationPayload,
    type ClientUpdatePayload,
    type MessageListPayload,
    type MessagePayload,
    PayloadSubType,
    type ReactionPayload,
} from "../types/payloadTypes";

export function checkForDatabaseErrors(message: string | Buffer) {
    // check for null values
    if (prisma === undefined || prisma === null) {
        console.error("Database not found");
        return;
    }
    if (
        typeof message !== "string" ||
        message === "" ||
        message === undefined
    ) {
        console.error("Invalid message type");
        return;
    }
    return message;
}

export async function registerUserInDatabse(payload: AuthenticationPayload) {
    try {
        await prisma.client.upsert({
            where: {
                clientDbId: payload.clientDbId,
            },
            update: {},
            create: {
                clientDbId: payload.clientDbId,
                clientUsername: payload.clientUsername,
            },
        });
    } catch (error) {
        console.error("Error registering user in database", error);
    }
}

export async function retrieveAllRegisteredUsersFromDatabase() {
    return prisma.client.findMany();
}

export async function persistReactionToDatabase(payload: ReactionPayload) {
    await prisma.reactionType.create({
        data: {
            reactionDbId: payload.reactionDbId,
            reactionMessageId: payload.reactionMessageId,
            reactionContext: payload.reactionContext,
            reactionClientId: payload.reactionClientId,
        },
    });
}

export async function sendLast100MessagesToNewClient() {
    // grab all messages
    const messageList = await prisma.messagePayload.findMany({
        take: -100,
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
    } as MessageListPayload;
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
    return prisma.messagePayload.findFirst({
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
}

function generateIsoDate() {
    return new Date().toISOString().replace(/[-:.TZ]/g, "");
}

export async function persistMessageInDatabase(payload: MessagePayload) {
    const dataObject = {
        clientType: {
            connect: {
                clientDbId: payload.clientType.clientDbId,
            },
        },
        messagePayloadDbId: generateIsoDate(),
        messageType: {
            create: {
                messageDate: payload.messageType.messageDate,
                deleted: payload.messageType.deleted,
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

        await prisma.messagePayload.upsert({
            create: quotedObject,
            update: {},
            where: {
                messagePayloadDbId: payload.messageType.messageDbId,
            },
        });
        //
    } else {
        const abc = await prisma.messagePayload.upsert({
            create: dataObject,
            update: {},
            where: {
                messagePayloadDbId: payload.messageType.messageDbId,
            },
        });

        console.log("abc", abc);
    }
}

export async function retrieveUpdatedMessageFromDatabase(messageDbId: string) {
    return prisma.messagePayload.findFirst({
        where: {
            messagePayloadDbId: messageDbId,
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
}

