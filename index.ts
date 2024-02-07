import type { ServerWebSocket } from "bun";

console.log("Hello via Bun!");
type Websocket = {
    socketId: number;
    username: string;
};

type Auth = {
    type: "auth";
    username: string;
};

type Message = {
    type: "message";
    message: string;
};

type MessageBackToClients = {
    id: string;
    sender: string;
    message: string;
};

function generateSimpleId() {
    const id = `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    console.log("unique id : " + id);
    
    return id;
}

const server = Bun.serve<Websocket>({
    fetch(req, server) {
        const usernameFromHeader = req.headers.get("username");
        const success = server.upgrade(req, {
            data: {
                socketId: Math.random(),
                username: usernameFromHeader,
            },
        });
        if (success) return undefined;

        // handle HTTP request normally
        return new Response("who are you and what do you want?");
    },
    websocket: {
        perMessageDeflate: true,
        open(ws) {
            ws.subscribe("the-group-chat");
        },
        // this is called when a message is received
        async message(ws, message) {
            processIncomingMessage(message, ws);
        },
    },
    port: 5555,
});

console.log(`Listening on ${server.hostname}:${server.port}`);
function processIncomingMessage(
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

function checkIfMessageIsString(message: string | Buffer): string {
    if (typeof message === "string") {
        try {
            return message;
        } catch (error) {
            throw new Error("message parsing error occured");
        }
    } else {
        throw new Error("not a string!");
    }
}
