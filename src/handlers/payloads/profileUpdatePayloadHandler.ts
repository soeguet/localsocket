import type { Server, ServerWebSocket } from "bun";
import {
	PayloadSubType,
	type ClientEntity,
	type ClientListPayload,
	type ClientUpdatePayload,
} from "../../types/payloadTypes";
import {
	retrieveAllRegisteredUsersFromDatabase,
	updateClientProfileInformation,
} from "../databaseHandler";
import { validateclientUpdatePayload } from "../typeHandler";
import { errorLogger } from "../../logger/errorLogger";

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

	const clientListPayload: ClientListPayload = {
		payloadType: PayloadSubType.clientList,
		// TODO validate this
		clients: allUsers as ClientEntity[],
	};

	server.publish("the-group-chat", JSON.stringify(clientListPayload));
}
