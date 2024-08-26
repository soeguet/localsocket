import type { ServerWebSocket } from "bun";

import { fetchProfilePicture } from "../databaseHandler";
import { validateFetchProfilePicturePayload } from "../typeHandler";
import { errorLogger } from "../../logger/errorLogger";
import { type FetchProfilePicturePayload, PayloadSubTypeEnum } from "../../types/payloadTypes.ts";

export async function fetchProfilePicturePayloadHandler(
	payloadFromClientAsObject: unknown,
	ws: ServerWebSocket<WebSocket>
) {
	const validatedFetchProfilePicturePayload =
		validateFetchProfilePicturePayload(payloadFromClientAsObject);

	if (!validatedFetchProfilePicturePayload) {
		ws.send(
			`Invalid fetch profile picture payload type. Type check not successful! ${JSON.stringify(
				payloadFromClientAsObject
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
		return;
	}

	const payload = payloadFromClientAsObject as FetchProfilePicturePayload;

	try {
		const profilePicture = await fetchProfilePicture(payload.clientDbId);
		if (profilePicture === undefined || profilePicture === null) {
			errorLogger.logError(new Error("No profile picture found"));
			return;
		}

		const fetchProfilePicturePayload = {
			...profilePicture,
			payloadType: PayloadSubTypeEnum.enum.fetchProfilePicture,
		};

		ws.send(JSON.stringify(fetchProfilePicturePayload));
	} catch (error) {
		errorLogger.logError(error);
	}
}