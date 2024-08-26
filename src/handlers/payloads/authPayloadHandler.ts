import type { Server, ServerWebSocket } from "bun";
import {
	AuthenticationPayloadSchema,
	type ClientEntity,
	type ClientListPayloadEnhanced,
	PayloadSubTypeEnum,
	type VersionEntity,
} from "../../types/payloadTypes";
import {
	registerUserInDatabase,
	retrieveAllRegisteredUsersFromDatabase,
} from "../databaseHandler";
import { errorLogger } from "../../logger/errorLogger";
import { getVersionState, setVersionState } from "../../state/versionState.ts";

export async function authPayloadHandler(
	payloadFromClientAsObject: unknown,
	ws: ServerWebSocket<WebSocket>,
	server: Server
) {
	const validAuthPayload = validatePayload(payloadFromClientAsObject, ws);
	if (!validAuthPayload.success) {
		return;
	}

	const versionDetails = validAuthPayload.data.version;
	if (!checkIfVersionIsZero(versionDetails, ws)) {
		return;
	}

	setVersionState({
		major: versionDetails.major,
		minor: versionDetails.minor,
		patch: versionDetails.patch,
	});

	await registerUserInDatabase(validAuthPayload.data);
	await sendListOfAllRegisteredUsersToClients(server);
}

function validatePayload(payload: unknown, ws: ServerWebSocket<WebSocket>) {
	const validAuthPayload = AuthenticationPayloadSchema.safeParse(payload);

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

async function sendListOfAllRegisteredUsersToClients(server: Server) {
	const allUsers = await retrieveAllRegisteredUsersFromDatabase();

	if (typeof allUsers === "undefined" || allUsers === null) {
		console.error("No users found");
		errorLogger.logError("No users found");
	}

	const clientListPayload: ClientListPayloadEnhanced = {
		payloadType: PayloadSubTypeEnum.enum.clientList,
		version: getVersionState(),
		clients: allUsers as ClientEntity[],
	};

	server.publish("the-group-chat", JSON.stringify(clientListPayload));
}

function checkIfVersionIsZero(
	version: VersionEntity,
	ws: ServerWebSocket<WebSocket>
) {
	const allZeros =
		version.major === 0 && version.minor === 0 && version.patch === 0;

	if (allZeros) {
		ws.send(
			"Invalid authentication validAuthPayload.data type. Type check not successful!"
		);
		console.error(
			"VALIDATION OF _AUTH_ PAYLOAD FAILED. VERSION IS ZERO. PLEASE UPDATE THE CLIENT."
		);
		errorLogger.logError(
			"VALIDATION OF _AUTH_ PAYLOAD FAILED. VERSION IS ZERO. PLEASE UPDATE THE CLIENT."
		);
		ws.close(
			1008,
			"Invalid authentication validAuthPayload.data type. Version is zero. Please update the client."
		);
		return false;
	}

	return true;
}