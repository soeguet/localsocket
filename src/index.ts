import {
	processErrorLog,
	processIncomingMessage,
} from "./handlers/incomingMessageHandler";
import { errorLogger } from "./logger/errorLogger";

console.log("Hello via Bun!");

const headers = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
	"Access-Control-Allow-Headers":
		"Origin, X-Requested-With, Content-Type, Accept",
};

const server = Bun.serve<WebSocket>({
	fetch: async (req, server) => {
		console.log("Request received", req.method, req.url);
		const url = new URL(req.url);
		// preflight request for CORS
		if (req.method === "OPTIONS") {
			return new Response(null, {
				headers,
			});
		}

		if (req.method === "POST" && url.pathname === "/v1/log/error") {
			try {
				await processErrorLog(req);
				return new Response("Log received", { status: 200 });
			} catch (error) {
				errorLogger.logError(error);
				return new Response("Error parsing log", { status: 500 });
			}
		}

		// handle websocket upgrade
		if (url.pathname === "/chat") {
			const upgraded = server.upgrade(req);
			if (!upgraded) {
				return new Response("Upgrade failed", { status: 400 });
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
				errorLogger.logError(new Error("Invalid message type"));
			}
		},
	},
	port: 5588,
});

console.log(`Listening on ${server.hostname}:${server.port}`);
