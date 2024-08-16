import type { Server, ServerWebSocket } from "bun";
import {
	PayloadSubType,
	type ClientEntity,
	type ClientUpdatePayload,
	type ProfilePictureObject,
	type ClientListPayloadEnhanced,
} from "../../types/payloadTypes";
import {
	fetchProfilePicture,
	persistProfilePicture,
	retrieveAllRegisteredUsersFromDatabase,
	updateClientProfileInformation,
} from "../databaseHandler";
import { validateclientUpdatePayload } from "../typeHandler";
import { generateUnixTimestampFnv1aHash } from "../../helper/hashGenerator";
import { errorLogger } from "../../logger/errorLogger";
import { getVersionState } from "../../state/versionState.ts";

export async function profileUpdatePayloadHandlerV2(
	payloadFromClientAsObject: unknown,
	ws: ServerWebSocket<WebSocket>,
	server: Server
) {
	const validMessagePayload = validateclientUpdatePayload(
		payloadFromClientAsObject
	);

	if (!validMessagePayload) {
		ws.send("Invalid clientUpdatePayload type. Type check not successful!");
		ws.send(JSON.stringify(payloadFromClientAsObject));
		ws.close(
			1008,
			"Invalid clientUpdatePayload type. Type check not successful!"
		);
		return;
	}

	// fetch bot versions of pictures
	const payload = payloadFromClientAsObject as ClientUpdatePayload;
	const clientProfilePicture = await fetchProfilePicture(payload.clientDbId);

	// validate if the picture is the same as the one in the database
	if (payload.clientProfileImage) {
		if (
			clientProfilePicture === undefined ||
			clientProfilePicture === null ||
			clientProfilePicture.data === "" ||
			clientProfilePicture.data !== payload.clientProfileImage
		) {
			const profilePictureObject: ProfilePictureObject = {
				clientDbId: payload.clientDbId,
				imageHash: generateUnixTimestampFnv1aHash(),
				data: payload.clientProfileImage,
			};
			// persist the picture
			try {
				await persistProfilePicture(profilePictureObject);
			} catch (error) {
				errorLogger.logError(error);
				return;
			}

			// update the client profile picture hash
			payload.clientProfileImage = generateUnixTimestampFnv1aHash();

			// TODO inform all clients about the new picture
		}
	}

	try {
		await updateClientProfileInformation(payload);
	} catch (error) {
		errorLogger.logError(error);
		return;
	}

	const allUsers = await retrieveAllRegisteredUsersFromDatabase();
	if (allUsers === undefined || allUsers === null) {
		errorLogger.logError(new Error("No users found"));
		return;
	}

	const clientListPayload: ClientListPayloadEnhanced = {
		payloadType: PayloadSubType.clientList,
		// TODO validate this
		version: getVersionState(),
		clients: allUsers as ClientEntity[],
	};

	server.publish("the-group-chat", JSON.stringify(clientListPayload));
}

