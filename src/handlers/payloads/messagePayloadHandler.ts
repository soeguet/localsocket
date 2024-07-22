import type { Server, ServerWebSocket } from "bun";
import { PayloadSubType, type MessagePayload } from "../../types/payloadTypes";
import {
	persistMessageInDatabase,
	retrieveLastMessageFromDatabase,
} from "../databaseHandler";
import { validateMessagePayload } from "../typeHandler";
import { errorLogger } from "../../logger/errorLogger";

export async function messagePayloadHandler(
	payloadFromClientAsObject: unknown,
	ws: ServerWebSocket<WebSocket>,
	server: Server
) {
	const validMessagePayload = validateMessagePayload(
		payloadFromClientAsObject
	);

	if (!validMessagePayload) {
		console.error(
			"VALIDATION OF _MESSAGE_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
		);
		console.error("payloadFromClientAsObject", payloadFromClientAsObject);
		errorLogger.logError(
			"VALIDATION OF _MESSAGE_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
		);
		ws.send("Invalid message payload type. Type check not successful!");
		ws.send(JSON.stringify(payloadFromClientAsObject));
		ws.close(
			1008,
			"Invalid message payload type. Type check not successful!"
		);
		return;
	}

	try {
		// PERSIST MESSAGE
		await persistMessageInDatabase(
			payloadFromClientAsObject as MessagePayload
		);
	} catch (error) {
		errorLogger.logError(error);
		return;
	}

	const lastMessagesFromDatabase = await retrieveLastMessageFromDatabase();

	const finalPayload = {
		...lastMessagesFromDatabase,
		payloadType: PayloadSubType.message,
	};

	server.publish("the-group-chat", JSON.stringify(finalPayload));
}
