import type { ServerWebSocket } from "bun";
import {
	AuthenticationPayloadSchema,

} from "../../types/payloadTypes";
import { errorLogger } from "../../logger/errorLogger";

export async function fetchAllProfilePicturesPayloadHandler(
	payloadFromClientAsObject: unknown,
	ws: ServerWebSocket<WebSocket>
) {

	throw new Error("REVISIT IF NEEDED -- fetchAllProfilePicturesPayloadHandler");

	// const validAuthPayload = validatePayload(payloadFromClientAsObject, ws);
	// if (!validAuthPayload.success) {
	// 	return;
	// }
	//
	// const allProfilePictures = await fetchAllPictures();
	// if (allProfilePictures === null) {
	// 	return;
	// }
	//
	// const profilePictures: ProfilePictureObject[] = [];
	// for (const picture of allProfilePictures) {
	// 	profilePictures.push({
	// 		imageHash: picture.imageHash,
	// 		data: picture.data,
	// 	});
	// }
	//
	// const fetchAllProfilePicturesPayload: FetchAllProfilePicturesPayload = {
	// 	payloadType: PayloadSubTypeEnum.enum.fetchAllProfilePictures,
	// 	profilePictures: allProfilePictures,
	// };
	//
	// ws.send(JSON.stringify(fetchAllProfilePicturesPayload));
}

function validatePayload(payload: unknown, ws: ServerWebSocket<WebSocket>) {
	const validAuthPayload = AuthenticationPayloadSchema.safeParse(payload);

	if (!validAuthPayload.success) {
		ws.send(
			`Invalid fetch all profile pictures payload type. Type check not successful! ${JSON.stringify(
				payload
			)}`
		);
		console.error(
			"VALIDATION OF _FETCH_ALL_PROFILE_PICTURES_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
		);
		errorLogger.logError(
			"VALIDATION OF _FETCH_ALL_PROFILE_PICTURES_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
		);
		ws.close(
			1008,
			"Invalid fetch all profile pictures payload type. Type check not successful!"
		);
	}
	return validAuthPayload;
}