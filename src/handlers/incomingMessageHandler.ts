import type { Server, ServerWebSocket } from "bun";
import {
	ErrorLogSchema,
	type PayloadSubType,
	PayloadSubTypeEnum, type SimplePayload,
} from "../types/payloadTypes";
import {
	checkForDatabaseErrors, persistErrorLogInDatabase,
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
import { profileUpdatePayloadHandlerV2 } from "./payloads/profileUpdatePayloadHandlerV2";
import { reactionPayloadHandler } from "./payloads/reactionPayloadHandler";
import { fetchAllBannersPayloadHandler } from "./payloads/fetchAllBannersPayloadHandler";
import { modifyBannerPayloadHandler } from "./payloads/modifyBannerPayloadHandler";
import { fetchAllProfilePictureHashesPayloadHandler } from "./payloads/fetchAllProfilePictureHashesPayloadHandler";
import { errorLogger } from "../logger/errorLogger";
import type { ErrorLog } from "@prisma/client";

function validateSimplePayload(payload: unknown): payload is SimplePayload {
	return (payload as SimplePayload).payloadType !== undefined;
}

export async function processErrorLog(errorLog: Request) {
	const errorLogObject = await errorLog.json();

	const validatedErrorLog = ErrorLogSchema.safeParse(errorLogObject);
	if (!validatedErrorLog.success) {
		errorLogger.logError(new Error("Error validating error log payload"));
		return
	}

	await persistErrorLogInDatabase(validatedErrorLog.data as ErrorLog);
}

async function parseInitialPayload(
	message: string,
	ws: ServerWebSocket<WebSocket>
) {
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
	const messageAsString = await checkForDatabaseErrors(message);
	const payloadFromClientAsUnknownObject = (await parseInitialPayload(
		message,
		ws
	)) as unknown;

	if (!validateSimplePayload(payloadFromClientAsUnknownObject)) {
		return;
	}

	// switch part
	switch (payloadFromClientAsUnknownObject.payloadType as PayloadSubType) {
		case PayloadSubTypeEnum.enum.auth: {
			// PayloadSubTypeEnum.enum.auth == 0
			await authPayloadHandler(
				payloadFromClientAsUnknownObject,
				ws,
				server
			);
			break;
		}

		case PayloadSubTypeEnum.enum.message: {
			// PayloadSubTypeEnum.enum.message == 1
			await messagePayloadHandler(
				payloadFromClientAsUnknownObject,
				ws,
				server
			);
			break;
		}

		case PayloadSubTypeEnum.enum.clientList: {
			// PayloadSubTypeEnum.enum.clientList == 2
			await clientListPayloadHandler(server);
			break;
		}

		case PayloadSubTypeEnum.enum.profileUpdate: {
			throw new Error("ProfileUpdate !old! not implemented");
			// PayloadSubTypeEnum.enum.profileUpdate == 3

			// await profileUpdatePayloadHandler(
			// 	payloadFromClientAsUnknownObject,
			// 	ws,
			// 	server
			// );
			// break;
		}

		case PayloadSubTypeEnum.enum.profileUpdateV2: {
			// PayloadSubTypeEnum.enum.profileUpdateV2 == 17
			await profileUpdatePayloadHandlerV2(
				payloadFromClientAsUnknownObject,
				ws,
				server
			);
			break;
		}

		case PayloadSubTypeEnum.enum.messageList: {
			// PayloadSubTypeEnum.enum.messageList == 4
			await messageListPayloadHandler(ws);
			break;
		}

		case PayloadSubTypeEnum.enum.typing:
		case PayloadSubTypeEnum.enum.force: {
			// PayloadSubTypeEnum.enum.typing == 5
			// PayloadSubTypeEnum.enum.force == 6
			server.publish("the-group-chat", messageAsString);
			break;
		}

		case PayloadSubTypeEnum.enum.reaction: {
			// PayloadSubTypeEnum.enum.reaction == 7
			await reactionPayloadHandler(
				payloadFromClientAsUnknownObject,
				ws,
				server
			);
			break;
		}

		case PayloadSubTypeEnum.enum.delete: {
			// PayloadSubTypeEnum.enum.delete == 8
			await deletePayloadHandler(
				payloadFromClientAsUnknownObject,
				ws,
				server
			);
			break;
		}

		case PayloadSubTypeEnum.enum.edit: {
			// PayloadSubTypeEnum.enum.edit == 9
			await editPayloadHandler(
				payloadFromClientAsUnknownObject,
				ws,
				server
			);
			break;
		}

		case PayloadSubTypeEnum.enum.emergencyInit: {
			// PayloadSubTypeEnum.enum.emergencyInit == 10
			await emergencyInitPayloadHandler(
				payloadFromClientAsUnknownObject,
				message,
				ws,
				server
			);
			break;
		}

		case PayloadSubTypeEnum.enum.emergencyMessage: {
			// PayloadSubTypeEnum.enum.emergencyMessage == 11
			await emergencyMessagePayloadHandler(
				payloadFromClientAsUnknownObject,
				ws,
				server
			);
			break;
		}

		case PayloadSubTypeEnum.enum.newProfilePicture: {
			// PayloadSubTypeEnum.enum.newProfilePicture == 13
			await newProfilePictureHandler(
				payloadFromClientAsUnknownObject,
				ws,
				server
			);
			break;
		}

		case PayloadSubTypeEnum.enum.fetchProfilePicture: {
			// PayloadSubTypeEnum.enum.fetchProfilePicture == 14
			await fetchProfilePicturePayloadHandler(
				payloadFromClientAsUnknownObject,
				ws
			);
			break;
		}

		case PayloadSubTypeEnum.enum.fetchAllProfilePictures: {
			// PayloadSubTypeEnum.enum.fetchAllProfilePictures == 15
			await fetchAllProfilePicturesPayloadHandler(
				payloadFromClientAsUnknownObject,
				ws
			);
			break;
		}

		case PayloadSubTypeEnum.enum.fetchAllProfilePictureHashes: {
			// PayloadSubTypeEnum.enum.fetchAllProfilePictureHashes == 20
			await fetchAllProfilePictureHashesPayloadHandler(ws);
			break;
		}

		case PayloadSubTypeEnum.enum.fetchCurrentClientProfilePictureHash: {
			// PayloadSubTypeEnum.enum.fetchCurrentClientProfilePictureHash == 16
			await fetchCurrentClientProfilePictureHashPayloadHandler(
				payloadFromClientAsUnknownObject,
				ws
			);
			break;
		}

		case PayloadSubTypeEnum.enum.fetchAllBanners: {
			// PayloadSubTypeEnum.enum.fetchAllBanners == 18
			await fetchAllBannersPayloadHandler(server);
			break;
		}

		case PayloadSubTypeEnum.enum.modifyBanner: {
			// PayloadSubTypeEnum.enum.modifyBanner == 19
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