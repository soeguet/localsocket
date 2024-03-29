import { type Server, type ServerWebSocket } from "bun";
import {
    PayloadSubType,
    type AuthenticationPayload,
    type ClientEntity,
} from "./types/payloadTypes";
import {
    persistMessageInDatabase,
    retrieveLastMessageFromDatabase,
    retrieveUpdatedMessageFromDatabase,
    updateClientProfileInformation,
} from "./databaseRequests";
import {
    checkForDatabaseErrors,
    persistReactionToDatabase,
    registerUserInDatabse,
    retrieveAllRegisteredUsersFromDatabase,
} from "./handlers/databaseHandler";
import { sendAllRegisteredUsersListToClient } from "./handlers/communicationHandler";
import {
    validateAuthPayloadTyping,
    validateMessagePayloadTyping,
} from "./handlers/typeHandler";

export async function processIncomingMessage(
    _ws: ServerWebSocket<WebSocket>,
    server: Server,
    message: string | Buffer
) {
    // some random checks on message & database
    const messageAsString = checkForDatabaseErrors(message) as string;

    const payloadFromClientAsObject = JSON.parse(messageAsString);

    // switch part
    switch (payloadFromClientAsObject.payloadType) {
        ////
        case PayloadSubType.auth:
            //

            const validAuthPayload = validateAuthPayloadTyping(
                payloadFromClientAsObject
            );

            if (!validAuthPayload) {
                throw new Error(
                    "Invalid authentication payload type. Type check not successful!"
                );
            }

            await registerUserInDatabse(
                payloadFromClientAsObject as AuthenticationPayload
            );

            await retrieveAllRegisteredUsersFromDatabase().then((allUsers) => {
                if (typeof allUsers === "undefined" || allUsers === null) {
                    throw new Error("No users found");
                }

                sendAllRegisteredUsersListToClient(server, allUsers);
            });

            break;

        ////
        case PayloadSubType.message:
            //console.log("message received", payloadFromClientAsObject);
            // VALIDATION
            const validPayload = validateMessagePayloadTyping(
                payloadFromClientAsObject
            );

            if (!validPayload) {
                throw new Error(
                    "Invalid message payload type. Type check not successful!"
                );
            }

            // PERSIST MESSAGE
            await persistMessageInDatabase(payloadFromClientAsObject);

            // retrieve just persisted message
            const lastMessagesFromDatabase =
                await retrieveLastMessageFromDatabase();

            const payload = {
                ...lastMessagesFromDatabase,
                payloadType: PayloadSubType.message,
            };

            server.publish("the-group-chat", JSON.stringify(payload));
            break;

        ////
        case PayloadSubType.profileUpdate:
            //console.log("profileUpdate received", messageAsString);

            await updateClientProfileInformation(payloadFromClientAsObject);

            await retrieveAllRegisteredUsersFromDatabase().then(
                (allUsers: ClientEntity | unknown) =>
                    sendAllRegisteredUsersListToClient(server, allUsers)
            );
            break;

        ////
        case PayloadSubType.clientList:
            //console.log("clientList received", messageAsString);
            await retrieveAllRegisteredUsersFromDatabase().then(
                (allUsers: ClientEntity | unknown) =>
                    sendAllRegisteredUsersListToClient(server, allUsers)
            );
            break;

        ////
        case PayloadSubType.typing:
        case PayloadSubType.force:
            server.publish("the-group-chat", messageAsString);
            break;

        ////
        case PayloadSubType.reaction:
            console.log("reaction received", messageAsString);
            await persistReactionToDatabase(payloadFromClientAsObject);
            await retrieveUpdatedMessageFromDatabase(
                payloadFromClientAsObject.reactionMessageId
            ).then((updatedMessage) => {
                const updatedMessageWithPayloadType = {
                    ...updatedMessage,
                    payloadType: PayloadSubType.reaction,
                };

                server.publish(
                    "the-group-chat",
                    JSON.stringify(updatedMessageWithPayloadType)
                );
            });
            break;

        ////
        default: {
            console.log("switch messageType default");
            console.log("messageAsString", messageAsString);
            break;
        }
    }
}
