import type {
    RegisteredUser,
    UsernameObject,
    Websocket,
} from "./src/customTypes";
import { processIncomingMessage } from "./src/messages";
import {
    getAllUsers,
    registerUser,
} from "./src/userRegister";

console.log("Hello via Bun!");

const server = Bun.serve<Websocket>({
    fetch(req, server) {
        const headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        };

        // preflight request for CORS
        if (req.method === "OPTIONS") {
            return new Response(null, {
                headers,
            });
        }

        if (
            req.method === "POST" &&
            new URL(req.url).pathname === "/register-user"
        ) {
            return req
                .json()
                .then(async (data) => {
                    const dataAsObject: UsernameObject = data as UsernameObject;

                    await registerUser(dataAsObject.username);

                    const mapOfAllRegisteredUsers: Map<string, RegisteredUser> =
                        getAllUsers();
                    const responseToSend = JSON.stringify(
                        Array.from(mapOfAllRegisteredUsers)
                    );

                    return new Response(responseToSend, {
                        status: 200,
                        headers,
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
                            headers,
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
            processIncomingMessage(server, message);
        },
    },
    port: 5555,
});

console.log(`Listening on ${server.hostname}:${server.port}`);
