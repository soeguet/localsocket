import prisma from "../db/db";
import type {
    AuthenticationPayload,
    ReactionPayload,
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
    return await prisma.client.findMany();
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
