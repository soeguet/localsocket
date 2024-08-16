import type { ServerWebSocket, Server } from "bun";
import { type EditEntity, PayloadSubType } from "../../types/payloadTypes";
import {
	editMessageContent,
	retrieveUpdatedMessageFromDatabase,
} from "../databaseHandler";
import { validateEditPayload } from "../typeHandler";
import { errorLogger } from "../../logger/errorLogger";

export async function editPayloadHandler(
	payloadFromClientAsObject: unknown,
	ws: ServerWebSocket<WebSocket>,
	server: Server
) {
	const validatedEditPayload = validateEditPayload(payloadFromClientAsObject);

	if (!validatedEditPayload) {
		ws.send(
			`Invalid delete payload type. Type check not successful! ${JSON.stringify(
				payloadFromClientAsObject
			)}`
		);
		console.error(
			"VALIDATION OF _DELETE_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
		);
		await errorLogger.logError(
			"VALIDATION OF _DELETE_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
		);
		ws.close(
			1008,
			"Invalid delete payload type. Type check not successful!"
		);
		return;
	}

	try {
		await editMessageContent(payloadFromClientAsObject as EditEntity);
	} catch (error) {
		await errorLogger.logError(error);
		return;
	}

	const updatedMessage = await retrieveUpdatedMessageFromDatabase(
		(payloadFromClientAsObject as EditEntity).messageDbId
	);

	const updatedMessageWithPayloadType = {
		...updatedMessage,
		payloadType: PayloadSubType.edit,
	};

	server.publish(
		"the-group-chat",
		JSON.stringify(updatedMessageWithPayloadType)
	);
}