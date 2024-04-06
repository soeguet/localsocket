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
    ws: ServerWebSocket<WebSocket>,
    server: Server,
    message: string | Buffer
) {
    // some random checks on message & database
    const messageAsString = checkForDatabaseErrors(message) as string;

    const payloadFromClientAsObject = JSON.parse(messageAsString);

    // switch part
    switch (payloadFromClientAsObject.payloadType) {
        ////
        case PayloadSubType.auth: {
            //
            const validAuthPayload = validateAuthPayloadTyping(
                payloadFromClientAsObject
            );

            if (!validAuthPayload) {
                ws.close(
                    1008,
                    "Invalid authentication payload type. Type check not successful!"
                );
                break;
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
        }
        case PayloadSubType.message: {
            const validMessagePayload = validateMessagePayloadTyping(
                payloadFromClientAsObject
            );

            if (!validMessagePayload) {
                ws.send(
                    "Invalid message payload type. Type check not successful!"
                );
                ws.send(JSON.stringify(payloadFromClientAsObject));
                ws.close(
                    1008,
                    "Invalid message payload type. Type check not successful!"
                );
                break;
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

            server.publish("the-group-chat", "SUPER");
            break;
        }
        case PayloadSubType.profileUpdate: {
            await updateClientProfileInformation(payloadFromClientAsObject);

            await retrieveAllRegisteredUsersFromDatabase().then(
                (allUsers: ClientEntity | unknown) =>
                    sendAllRegisteredUsersListToClient(server, allUsers)
            );
            break;
        }

        case PayloadSubType.clientList: {
            await retrieveAllRegisteredUsersFromDatabase().then(
                (allUsers: ClientEntity | unknown) =>
                    sendAllRegisteredUsersListToClient(server, allUsers)
            );
            break;
        }

        case PayloadSubType.typing:
        case PayloadSubType.force: {
            server.publish("the-group-chat", messageAsString);
            break;
        }

        ////
        case PayloadSubType.reaction: {
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
        }

        case null:
        case undefined:
        default: {
            ws.send("Invalid message payload type. Type check not successful!");
            console.log("switch messageType default");
            console.log("messageAsString", messageAsString);
            ws.close(
                1008,
                "Invalid message payload type. Type check not successful!"
            );
            break;
        }
    }
}
