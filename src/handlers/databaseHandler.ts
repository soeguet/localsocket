import { postgresDb } from "../db/db";
import { clientEntitySchema } from "../db/schema/schema";
import type { AuthenticationPayload, ReactionEntity } from "../types/payloadTypes";

export function checkForDatabaseErrors(message: string | Buffer) {
    // console.log("message received", message);
    // check for null values
    if (postgresDb === undefined || postgresDb === null) {
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
        //
        await postgresDb
            .insert(clientEntitySchema)
            .values({
                clientDbId: payload.clientId,
                clientUsername: payload.clientUsername,
            })
            .onConflictDoNothing();
        //
    } catch (error) {
        console.error("Error while registering user", error);
    }
}

export async function retrieveAllRegisteredUsersFromDatabase() {
    try {
        return await postgresDb.select().from(clientEntitySchema);
    } catch (error) {
        return error;
    }
}

export async function persistReactionToDatabase(message: string | Buffer) {
    if (typeof message !== "string") {
        console.error("Invalid message type");
        return;
    }
    const payloadFromClientAsObject: ReactionEntity = JSON.parse(message);

    await postgresDb.insert(reactionTypeSchema).values({
        payloadId: payloadFromClientAsObject.messagePayloadId,
        messageId: payloadFromClientAsObject.messageId,
        emojiName: payloadFromClientAsObject.emoji,
        userId: payloadFromClientAsObject.userId,
    });
    console.log("persistReactionToDatabase", payloadFromClientAsObject);
}

