import { serve, type Server, type ServerWebSocket } from "bun";
import {
    PayloadSubType,
    type AuthenticatedPayload,
    type MessagePayload,
    type ReactionPayload,
} from "./types/payloadTypes";
import type { RegisteredUser } from "./types/userTypes";
import {
    persistMessageInDatabase,
    retrieveLastMessageFromDatabase,
} from "./databaseRequests";
import { postgresDb } from "./db/db";
import { reactionTypeSchema, usersSchema } from "./db/schema/schema";

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

export async function processIncomingMessage(
    ws: ServerWebSocket<WebSocket>,
    server: Server,
    message: string | Buffer
) {
    const messageAsString = checkForDatabaseErrors(message) as string;
    // switch part
    const payloadFromClientAsObject = JSON.parse(messageAsString);
    switch (payloadFromClientAsObject.payloadType) {
        ////
        case PayloadSubType.auth:
            // first part
            // register the user in the database
            // eslint-disable-next-line no-case-declarations
            const authenticationPayload: AuthenticatedPayload =
                JSON.parse(messageAsString);
            await postgresDb
                .insert(usersSchema)
                .values({
                    id: authenticationPayload.clientId,
                    username: authenticationPayload.clientUsername,
                })
                .onConflictDoNothing();

            // second part
            // send the list of all users to the client
            // eslint-disable-next-line no-case-declarations
            const allUsers: RegisteredUser[] = await postgresDb
                .select()
                .from(usersSchema);
            // console.log("allUsers", allUsers);
            server.publish(
                "the-group-chat",
                JSON.stringify({
                    payloadType: PayloadSubType.clientList,
                    clients: allUsers,
                })
            );
            break;

        ////
        case PayloadSubType.message:
            console.log("messageAsString received", messageAsString);

            // PERSIST MESSAGE
            await persistMessageInDatabase(messageAsString);

            // retrieve just persisted message
            const lastMessagesFromDatabase:MessagePayload = await retrieveLastMessageFromDatabase() as MessagePayload;

            lastMessagesFromDatabase.payloadType = PayloadSubType.message;

            server.publish(
                "the-group-chat",
                JSON.stringify(lastMessagesFromDatabase)
            );
            break;

        ////
        case PayloadSubType.profileUpdate:
            console.log("profileUpdate received", messageAsString);
            break;

        ////
        case PayloadSubType.clientList:
            console.log("clientList received", messageAsString);
            break;

        ////
        case PayloadSubType.typing:
        case PayloadSubType.force:
            server.publish("the-group-chat", messageAsString);
            break;

        ////
        case PayloadSubType.reaction:
            console.log("reaction received", messageAsString);
            await persistReactionToDatabase(messageAsString);
            break;

        ////
        default: {
            console.log("switch messageType default");
            console.log("messageAsString", messageAsString);
            break;
        }
    }
}

export async function persistReactionToDatabase(message: string | Buffer) {
    if (typeof message !== "string") {
        console.error("Invalid message type");
        return;
    }
    const payloadFromClientAsObject: ReactionPayload = JSON.parse(message);

    await postgresDb.insert(reactionTypeSchema).values({
        payloadId: payloadFromClientAsObject.messagePayloadId,
        messageId: payloadFromClientAsObject.messageId,
        emojiName: payloadFromClientAsObject.emoji,
        userId: payloadFromClientAsObject.userId,
    });
    console.log("persistReactionToDatabase", payloadFromClientAsObject);
}
