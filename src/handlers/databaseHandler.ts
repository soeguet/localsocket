import { postgresDb } from "../db/db";
import type { ReactionEntity } from "../types/payloadTypes";

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
            .insert(usersSchema)
            .values({
                id: payload.clientId,
                username: payload.clientUsername,
            })
            .onConflictDoNothing();
        //
    } catch (error) {
        console.error("Error while registering user", error);
    }
}
export async function retrieveAllRegisteredUsersFromDatabase() {
    try {
        return await postgresDb.select().from(usersSchema);
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

