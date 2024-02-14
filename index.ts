import type { Websocket } from "./src/customTypes";
import { processIncomingMessage } from "./src/messages";

console.log("Hello via Bun!");

const server = Bun.serve<Websocket>({
    fetch(req, server) {
        const url = new URL(req.url);
        console.log(url.pathname);

        if (
            req.method === "POST" &&
            new URL(req.url).pathname === "/register-user"
        ) {
            return req
                .json()
                .then((data) => {
                    console.log(data);
                    return new Response(JSON.stringify({ status: "success" }), {
                        status: 200,
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });
                })
                .catch((error) => {
                    return new Response(
                        JSON.stringify({
                            status: "error",
                            message: error.message,
                        }),
                        {
                            status: 400,
                            headers: {
                                "Content-Type": "application/json",
                            },
                        }
                    );
                });
        }

        const usernameFromHeader = req.headers.get("username");
        const success = server.upgrade(req, {
            data: {
                socketId: Math.random(),
                username: usernameFromHeader,
            },
        });
        if (success) return undefined;

        // handle HTTP request normally
        return new Response("who are you and what do you want?", { status: 404 });
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
