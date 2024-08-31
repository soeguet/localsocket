import {
	processErrorLog,
	processIncomingMessage,
} from "./handlers/incomingMessageHandler";
import { errorLogger } from "./logger/errorLogger";
import {
	FetchPicturePayloadSchema,
	PayloadSubTypeEnum,
} from "./types/payloadTypes.ts";
import { fetchPictureApiHandler } from "./handlers/payloads/fetchPictureApiHandler.ts";

console.log("Hello via Bun!");

const allowedOrigins = new Set([
	"http://localhost",
	"http://127.0.0.1",
	"wails://wails.localhost:34115",
	"null",
]);

const isInternalIp = (origin: string) => {
	const internalIpPattern = /^http:\/\/(10\.|172\.16\.|192\.168\.)/;
	return internalIpPattern.test(origin);
};

const getCorsHeaders = (origin: string) => {
	const allowOrigin =
		allowedOrigins.has(origin) || isInternalIp(origin) ? origin : "*";
	return {
		"Access-Control-Allow-Origin": allowOrigin,
		"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type",
	};
};

const server = Bun.serve<WebSocket>({
	fetch: async (req, server) => {
		const origin = req.headers.get("Origin") || "null"; // Default to "null" if the Origin header is missing
		const corsHeaders = getCorsHeaders(origin);

		if (req.method === "OPTIONS") {
			return new Response(null, {
				status: 204,
				headers: corsHeaders,
			});
		}

		if (req.method === "POST" && req.url.endsWith("/v1/log/error")) {
			try {
				await processErrorLog(req);
				return new Response("Log received", {
					status: 200,
					headers: corsHeaders,
				});
			} catch (error) {
				errorLogger.logError(error);
				return new Response("Error parsing log", {
					status: 500,
					headers: corsHeaders,
				});
			}
		}

		if (req.method === "POST" && req.url.endsWith("/v1/fetchImage")) {
			const bodyText = await req.text();
			// Parse the string to JSON
			const body = JSON.parse(bodyText);

			const payload = FetchPicturePayloadSchema.safeParse(body);
			if (!payload.success) {
				return new Response("Invalid payload", {
					status: 400,
					headers: corsHeaders,
				});
			}

			const image = await fetchPictureApiHandler(payload.data.imageHash);
			if (image === null) {
				return new Response("Image not found", {
					status: 404,
					headers: corsHeaders,
				});
			}

			const deliverPicturePayload = {
				payloadType: PayloadSubTypeEnum.enum.deliverPicture,
				imageHash: payload.data.imageHash,
				data: image.data,
			};

			return new Response(JSON.stringify(deliverPicturePayload), {
				status: 200,
				headers: corsHeaders,
			});
		}

		const url = new URL(req.url);
		// handle websocket upgrade
		if (
			url.pathname === "/chat" &&
			req.headers.get("Upgrade") === "websocket"
		) {
			const upgraded = server.upgrade(req);
			if (!upgraded) {
				return new Response("Upgrade failed", {
					status: 400,
					headers: corsHeaders,
				});
			}
		}

		// if nothing matches -> 404
		return new Response("who are you and what do you want?", {
			status: 404,
			headers: corsHeaders,
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