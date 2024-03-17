import { type Server, type ServerWebSocket } from "bun";
import {
    PayloadSubType,
    type AuthenticationPayload,
    type MessagePayload,
    type ReactionEntity,
} from "./types/payloadTypes";
import type { RegisteredUser } from "./types/userTypes";
import {
    persistMessageInDatabase,
    retrieveLastMessageFromDatabase,
} from "./databaseRequests";
import { postgresDb } from "./db/db";
import { reactionTypeSchema } from "./db/schema/schema";
import {
    registerUserInDatabse,
    retrieveAllRegisteredUsersFromDatabase,
    sendAllRegisteredUsersListToClient as sendAllRegisteredUsersListToClient,
} from "./handlers/authHandler";

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
    _ws: ServerWebSocket<WebSocket>,
    server: Server,
    message: string | Buffer
) {
    //
    const messageAsString = checkForDatabaseErrors(message) as string;
    const payloadFromClientAsObject = JSON.parse(messageAsString);

    // first payload check
    if (payloadFromClientAsObject.payloadType === undefined) {
        console.error("Invalid payload type");
        return;
    }

    // switch part
    switch (payloadFromClientAsObject.payloadType) {
        ////
        case PayloadSubType.auth:
            //
            const authenticationPayload: AuthenticationPayload =
                JSON.parse(messageAsString);

            registerUserInDatabse(authenticationPayload);

            retrieveAllRegisteredUsersFromDatabase().then(
                (allUsers: RegisteredUser | unknown) =>
                    sendAllRegisteredUsersListToClient(server, allUsers)
            );

            break;

        ////
        case PayloadSubType.message:

            checkIfMessageFitsDbSchema(messageAsString);

            // PERSIST MESSAGE
            await persistMessageInDatabase(messageAsString);

            // retrieve just persisted message
            const lastMessagesFromDatabase: MessagePayload =
                (await retrieveLastMessageFromDatabase()) as MessagePayload;

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
    const payloadFromClientAsObject: ReactionEntity = JSON.parse(message);

    await postgresDb.insert(reactionTypeSchema).values({
        payloadId: payloadFromClientAsObject.messagePayloadId,
        messageId: payloadFromClientAsObject.messageId,
        emojiName: payloadFromClientAsObject.emoji,
        userId: payloadFromClientAsObject.userId,
    });
    console.log("persistReactionToDatabase", payloadFromClientAsObject);
}
