import type { Server, ServerWebSocket } from "bun";
import {
	type ClientEntity,
	type ClientListPayloadEnhanced,
	type ClientUpdatePayloadV2,
	PayloadSubTypeEnum,
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