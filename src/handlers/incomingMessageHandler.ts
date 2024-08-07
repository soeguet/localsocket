import type { Server, ServerWebSocket } from "bun";
import {
	PayloadSubType,
	type ErrorLog,
	type SimplePayload,
} from "../types/payloadTypes";
import {
	checkForDatabaseErrors,
	persistErrorLogInDatabase,
} from "./databaseHandler";
import { authPayloadHandler } from "./payloads/authPayloadHandler";
import { clientListPayloadHandler } from "./payloads/clientListPayloadHandler";
import { deletePayloadHandler } from "./payloads/deletePayloadHandler";
import { editPayloadHandler } from "./payloads/editPayloadHandler";
import { emergencyInitPayloadHandler } from "./payloads/emergencyInitPayloadHandler";
import { emergencyMessagePayloadHandler } from "./payloads/emergencyMessagePayloadHandler";
import { fetchAllProfilePicturesPayloadHandler } from "./payloads/fetchAllProfilePicturesPayloadHandler";
import { fetchCurrentClientProfilePictureHashPayloadHandler } from "./payloads/fetchCurrentClientProfilePictureHashPayloadHandler";
import { fetchProfilePicturePayloadHandler } from "./payloads/fetchProfilePicturePayloadHandler";
import { messageListPayloadHandler } from "./payloads/messageListPayloadHandler";
import { messagePayloadHandler } from "./payloads/messagePayloadHandler";
import { newProfilePictureHandler } from "./payloads/newProfilePicturePayloadHandler";
import { profileUpdatePayloadHandler } from "./payloads/profileUpdatePayloadHandler";
import { profileUpdatePayloadHandlerV2 } from "./payloads/profileUpdatePayloadHandlerV2";
import { reactionPayloadHandler } from "./payloads/reactionPayloadHandler";
import { fetchAllBannersPayloadHandler } from "./payloads/fetchAllBannersPayloadHandler";
import { modifyBannerPayloadHandler } from "./payloads/modifyBannerPayloadHandler";
import { fetchAllProfilePictureHashesPayloadHandler } from "./payloads/fetchAllProfilePictureHashesPayloadHandler";
import { validateErrorLogPayload } from "./typeHandler";
import { errorLogger } from "../logger/errorLogger";

function validateSimplePayload(payload: unknown): payload is SimplePayload {
	return (payload as SimplePayload).payloadType !== undefined;
}

export async function processErrorLog(errorLog: Request) {
	const errorLogObject = await errorLog.json();

	const validatedErrorLog = validateErrorLogPayload(errorLogObject);
	if (validatedErrorLog === false) {
		errorLogger.logError(new Error("Error validating error log payload"));
	}

	const payload = errorLogObject as ErrorLog;

	await persistErrorLogInDatabase(payload);
}

function parseInitialPayload(message: string, ws: ServerWebSocket<WebSocket>) {
	try {
		return JSON.parse(message);
	} catch (error) {
		errorLogger.logError(error);
		ws.send(
			"Error parsing message from client. Please check the message and try again. Probably not a JSON object."
		);
		ws.close(1008, "Error parsing message from client.");
	}
}

export async function processIncomingMessage(
	ws: ServerWebSocket<WebSocket>,
	server: Server,
	message: string
) {
	const messageAsString = checkForDatabaseErrors(message);
	const payloadFromClientAsUnknownObject = parseInitialPayload(
		message,
		ws
	) as unknown;

	if (!validateSimplePayload(payloadFromClientAsUnknownObject)) {
		return;
	}

	// switch part
	switch (payloadFromClientAsUnknownObject.payloadType) {
		case PayloadSubType.auth: {
			// PayloadSubType.auth == 0
			await authPayloadHandler(
				payloadFromClientAsUnknownObject,
				ws,
				server
			);
			break;
		}

		case PayloadSubType.message: {
			// PayloadSubType.message == 1
			await messagePayloadHandler(
				payloadFromClientAsUnknownObject,
				ws,
				server
			);
			break;
		}

		case PayloadSubType.clientList: {
			// PayloadSubType.clientList == 2
			await clientListPayloadHandler(server);
			break;
		}

		case PayloadSubType.profileUpdate: {
			// PayloadSubType.profileUpdate == 3
			await profileUpdatePayloadHandler(
				payloadFromClientAsUnknownObject,
				ws,
				server
			);
			break;
		}

		case PayloadSubType.profileUpdateV2: {
			// PayloadSubType.profileUpdateV2 == 17
			await profileUpdatePayloadHandlerV2(
				payloadFromClientAsUnknownObject,
				ws,
				server
			);
			break;
		}

		case PayloadSubType.messageList: {
			// PayloadSubType.messageList == 4
			await messageListPayloadHandler(ws);
			break;
		}

		case PayloadSubType.typing:
		case PayloadSubType.force: {
			// PayloadSubType.typing == 5
			// PayloadSubType.force == 6
			server.publish("the-group-chat", messageAsString);
			break;
		}

		case PayloadSubType.reaction: {
			// PayloadSubType.reaction == 7
			await reactionPayloadHandler(
				payloadFromClientAsUnknownObject,
				ws,
				server
			);
			break;
		}

		case PayloadSubType.delete: {
			// PayloadSubType.delete == 8
			await deletePayloadHandler(
				payloadFromClientAsUnknownObject,
				ws,
				server
			);
			break;
		}

		case PayloadSubType.edit: {
			// PayloadSubType.edit == 9
			await editPayloadHandler(
				payloadFromClientAsUnknownObject,
				ws,
				server
			);
			break;
		}

		case PayloadSubType.emergencyInit: {
			// PayloadSubType.emergencyInit == 10
			await emergencyInitPayloadHandler(
				payloadFromClientAsUnknownObject,
				message,
				ws,
				server
			);
			break;
		}

		case PayloadSubType.emergencyMessage: {
			// PayloadSubType.emergencyMessage == 11
			await emergencyMessagePayloadHandler(
				payloadFromClientAsUnknownObject,
				ws,
				server
			);
			break;
		}

		case PayloadSubType.newProfilePicture: {
			// PayloadSubType.newProfilePicture == 13
			await newProfilePictureHandler(
				payloadFromClientAsUnknownObject,
				ws,
				server
			);
			break;
		}

		case PayloadSubType.fetchProfilePicture: {
			// PayloadSubType.fetchProfilePicture == 14
			await fetchProfilePicturePayloadHandler(
				payloadFromClientAsUnknownObject,
				ws
			);
			break;
		}

		case PayloadSubType.fetchAllProfilePictures: {
			// PayloadSubType.fetchAllProfilePictures == 15
			await fetchAllProfilePicturesPayloadHandler(
				payloadFromClientAsUnknownObject,
				ws
			);
			break;
		}

		case PayloadSubType.fetchAllProfilePictureHashes: {
			// PayloadSubType.fetchAllProfilePictureHashes == 20
			await fetchAllProfilePictureHashesPayloadHandler(ws);
			break;
		}

		case PayloadSubType.fetchCurrentClientProfilePictureHash: {
			// PayloadSubType.fetchCurrentClientProfilePictureHash == 16
			await fetchCurrentClientProfilePictureHashPayloadHandler(
				payloadFromClientAsUnknownObject,
				ws
			);
			break;
		}

		case PayloadSubType.fetchAllBanners: {
			// PayloadSubType.fetchAllBanners == 18
			await fetchAllBannersPayloadHandler(server);
			break;
		}

		case PayloadSubType.modifyBanner: {
			// PayloadSubType.modifyBanner == 19
			await modifyBannerPayloadHandler(
				payloadFromClientAsUnknownObject,
				ws
			);
			// send back the banner list after updating the banner list
			await fetchAllBannersPayloadHandler(server);
			break;
		}

		default: {
			ws.send(
				"SWITCH CASES: Invalid message payload type. Type check not successful!"
			);
			console.error("switch messageType default");
			console.error("messageAsString", messageAsString);
			errorLogger.logError(
				"Invalid message payload type. Type check not successful! switch case fallthrough!"
			);
			ws.close(
				1008,
				"Invalid message payload type. Type check not successful!"
			);
			break;
		}
	}
}
