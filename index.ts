console.log("Hello via Bun!");

const server = Bun.serve<{ socketId: number; username: string }>({
    fetch(req, server) {
        console.log(req);
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
            const msg = `${ws.data.username} has entered the chat`;
            ws.subscribe("the-group-chat");
            ws.publish("the-group-chat", msg);
        },
        // this is called when a message is received
        async message(ws, message) {
            console.log(`Received ${message} from ${ws.data.socketId}`);
            console.log(`${ws.data.username}`);
            ws.publish;
        },
    },
    port: 5555,
});

console.log(`Listening on ${server.hostname}:${server.port}`);
