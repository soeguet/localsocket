import { processIncomingMessage } from "./src/messages";
import type { Websocket } from "./src/types";

console.log("Hello via Bun!");

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
            processIncomingMessage(server, message);
        },
    },
    port: 5555,
});

console.log(`Listening on ${server.hostname}:${server.port}`);
