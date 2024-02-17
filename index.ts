import type { Websocket } from "./src/customTypes";
import { processIncomingMessage } from "./src/messages";

console.log("Hello via Bun!");
const headers: HeadersInit = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers":
        "Origin, X-Requested-With, Content-Type, Accept",
};

const server = Bun.serve<Websocket>({
    fetch(req, server) {
        // preflight request for CORS
        if (req.method === "OPTIONS") {
            return new Response(null, {
                headers,
            });
        }

        // handle POST request for user registration
        // if (
        //     req.method === "POST" &&
        //     new URL(req.url).pathname === "/register-user"
        // ) {
        //     return handleRegisterUserPostRequest(req, headers);
        // }

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
        open(ws) {
            ws.subscribe("the-group-chat");
        },
        // this is called when a message is received
        async message(ws, message) {
            processIncomingMessage(ws, server, message);
        },
    },
    port: 5555,
});

console.log(`Listening on ${server.hostname}:${server.port}`);
