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

export async function processIncomingMessage(
	ws: ServerWebSocket<WebSocket>,
	server: Server,
	message: string | Buffer
) {
	// some random checks on message & database
	const messageAsString = checkForDatabaseErrors(message) as string;

	let payloadFromClientAsObject: unknown;

	try {
		payloadFromClientAsObject = JSON.parse(messageAsString);
	} catch (error) {
		console.error(
			"Error parsing message from client. Please check the message and try again. Probably not a JSON object.",
			error
		);
		ws.send(
			"Error parsing message from client. Please check the message and try again. Probably not a JSON object."
		);
		ws.close(1008, "Error parsing message from client.");
		return;
	}

	if (!validateSimplePayload(payloadFromClientAsObject)) {
		return;
	}

	// switch part
	switch (payloadFromClientAsObject.payloadType) {
		case PayloadSubType.auth: {
			// PayloadSubType.auth == 0
			await authPayloadHandler(payloadFromClientAsObject, ws, server);
			break;
		}

		case PayloadSubType.message: {
			// PayloadSubType.message == 1
			await messagePayloadHandler(payloadFromClientAsObject, ws, server);
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
				payloadFromClientAsObject,
				ws,
				server
			);
			break;
		}

		case PayloadSubType.profileUpdateV2: {
			// PayloadSubType.profileUpdateV2 == 17
			await profileUpdatePayloadHandlerV2(
				payloadFromClientAsObject,
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
			reactionPayloadHandler(payloadFromClientAsObject, ws, server);
			break;
		}

		case PayloadSubType.delete: {
			// PayloadSubType.delete == 8
			deletePayloadHandler(payloadFromClientAsObject, ws, server);
			break;
		}

		case PayloadSubType.edit: {
			// PayloadSubType.edit == 9
			editPayloadHandler(payloadFromClientAsObject, ws, server);
			break;
		}

		case PayloadSubType.emergencyInit: {
			// PayloadSubType.emergencyInit == 10
			emergencyInitPayloadHandler(
				payloadFromClientAsObject,
				message,
				ws,
				server
			);
			break;
		}

		case PayloadSubType.emergencyMessage: {
			// PayloadSubType.emergencyMessage == 11
			emergencyMessagePayloadHandler(
				payloadFromClientAsObject,
				ws,
				server
			);
			break;
		}

		case PayloadSubType.newProfilePicture: {
			// PayloadSubType.newProfilePicture == 13
			newProfilePictureHandler(payloadFromClientAsObject, ws, server);
			break;
		}

		case PayloadSubType.fetchProfilePicture: {
			// PayloadSubType.fetchProfilePicture == 14
			fetchProfilePicturePayloadHandler(payloadFromClientAsObject, ws);
			break;
		}

		case PayloadSubType.fetchAllProfilePictures: {
			// PayloadSubType.fetchAllProfilePictures == 15
			fetchAllProfilePicturesPayloadHandler(
				payloadFromClientAsObject,
				ws
			);
			break;
		}

		case PayloadSubType.fetchCurrentClientProfilePictureHash: {
			// PayloadSubType.fetchCurrentClientProfilePictureHash == 16
			fetchCurrentClientProfilePictureHashPayloadHandler(
				payloadFromClientAsObject,
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
