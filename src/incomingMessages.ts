import {
    PayloadSubType,
    type AuthenticationPayload,
    type ClientEntity,
    type MessagePayload,
    type ReactionPayload,
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
    validateReactionPayloadTyping,
} from "./handlers/typeHandler";
import type { Server, ServerWebSocket } from "bun";

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

            if (
                !validAuthPayload ||
                payloadFromClientAsObject.clientDbId === ""
            ) {
                ws.close(
                    1008,
                    "Invalid authentication payload type. Type check not successful!"
                );
                break;
            }

            await registerUserInDatabse(
                payloadFromClientAsObject as AuthenticationPayload
            );

            const allUsers = await retrieveAllRegisteredUsersFromDatabase();

            if (typeof allUsers === "undefined" || allUsers === null) {
                throw new Error("No users found");
            }

            sendAllRegisteredUsersListToClient(server, allUsers);

            break;
        }

        case PayloadSubType.message: {
            const validMessagePayload = validateMessagePayloadTyping(
                payloadFromClientAsObject
            );

            // redefine for LSP compliance
            const messagePayload: MessagePayload = payloadFromClientAsObject;

            if (
                !validMessagePayload ||
                messagePayload.messageType.messageDbId === "" ||
                messagePayload.clientType.clientDbId === ""
            ) {
                ws.send(
                    "Invalid message payload type. Type check not successful!"
                );
                ws.send(JSON.stringify(messagePayload));
                ws.close(
                    1008,
                    "Invalid message payload type. Type check not successful!"
                );
                break;
            }

            // PERSIST MESSAGE
            await persistMessageInDatabase(messagePayload);

            // retrieve just persisted message
            const lastMessagesFromDatabase =
                await retrieveLastMessageFromDatabase();

            const finalPayload = {
                ...lastMessagesFromDatabase,
                payloadType: PayloadSubType.message,
            };

            server.publish("the-group-chat", JSON.stringify(finalPayload));
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

        case PayloadSubType.reaction: {
            const validatedReactionPayload = validateReactionPayloadTyping(
                payloadFromClientAsObject
            );

            // set to object of type ReactionPayload for LSP compliance
            const reactionPayload: ReactionPayload = payloadFromClientAsObject;

            if (
                !validatedReactionPayload ||
                reactionPayload.reactionDbId === "" ||
                reactionPayload.reactionMessageId === "" ||
                reactionPayload.reactionContext === "" ||
                reactionPayload.reactionClientId === ""
            ) {
                ws.send(
                    "Invalid reaction payload type. Type check not successful!" +
                        JSON.stringify(reactionPayload)
                );
                ws.close(
                    1008,
                    "Invalid authentication payload type. Type check not successful!"
                );
                break;
            }

            await persistReactionToDatabase(payloadFromClientAsObject);
            const updatedMessage = await retrieveUpdatedMessageFromDatabase(
                payloadFromClientAsObject.reactionMessageId
            );
            const updatedMessageWithPayloadType = {
                ...updatedMessage,
                payloadType: PayloadSubType.reaction,
            };

            server.publish(
                "the-group-chat",
                JSON.stringify(updatedMessageWithPayloadType)
            );
            break;
        }

        case null:
        case undefined:
        default: {
            ws.send(
                "SWITCH CASES: Invalid message payload type. Type check not successful!"
            );
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
