import type { Server, ServerWebSocket } from "bun";
import { checkIfMessageIsString, generateSimpleId } from "./helper";
import {
    PayloadSubType,
    type ProfileUpdatePayload,
    type UsernameObject,
    type Websocket,
} from "./customTypes";
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
    let messageAsString: string = checkIfMessageIsString(message);

    // at this point we dont know the actual type of the message
    const messageAsObject = JSON.parse(messageAsString);

    switch (messageAsObject.type) {
        case PayloadSubType.auth: {
            registerUserv2(messageAsObject as UsernameObject);
            deliverArrayOfUsersToNewClient(ws);
            break;
        }

        case PayloadSubType.message: {
            // assign a unique id to the message if it does not have one
            if (messageAsObject.id === undefined) {
                messageAsObject.id = generateSimpleId();
                messageAsString = JSON.stringify(messageAsObject);
            } else {
                throw new Error("where did this message get its id from?");
            }

            server.publish("the-group-chat", messageAsString);
            break;
        }

        case PayloadSubType.profileUpdate: {
            const { clientId, pictureUrl } =
                messageAsObject as ProfileUpdatePayload;
            updateUser(clientId, pictureUrl);
            deliverArrayOfUsersToNewClient(ws);
            break;
        }

        case PayloadSubType.clientList: {
            console.log("clientList");
            break;
        }

        default: {
            console.log("default");
            break;
        }
    }
}
