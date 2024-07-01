import type { Server, ServerWebSocket } from "bun";
import { PayloadSubType, type SimplePayload } from "../types/payloadTypes";
import { checkForDatabaseErrors } from "./databaseHandler";
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

function validateSimplePayload(payload: unknown): payload is SimplePayload {
	return (payload as SimplePayload).payloadType !== undefined;
}

function parseInitialPayload(message: string, ws: ServerWebSocket<WebSocket>) {
	try {
		return JSON.parse(message);
	} catch (error) {
		console.error(
			"Error parsing message from client. Please check the message and try again. Probably not a JSON object.",
			error
		);
		ws.send(
			"Error parsing message from client. Please check the message and try again. Probably not a JSON object."
		);
		ws.close(1008, "Error parsing message from client.");
		throw new Error("Error parsing message from client.");
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
			messageListPayloadHandler(ws);
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
			reactionPayloadHandler(
				payloadFromClientAsUnknownObject,
				ws,
				server
			);
			break;
		}

		case PayloadSubType.delete: {
			// PayloadSubType.delete == 8
			deletePayloadHandler(payloadFromClientAsUnknownObject, ws, server);
			break;
		}

		case PayloadSubType.edit: {
			// PayloadSubType.edit == 9
			editPayloadHandler(payloadFromClientAsUnknownObject, ws, server);
			break;
		}

		case PayloadSubType.emergencyInit: {
			// PayloadSubType.emergencyInit == 10
			emergencyInitPayloadHandler(
				payloadFromClientAsUnknownObject,
				message,
				ws,
				server
			);
			break;
		}

		case PayloadSubType.emergencyMessage: {
			// PayloadSubType.emergencyMessage == 11
			emergencyMessagePayloadHandler(
				payloadFromClientAsUnknownObject,
				ws,
				server
			);
			break;
		}

		case PayloadSubType.newProfilePicture: {
			// PayloadSubType.newProfilePicture == 13
			newProfilePictureHandler(
				payloadFromClientAsUnknownObject,
				ws,
				server
			);
			break;
		}

		case PayloadSubType.fetchProfilePicture: {
			// PayloadSubType.fetchProfilePicture == 14
			fetchProfilePicturePayloadHandler(
				payloadFromClientAsUnknownObject,
				ws
			);
			break;
		}

		case PayloadSubType.fetchAllProfilePictures: {
			// PayloadSubType.fetchAllProfilePictures == 15
			fetchAllProfilePicturesPayloadHandler(
				payloadFromClientAsUnknownObject,
				ws
			);
			break;
		}

		case PayloadSubType.fetchCurrentClientProfilePictureHash: {
			// PayloadSubType.fetchCurrentClientProfilePictureHash == 16
			fetchCurrentClientProfilePictureHashPayloadHandler(
				payloadFromClientAsUnknownObject,
				ws
			);
			break;
		}

		default: {
			ws.send(
				"SWITCH CASES: Invalid message payload type. Type check not successful!"
			);
			console.error("switch messageType default");
			console.error("messageAsString", messageAsString);
			ws.close(
				1008,
				"Invalid message payload type. Type check not successful!"
			);
			break;
		}
	}
}
