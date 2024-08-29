import type { ServerWebSocket, Server } from "bun";
import {
	editMessageContent,
	retrieveUpdatedMessageFromDatabase,
} from "../databaseHandler";
import { errorLogger } from "../../logger/errorLogger";
import {
	type EditEntity,
	EditEntitySchema,
	PayloadSubTypeEnum,
} from "../../types/payloadTypes.ts";

export async function editPayloadHandler(
	payloadFromClientAsObject: unknown,
	ws: ServerWebSocket<WebSocket>,
	server: Server
) {
	const validatedEditPayload = validatePayload(payloadFromClientAsObject, ws);

	if (!validatedEditPayload.success) {
		return;
	}

	await editMessageContent(payloadFromClientAsObject as EditEntity);

	await sendEditedMessageToClients(
		payloadFromClientAsObject as EditEntity,
		server
	);
}

async function sendEditedMessageToClients(payload: EditEntity, server: Server) {
	const updatedMessage = await retrieveUpdatedMessageFromDatabase(
		payload.messageDbId
	);

	const updatedMessageWithPayloadType = {
		...updatedMessage,
		payloadType: PayloadSubTypeEnum.enum.edit,
	};

	server.publish(
		"the-group-chat",
		JSON.stringify(updatedMessageWithPayloadType)
	);
}

function validatePayload(payload: unknown, ws: ServerWebSocket<WebSocket>) {
	const validAuthPayload = EditEntitySchema.safeParse(payload);

	if (!validAuthPayload.success) {
		ws.send("Invalid edit payload type. Type check not successful!");
		console.error(
			"VALIDATION OF _EDIT_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
		);
		errorLogger.logError(
			"VALIDATION OF _EDIT_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
		);
		ws.close(1008, "Invalid edit payload type. Type check not successful!");
	}
	return validAuthPayload;
}