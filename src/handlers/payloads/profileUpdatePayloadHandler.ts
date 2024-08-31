import type { Server, ServerWebSocket } from "bun";
import {
	type ClientEntity,
	type ClientListPayloadEnhanced,
	type ClientUpdatePayloadV2, ClientUpdatePayloadV2Schema,
	PayloadSubTypeEnum,
} from "../../types/payloadTypes";
import {
	retrieveAllRegisteredUsersFromDatabase,
	updateClientProfileInformation,
} from "../databaseHandler";
import { errorLogger } from "../../logger/errorLogger";
import { getVersionState } from "../../state/versionState.ts";

export async function profileUpdatePayloadHandler(
	payloadFromClientAsObject: unknown,
	ws: ServerWebSocket<WebSocket>,
	server: Server
) {
	const validAuthPayload = validatePayload(payloadFromClientAsObject, ws);
	if (!validAuthPayload.success) {
		return;
	}

	await updateClientProfileInformation(
		payloadFromClientAsObject as ClientUpdatePayloadV2
	);

	await sendClientListPayloadToClients(server);
}


async function sendClientListPayloadToClients(server: Server) {
	const allUsers = await retrieveAllRegisteredUsersFromDatabase();

	const clientListPayload: ClientListPayloadEnhanced = {
		payloadType: PayloadSubTypeEnum.enum.clientList,
		version: getVersionState(),
		// TODO validate this
		clients: allUsers as ClientEntity[],
	};

	server.publish("the-group-chat", JSON.stringify(clientListPayload));
}

function validatePayload(payload: unknown, ws: ServerWebSocket<WebSocket>) {
	// TODO is this right
	const validAuthPayload = ClientUpdatePayloadV2Schema.safeParse(payload);

	if (!validAuthPayload.success) {
		console.error(
			"VALIDATION OF _CLIENT_UPDATE_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
		);
		errorLogger.logError(
			"VALIDATION OF _CLIENT_UPDATE_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
		);
		ws.send("Invalid clientUpdatePayload type. Type check not successful!");
		ws.send(JSON.stringify(payload));
		ws.close(
			1008,
			"Invalid clientUpdatePayload type. Type check not successful!"
		);
	}
	return validAuthPayload;
}