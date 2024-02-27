import type { Server, ServerWebSocket } from "bun";
import {
    PayloadSubType,
    type MessagePayload,
    type ProfileUpdatePayload,
    type Websocket,
} from "./customTypes";
import { checkIfMessageIsString } from "./helper";
import { persistIncomingMessage } from "./messageRegister";
import {
    deliverArrayOfUsersToNewClient,
    registerUserv2,
    updateUser,
} from "./userRegister";

export function processIncomingMessage(
    ws: ServerWebSocket<Websocket>,
    server: Server,
    message: string | Buffer
) {
    const messageAsString: string = checkIfMessageIsString(message);

    // at this point we dont know the actual type of the message
    const messageAsObject = JSON.parse(messageAsString) as MessagePayload;

    console.log("messageAsObject TYPE", messageAsObject.payloadType);

    switch (messageAsObject.payloadType) {
        case PayloadSubType.auth: {
            registerUserv2(messageAsString);
            deliverArrayOfUsersToNewClient(server);
            break;
        }

        case PayloadSubType.message: {
            // type: MessagePayload
            // TODO persist the message to the database
            persistIncomingMessage(messageAsObject as MessagePayload);
            server.publish("the-group-chat", messageAsString);
            break;
        }

        case PayloadSubType.profileUpdate: {
            const { clientId, username, color, pictureUrl } = JSON.parse(
                messageAsString
            ) as ProfileUpdatePayload;
            updateUser(clientId, username, color, pictureUrl);
            deliverArrayOfUsersToNewClient(server);
            break;
        }

        case PayloadSubType.clientList: {
            deliverArrayOfUsersToNewClient(server);
            break;
        }

        case PayloadSubType.typing:
        case PayloadSubType.force:
            server.publish("the-group-chat", messageAsString);
            break;

        default: {
            console.log("switch messageType default");
            console.log("messageAsString", messageAsString);
            break;
        }
    }
}
