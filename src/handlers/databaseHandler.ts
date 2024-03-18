import prisma from "../db/db";
import type { AuthenticationPayload } from "../types/payloadTypes";

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

export async function persistReactionToDatabase(message: string | Buffer) {
    // if (typeof message !== "string") {
    //     console.error("Invalid message type");
    //     return;
    // }
    // const payloadFromClientAsObject: ReactionEntity = JSON.parse(message);
    //
    // await postgresDb.insert(reactionTypeSchema).values({
    //     payloadId: payloadFromClientAsObject.messagePayloadId,
    //     messageId: payloadFromClientAsObject.messageId,
    //     emojiName: payloadFromClientAsObject.emoji,
    //     userId: payloadFromClientAsObject.userId,
    // });
    // console.log("persistReactionToDatabase", payloadFromClientAsObject);
}
