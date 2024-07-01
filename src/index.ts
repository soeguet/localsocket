import { processIncomingMessage } from "./handlers/incomingMessageHandler";

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
			if (success) {
				return;
			}
		}

		// if nothing matches -> 404
		return new Response("who are you and what do you want?", {
			status: 404,
		});
	},
	websocket: {
		async open(ws) {
			ws.subscribe("the-group-chat");
		},
		async message(ws, message): Promise<void> {
			if (typeof message === "string") {
				await processIncomingMessage(ws, server, message);
			} else {
				console.error("Invalid message type");
			}
		},
	},
	port: 5588,
});

console.log(`Listening on ${server.hostname}:${server.port}`);
