import type { ServerWebSocket } from "bun";

import { fetchProfilePicture } from "../databaseHandler";
import { errorLogger } from "../../logger/errorLogger";
import {
	type FetchCurrentClientProfilePictureHashPayload,
	FetchCurrentClientProfilePictureHashPayloadSchema,
	PayloadSubTypeEnum,
} from "../../types/payloadTypes.ts";

export async function fetchCurrentClientProfilePictureHashPayloadHandler(
	payloadFromClientAsObject: unknown,
	ws: ServerWebSocket<WebSocket>
) {
	const validPayload = validatePayload(payloadFromClientAsObject, ws);
	if (!validPayload.success) {
		return;
	}
	await sendProfilePictureHashesToClients(validPayload.data, ws);
}

function validatePayload(payload: unknown, ws: ServerWebSocket<WebSocket>) {
	const validHashesPayload =
		FetchCurrentClientProfilePictureHashPayloadSchema.safeParse(payload);

	if (!validHashesPayload.success) {
		ws.send(
			`Invalid fetch current client profile picture hash payload type. Type check not successful! ${JSON.stringify(
				payload
			)}`
		);
		console.error(
			"VALIDATION OF _FETCH_CURRENT_CLIENT_PROFILE_PICTURE_HASH_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
		);
		errorLogger.logError(
			"VALIDATION OF _FETCH_CURRENT_CLIENT_PROFILE_PICTURE_HASH_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
		);
		ws.close(
			1008,
			"Invalid fetch current client profile picture hash payload type. Type check not successful!"
		);
	}
	return validHashesPayload;
}

async function sendProfilePictureHashesToClients(
	payload: FetchCurrentClientProfilePictureHashPayload,
	ws: ServerWebSocket<WebSocket>
) {
	const profilePicture = await fetchProfilePicture(payload.clientDbId);
	if (profilePicture === null) {
		return;
	}

	const fetchCurrentClientProfilePictureHashPayload: FetchCurrentClientProfilePictureHashPayload =
		{
			clientProfilePictureHash: profilePicture.imageHash,
			clientDbId: payload.clientDbId,
			payloadType:
				PayloadSubTypeEnum.enum.fetchCurrentClientProfilePictureHash,
		};

	ws.send(JSON.stringify(fetchCurrentClientProfilePictureHashPayload));
}