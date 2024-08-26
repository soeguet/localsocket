import type { ServerWebSocket, Server } from "bun";
import {
	deleteMessageStatus,
	retrieveUpdatedMessageFromDatabase,
} from "../databaseHandler";
import { errorLogger } from "../../logger/errorLogger";
import { type DeleteEntity, DeleteEntitySchema, PayloadSubTypeEnum } from "../../types/payloadTypes.ts";

export async function deletePayloadHandler(
	payloadFromClientAsObject: unknown,
	ws: ServerWebSocket<WebSocket>,
	server: Server
) {
	const validatedDeletePayload = validatePayload(
		payloadFromClientAsObject,
		ws
	);

	if (!validatedDeletePayload.success) {
		return;
	}

	const deleteSuccessful = await deleteMessageStatus(payloadFromClientAsObject as DeleteEntity);
	if (!deleteSuccessful) {
		return;
	}

	await sendUpdatedMessageToClients(validatedDeletePayload.data,server);
}

async function sendUpdatedMessageToClients(payload: DeleteEntity, server: Server) {

	const updatedMessage = await retrieveUpdatedMessageFromDatabase(
		payload.messageDbId
	);

	const updatedMessageWithPayloadType = {
		...updatedMessage,
		payloadType: PayloadSubTypeEnum.enum.delete,
	};

	server.publish(
		"the-group-chat",
		JSON.stringify(updatedMessageWithPayloadType)
	);
}

function validatePayload(payload: unknown, ws: ServerWebSocket<WebSocket>) {

	const validAuthPayload = DeleteEntitySchema.safeParse(payload);

	if (!validAuthPayload.success) {
		ws.send(
			"Invalid delete payload type. Type check not successful!"
		);
		console.error(
			"VALIDATION OF _DELETE_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
		);
		errorLogger.logError(
			"VALIDATION OF _DELETE_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
		);
		ws.close(
			1008,
			"Invalid delete payload type. Type check not successful!"
		);
	}
	return validAuthPayload;
}