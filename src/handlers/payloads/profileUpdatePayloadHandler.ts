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

export async function profileUpdatePayloadHandler(
	payloadFromClientAsObject: unknown,
	ws: ServerWebSocket<WebSocket>,
	server: Server
) {
	const validMessagePayload = validateclientUpdatePayload(
		payloadFromClientAsObject
	);

	if (!validMessagePayload) {
		console.error(
			"VALIDATION OF _CLIENT_UPDATE_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
		);
		errorLogger.logError(
			"VALIDATION OF _CLIENT_UPDATE_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
		);
		ws.send("Invalid clientUpdatePayload type. Type check not successful!");
		ws.send(JSON.stringify(payloadFromClientAsObject));
		ws.close(
			1008,
			"Invalid clientUpdatePayload type. Type check not successful!"
		);
		return;
	}

	const payload = payloadFromClientAsObject as ClientUpdatePayload;

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
		version: getVersionState(),
		// TODO validate this
		clients: allUsers as ClientEntity[],
	};
	console.log("clientListPayload", clientListPayload);

	server.publish("the-group-chat", JSON.stringify(clientListPayload));
}

