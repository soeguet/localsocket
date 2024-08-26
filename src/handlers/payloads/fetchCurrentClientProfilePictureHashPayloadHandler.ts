import type { ServerWebSocket } from "bun";

import { fetchProfilePicture } from "../databaseHandler";
import { validateFetchCurrentClientProfilePictureHashPayload } from "../typeHandler";
import { errorLogger } from "../../logger/errorLogger";
import { type FetchCurrentClientProfilePictureHashPayload, PayloadSubTypeEnum } from "../../types/payloadTypes.ts";

export async function fetchCurrentClientProfilePictureHashPayloadHandler(
	payloadFromClientAsObject: unknown,
	ws: ServerWebSocket<WebSocket>
) {
	const validatedFetchCurrentClientProfilePictureHashPayload =
		validateFetchCurrentClientProfilePictureHashPayload(
			payloadFromClientAsObject
		);

	if (!validatedFetchCurrentClientProfilePictureHashPayload) {
		ws.send(
			`Invalid fetch current client profile picture hash payload type. Type check not successful! ${JSON.stringify(
				payloadFromClientAsObject
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
		return;
	}

	const payload =
		payloadFromClientAsObject as FetchCurrentClientProfilePictureHashPayload;

	try {
		const profilePicture = await fetchProfilePicture(payload.clientDbId);
		if (profilePicture === undefined || profilePicture === null) {
			errorLogger.logError(new Error("No profile picture found"));
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
	} catch (error) {
		errorLogger.logError(error);
		return;
	}
}