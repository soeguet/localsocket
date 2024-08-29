import type { Server, ServerWebSocket } from "bun";
import {
	MessagePayloadSchema,
	PayloadSubTypeEnum,
} from "../../types/payloadTypes";
import {
	persistMessageInDatabase,
	retrieveLastMessageFromDatabase,
} from "../databaseHandler";
import { errorLogger } from "../../logger/errorLogger";


export async function messagePayloadHandler(
	payloadFromClientAsObject: unknown,
	ws: ServerWebSocket<WebSocket>,
	server: Server
) {
	const validAuthPayload = validatePayload(payloadFromClientAsObject, ws);
	if (!validAuthPayload.success) {
		return;
	}

	await persistMessageInDatabase(validAuthPayload.data);
	await sendLastMessageFromDbToClients(server);
}

function validatePayload(payload: unknown, ws: ServerWebSocket<WebSocket>) {
	const validAuthPayload = MessagePayloadSchema.safeParse(payload);

	if (!validAuthPayload.success) {
		console.error(
			"VALIDATION OF _MESSAGE_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
		);
		console.error("payloadFromClientAsObject", payload);
		errorLogger.logError(
			"VALIDATION OF _MESSAGE_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
		);
		ws.send("Invalid message payload type. Type check not successful!");
		ws.send(JSON.stringify(payload));
		ws.close(
			1008,
			"Invalid message payload type. Type check not successful!"
		);
	}
	return validAuthPayload;
}

async function sendLastMessageFromDbToClients(server: Server) {
	const lastMessagesFromDatabase = await retrieveLastMessageFromDatabase();

	const finalPayload = {
		...lastMessagesFromDatabase,
		payloadType: PayloadSubTypeEnum.enum.message,
	};

	server.publish("the-group-chat", JSON.stringify(finalPayload));
}