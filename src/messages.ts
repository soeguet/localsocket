import type { Server } from "bun";
import { checkIfMessageIsString, generateSimpleId } from "./helper";
import { type MessagePayload, PayloadSubType } from "./types";

export function processIncomingMessage(
    server: Server,
    message: string | Buffer
) {
    let messageAsString: string = checkIfMessageIsString(message);
    console.log("messageAsString: " + messageAsString);
    const messageAsObject: MessagePayload = JSON.parse(messageAsString);

    switch (messageAsObject.type) {
        case PayloadSubType.auth: {
            // ws.data.username = messageAsObject.;
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
            console.log("publish!" + messageAsString);
            break;
        }
        default:
            console.log("unknown message type");
            break;
    }
}
