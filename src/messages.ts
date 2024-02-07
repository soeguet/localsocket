import type { Server, ServerWebSocket } from "bun";
import { checkIfMessageIsString, generateSimpleId } from "./helper";
import type { Websocket, Auth, Message, MessageBackToClients } from "./types";

export function processIncomingMessage(
    server: Server,
    message: string | Buffer,
    ws: ServerWebSocket<Websocket>
) {
    const messageAsString: string = checkIfMessageIsString(message);
    const messageAsObject: Auth | Message = JSON.parse(messageAsString);

    switch (messageAsObject.type) {
        case "auth":
            ws.data.username = messageAsObject.username;
            break;

        case "message": {
            const messageBackToClients: MessageBackToClients = {
                id: generateSimpleId(),
                sender: ws.data.username,
                message: messageAsObject.message,
            };
            const messageAsString: string =
                JSON.stringify(messageBackToClients);
            server.publish("the-group-chat", messageAsString);
            console.log("publish!" + messageBackToClients);
            break;
        }
        default:
            console.log("unknown message type");
            break;
    }
}
