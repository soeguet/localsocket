import { sendLast100MessagesToNewClient } from "./src/databaseRequests";
import {
    processIncomingMessage,
} from "./src/incomingMessages";

console.log("Hello via Bun!");

const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers":
        "Origin, X-Requested-With, Content-Type, Accept",
};

const server = Bun.serve<WebSocket>({
    fetch(req, server) {
        // preflight request for CORS
        if (req.method === "OPTIONS") {
            return new Response(null, {
                headers,
            });
        }

        // handle websocket upgrade
        if (new URL(req.url).pathname === "/chat") {
            const success = server.upgrade(req);
            if (success) return undefined;
        }

        // handle HTTP request normally -> if nothing matches -> 404
        return new Response("who are you and what do you want?", {
            status: 404,
        });
    },
    websocket: {
        perMessageDeflate: true,
        async open(ws) {
            ws.subscribe("the-group-chat");
            await sendLast100MessagesToNewClient(ws);
        },
        // this is called when a message is received
        async message(ws, message): Promise<void> {
            processIncomingMessage(ws,server, message);
        },
    },
    port: 5588,
});

console.log(`Listening on ${server.hostname}:${server.port}`);
