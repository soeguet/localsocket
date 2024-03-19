import prisma from "../db/db";
import type {
    AuthenticationPayload,
    ReactionPayload,
} from "../types/payloadTypes";

export function checkForDatabaseErrors(message: string | Buffer) {
    // console.log("message received", message);
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
    await prisma.client.upsert({
        create: {
            clientDbId: payload.clientId,
            clientUsername: payload.clientUsername,
        },
        update: {},
        where: {
            clientDbId: payload.clientId,
        },
    });
}

export async function retrieveAllRegisteredUsersFromDatabase() {
    return await prisma.client.findMany();
}

export async function persistReactionToDatabase(payload: ReactionPayload) {
    await prisma.reactionType.create({
        data: {
            reactionMessageId: payload.reactionMessageId,
            reactionContext: payload.reactionContext,
            reactionClientId: payload.reactionClientId,
        },
    });
}
