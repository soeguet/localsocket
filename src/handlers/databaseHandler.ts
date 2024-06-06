import prisma from "../db/db";
import {
    type AuthenticationPayload,
    type ClientUpdatePayload,
    type MessageListPayload,
    type MessagePayload,
    PayloadSubType,
    type ReactionPayload,
    type DeleteEntity,
    type EditEntity,
    type ImageEntity,
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
export async function editMessageContent(payload: EditEntity) {
    await prisma.messagePayload.update({
        where: {
            messagePayloadDbId: payload.messageDbId,
        },
        data: {
            messageType: {
                update: {
                    edited: true,
                    messageContext: payload.messageContext,
                },
            },
        },
    });
}

export async function deleteMessageStatus(payload: DeleteEntity) {
    await prisma.messagePayload.update({
        where: {
            messagePayloadDbId: payload.messageDbId,
        },
        data: {
            messageType: {
                update: {
                    deleted: true,
                },
            },
        },
    });
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
    await prisma.messagePayload.create({
        data: {
            messagePayloadDbId: payload.messageType.messageDbId,
            messageType: {
                create: {
                    messageContext: payload.messageType.messageContext,
                    messageTime: generateIsoDate(),
                    messageDate: payload.messageType.messageDate,
                    deleted: payload.messageType.deleted,
                    edited: payload.messageType.edited,
                },
            },
            clientType: {
                connect: {
                    clientDbId: payload.clientType.clientDbId,
                },
            },
            quoteType: {
                create: {
                    quoteClientId: payload.quoteType?.quoteClientId,
                    quoteDate: payload.quoteType?.quoteDate,
                    quoteMessageContext: payload.quoteType?.quoteMessageContext,
                    quoteTime: payload.quoteType?.quoteTime,
                },
            },
            imageType: {
                create: {
                    data: payload.imageType?.data,
                    type: payload.imageType?.type,
                },
            },
        },
    });
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
            imageType: true,
        },
    });
}
