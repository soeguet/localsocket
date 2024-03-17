import { type Server, type ServerWebSocket } from "bun";
import {
    PayloadSubType,
    type AuthenticationPayload,
    type ClientEntity,
} from "./types/payloadTypes";
import {
    persistMessageInDatabase,
    retrieveLastMessageFromDatabase,
} from "./databaseRequests";
import { checkIfMessageFitsDbSchema } from "./handlers/authHandler";
import {
    checkForDatabaseErrors,
    persistReactionToDatabase,
} from "./handlers/databaseHandler";
import { sendAllRegisteredUsersListToClient } from "./handlers/communicationHandler";
import { validateMessagePayloadTyping } from "./handlers/typeHandler";

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
                (allUsers: ClientEntity | unknown) =>
                    sendAllRegisteredUsersListToClient(server, allUsers)
            );

            break;

        ////
        case PayloadSubType.message:
            const validPayload = validateMessagePayloadTyping(
                payloadFromClientAsObject
            );

            if (!validPayload) {
                throw new Error(
                    "Invalid message payload type. Type check not successful!"
                );
            }

            // PERSIST MESSAGE
            await persistMessageInDatabase(messageAsString);

            // retrieve just persisted message
            const lastMessagesFromDatabase =
                await retrieveLastMessageFromDatabase();

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
