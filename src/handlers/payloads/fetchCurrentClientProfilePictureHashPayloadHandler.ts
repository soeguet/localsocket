import type { ServerWebSocket } from "bun";
import { type FetchCurrentClientProfilePictureHashPayload, PayloadSubType } from "../../types/payloadTypes";
import { fetchProfilePicture } from "../databaseHandler";
import { validateFetchCurrentClientProfilePictureHashPayload } from "../typeHandler";

export async function fetchCurrentClientProfilePictureHashPayloadHandler(
	payloadFromClientAsObject: unknown,
	ws: ServerWebSocket<WebSocket>,
)
{
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
				ws.close(
					1008,
					"Invalid fetch current client profile picture hash payload type. Type check not successful!"
				);
				return;
			}

			const payload =
				payloadFromClientAsObject as FetchCurrentClientProfilePictureHashPayload;

			try {
				const profilePicture = await fetchProfilePicture(
					payload.clientDbId
				);
				if (profilePicture === undefined || profilePicture === null) {
					throw new Error("No profile picture found");
				}

				const fetchCurrentClientProfilePictureHashPayload: FetchCurrentClientProfilePictureHashPayload =
					{
						clientProfilePictureHash: profilePicture.imageHash,
						clientDbId: payload.clientDbId,
						payloadType:
							PayloadSubType.fetchCurrentClientProfilePictureHash,
					};

				ws.send(
					JSON.stringify(fetchCurrentClientProfilePictureHashPayload)
				);
			} catch (error) {
				console.error("Error fetching profile picture", error);
				return;
			}
}