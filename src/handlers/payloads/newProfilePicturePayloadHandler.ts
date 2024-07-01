import type { Serve, Server, ServerWebSocket } from "bun";
import { validateNewProfilePicturePayload } from "../typeHandler";
import {
	type NewProfilePicturePayload,
	PayloadSubType,
} from "../../types/payloadTypes";
import { persistProfilePicture } from "../databaseHandler";

export async function newProfilePictureHandler(
	payloadFromClientAsObject: unknown,
	ws: ServerWebSocket<WebSocket>,
	server: Server
) {
	const validatedNewProfilePicturePayload = validateNewProfilePicturePayload(
		payloadFromClientAsObject
	);

	if (!validatedNewProfilePicturePayload) {
		ws.send(
			`Invalid new profile picture payload type. Type check not successful! ${JSON.stringify(
				payloadFromClientAsObject
			)}`
		);
		console.error(
			"VALIDATION OF _NEW_PROFILE_PICTURE_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
		);
		ws.close(
			1008,
			"Invalid new profile picture payload type. Type check not successful!"
		);
		return;
	}

	const payload = payloadFromClientAsObject as NewProfilePicturePayload;

	try {
		await persistProfilePicture(payload);
	} catch (error) {
		console.error("Error persisting profile picture", error);
		return;
	}

	const updatedProfilePicturePayload: NewProfilePicturePayload = {
		...payload,
		payloadType: PayloadSubType.newProfilePicture,
	};

	server.publish(
		"the-group-chat",
		JSON.stringify(updatedProfilePicturePayload)
	);
}
