import type { Server, ServerWebSocket } from "bun";
import { validateNewProfilePicturePayload } from "../typeHandler";
import { type NewProfilePicturePayload } from "../../types/payloadTypes";
import {
	persistProfilePicture,
	persistProfilePictureHashForClient,
} from "../databaseHandler";
import { errorLogger } from "../../logger/errorLogger";

const errorMessage =
	"Invalid new profile picture payload type. Type check not successful!";

async function sendErrorResponse(
	ws: ServerWebSocket<WebSocket>,
	payload: unknown
) {
	const payloadAsString = JSON.stringify(payload);
	ws.send(`${errorMessage} ${payloadAsString}`);
	console.error(
		`VALIDATION OF NEW_PROFILE_PICTURE PAYLOAD FAILED: ${payloadAsString}`
	);
	errorLogger.logError(
		`VALIDATION OF NEW_PROFILE_PICTURE PAYLOAD FAILED: ${payloadAsString}`
	);
	ws.close(1008, errorMessage);
}

export async function newProfilePictureHandler(
	payloadFromClientAsObject: unknown,
	ws: ServerWebSocket<WebSocket>,
	server: Server
) {
	if (!validateNewProfilePicturePayload(payloadFromClientAsObject)) {
		await sendErrorResponse(ws, payloadFromClientAsObject);
		return;
	}

	const payload = payloadFromClientAsObject as NewProfilePicturePayload;

	try {
		await persistProfilePicture(payload);
	} catch (error) {
		console.error("Error persisting profile picture", error);
		errorLogger.logError(error);
		return;
	}

	// persist image hash for client
	try {
		await persistProfilePictureHashForClient(
			payload.clientDbId,
			payload.imageHash
		);
	} catch (error) {
		errorLogger.logError(error);
		return;
	}

	server.publish("the-group-chat", JSON.stringify(payload));
}

