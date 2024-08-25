import type { Server, ServerWebSocket } from "bun";
import {
	PayloadSubType,
	type ClientEntity,
	type ClientUpdatePayload,
	type ClientListPayloadEnhanced,
} from "../../types/payloadTypes";
import {
	retrieveAllRegisteredUsersFromDatabase,
	updateClientProfileInformation,
} from "../databaseHandler";
import { validateclientUpdatePayload } from "../typeHandler";
import { errorLogger } from "../../logger/errorLogger";
import { getVersionState } from "../../state/versionState.ts";

export async function profileUpdatePayloadHandlerV2(
	payloadFromClientAsObject: unknown,
	ws: ServerWebSocket<WebSocket>,
	server: Server
) {
	const validation = profileUpdatePayloadHandlerV2Validation(
		ws,
		payloadFromClientAsObject
	);
	if (!validation) {
		return;
	}

	// TODO check if this method is viable
	// const payload = await processProfileUpdatePayload(
	// 	payloadFromClientAsObject
	// );
	const payload = payloadFromClientAsObject as ClientUpdatePayload;
	await updateClientProfileInformation(payload);
	await sendRegisteredUserListToClients(server);
}

async function sendRegisteredUserListToClients(server: Server) {
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

function profileUpdatePayloadHandlerV2Validation(
	ws: ServerWebSocket<WebSocket>,
	payloadFromClientAsObject: unknown
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
		return false;
	}
	return true;
}

async function processProfileUpdatePayload(
	payloadFromClientAsObject: unknown
): Promise<ClientUpdatePayload> {
	// fetch both versions of pictures
	const payload = payloadFromClientAsObject as ClientUpdatePayload;


	/// THIS CANNOT WORK - need to send picture seperately since only the hash is sent
	///
	// const clientProfilePicture = await fetchProfilePicture(payload.clientDbId);
	//
	// // early returns
	// if (!payload.clientProfilePictureHash) {
	// 	return payload;
	// }
	//
	// if (clientProfilePicture === null || clientProfilePicture.data === "") {
	// 	return payload;
	// }
	//
	// if (clientProfilePicture.data === payload.clientProfilePictureHash) {
	// 	return payload;
	// }
	//
	// const profilePictureObject: ProfilePictureObject = {
	// 	clientDbId: payload.clientDbId,
	// 	imageHash: payload.clientProfilePictureHash,
	// 	data: payload.clientProfilePictureHash,
	// };
	// // persist the picture
	// try {
	// 	await persistProfilePicture(profilePictureObject);
	// } catch (error) {
	// 	errorLogger.logError(error);
	// }
	//
	// // update the client profile picture hash
	// //payload.clientProfilePictureHash = generateUnixTimestampFnv1aHash();
	//
	// // TODO inform all clients about the new picture

	return payload;
}