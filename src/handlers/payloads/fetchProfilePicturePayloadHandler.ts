import type { ServerWebSocket } from "bun";

import { fetchProfilePicture } from "../databaseHandler";
import { errorLogger } from "../../logger/errorLogger";
import {
	type FetchProfilePicturePayload,
	FetchProfilePicturePayloadSchema,
	PayloadSubTypeEnum,
} from "../../types/payloadTypes.ts";

export async function fetchProfilePicturePayloadHandler(
	payloadFromClientAsObject: unknown,
	ws: ServerWebSocket<WebSocket>
) {
	const validAuthPayload = validatePayload(payloadFromClientAsObject, ws);
	if (!validAuthPayload.success) {
		return;
	}

	await sendProfilePicturePayloadToClients(validAuthPayload.data, ws);
}

async function sendProfilePicturePayloadToClients(
	payload: FetchProfilePicturePayload,
	ws: ServerWebSocket<WebSocket>
) {
	const profilePicture = await fetchProfilePicture(payload.clientDbId);
	if (profilePicture === null) {
		return;
	}
	const fetchProfilePicturePayload = {
		...profilePicture,
		payloadType: PayloadSubTypeEnum.enum.fetchProfilePicture,
	};

	ws.send(JSON.stringify(fetchProfilePicturePayload));
}

function validatePayload(payload: unknown, ws: ServerWebSocket<WebSocket>) {
	const validAuthPayload =
		FetchProfilePicturePayloadSchema.safeParse(payload);

	if (!validAuthPayload.success) {
		ws.send(
			`Invalid fetch profile picture payload type. Type check not successful! ${JSON.stringify(
				validAuthPayload
			)}`
		);
		console.error(
			"VALIDATION OF _FETCH_PROFILE_PICTURE_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
		);
		errorLogger.logError(
			"VALIDATION OF _FETCH_PROFILE_PICTURE_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
		);
		ws.close(
			1008,
			"Invalid fetch profile picture payload type. Type check not successful!"
		);
	}
	return validAuthPayload;
}