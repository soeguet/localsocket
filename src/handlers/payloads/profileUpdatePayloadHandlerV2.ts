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

export async function profileUpdatePayloadHandlerV2(
	payloadFromClientAsObject: unknown,
	ws: ServerWebSocket<WebSocket>,
	server: Server
) {
	const validAuthPayload = validatePayload(payloadFromClientAsObject, ws);
	if (!validAuthPayload.success) {
		return;
	}

	const payload = payloadFromClientAsObject as ClientUpdatePayloadV2;
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
		payloadType: PayloadSubTypeEnum.enum.clientList,
		// TODO validate this
		version: getVersionState(),
		clients: allUsers as ClientEntity[],
	};

	server.publish("the-group-chat", JSON.stringify(clientListPayload));
}

function validatePayload(payload: unknown, ws: ServerWebSocket<WebSocket>) {
	const validAuthPayload = ClientUpdatePayloadV2Schema.safeParse(payload);

	if (!validAuthPayload.success) {
		ws.send(
			"Invalid authentication payload type. Type check not successful!"
		);
		console.error(
			"VALIDATION OF _AUTH_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
		);
		errorLogger.logError(
			"VALIDATION OF _AUTH_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
		);
		ws.close(
			1008,
			"Invalid authentication payload type. Type check not successful!"
		);
	}
	return validAuthPayload;
}