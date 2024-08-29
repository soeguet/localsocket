import type { Server, ServerWebSocket } from "bun";
import { NewProfilePicturePayloadSchema } from "../../types/payloadTypes";
import {
	persistProfilePicture,
	persistPictureHashForClient,
} from "../databaseHandler";
import { errorLogger } from "../../logger/errorLogger";

export async function newProfilePictureHandler(
	payloadFromClientAsObject: unknown,
	ws: ServerWebSocket<WebSocket>,
	server: Server
) {
	const validAuthPayload = validatePayload(payloadFromClientAsObject, ws);
	if (!validAuthPayload.success) {
		return;
	}

	await persistProfilePicture(validAuthPayload.data);
	await persistPictureHashForClient(
		validAuthPayload.data.clientDbId,
		validAuthPayload.data.imageHash
	);

	server.publish("the-group-chat", JSON.stringify(validAuthPayload.data));
}

function validatePayload(payload: unknown, ws: ServerWebSocket<WebSocket>) {
	const validAuthPayload = NewProfilePicturePayloadSchema.safeParse(payload);

	if (!validAuthPayload.success) {
		ws.send(
			"Invalid NEW_PROFILE_PICTURE payload type. Type check not successful!"
		);
		console.error(
			"VALIDATION OF NEW_PROFILE_PICTURE PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
		);
		errorLogger.logError(
			"VALIDATION OF NEW_PROFILE_PICTURE PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
		);
		ws.close(
			1008,
			"Invalid NEW_PROFILE_PICTURE payload type. Type check not successful!"
		);
	}
	return validAuthPayload;
}