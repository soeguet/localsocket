import type { Serve, Server, ServerWebSocket } from "bun";
import { type FetchAllProfilePicturesPayload, PayloadSubType } from "../../types/payloadTypes";
import { fetchAllProfilePictures } from "../databaseHandler";
import { validateFetchAllProfilePicturesPayload } from "../typeHandler";

export async function fetchAllProfilePicturesPayloadHandler(
	payloadFromClientAsObject: unknown,
	ws:ServerWebSocket<WebSocket>,
)
{

    const validatedFetchAllProfilePicturesPayload =
				validateFetchAllProfilePicturesPayload(
					payloadFromClientAsObject
				);

			if (!validatedFetchAllProfilePicturesPayload) {
				ws.send(
					`Invalid fetch all profile pictures payload type. Type check not successful! ${JSON.stringify(
						payloadFromClientAsObject
					)}`
				);
				console.error(
					"VALIDATION OF _FETCH_ALL_PROFILE_PICTURES_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
				);
				ws.close(
					1008,
					"Invalid fetch all profile pictures payload type. Type check not successful!"
				);
				return;
			}

			try {
				const allProfilePictures = await fetchAllProfilePictures();
				if (
					allProfilePictures === undefined ||
					allProfilePictures === null
				) {
					throw new Error("No profile pictures found");
				}

				const fetchAllProfilePicturesPayload: FetchAllProfilePicturesPayload =
					{
						payloadType: PayloadSubType.fetchAllProfilePictures,
						profilePictures: allProfilePictures,
					};

				ws.send(JSON.stringify(fetchAllProfilePicturesPayload));
			} catch (error) {
				console.error("Error fetching profile picture", error);
				return;
			}
}