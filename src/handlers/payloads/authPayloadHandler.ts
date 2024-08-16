import type { Server, ServerWebSocket } from "bun";
import {
	type AuthenticationPayload,
	PayloadSubType,
	type ClientEntity,
	type ClientListPayloadEnhanced,
} from "../../types/payloadTypes";
import {
	registerUserInDatabse,
	retrieveAllRegisteredUsersFromDatabase,
} from "../databaseHandler";
import { validateAuthPayload } from "../typeHandler";
import { errorLogger } from "../../logger/errorLogger";
import { getVersionState, setVersionState } from "../../state/versionState.ts";

export async function authPayloadHandler(
	payloadFromClientAsObject: unknown,
	ws: ServerWebSocket<WebSocket>,
	server: Server
) {
	const validAuthPayload = validateAuthPayload(payloadFromClientAsObject);

	if (!validAuthPayload) {
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
		return;
	}

	const payload = payloadFromClientAsObject as AuthenticationPayload;
	const allZeros =
		payload.version === undefined ||
		(payload.version.major === 0 &&
			payload.version.minor === 0 &&
			payload.version.patch === 0);

	if (allZeros) {
		ws.send(
			"Invalid authentication payload type. Type check not successful!"
		);
		console.error(
			"VALIDATION OF _AUTH_ PAYLOAD FAILED. VERSION IS ZERO. PLEASE UPDATE THE CLIENT."
		);
		errorLogger.logError(
			"VALIDATION OF _AUTH_ PAYLOAD FAILED. VERSION IS ZERO. PLEASE UPDATE THE CLIENT."
		);
		ws.close(
			1008,
			"Invalid authentication payload type. Version is zero. Please update the client."
		);
		return;
	}

	const versionDetails = payload.version;

	setVersionState({
		major: versionDetails.major,
		minor: versionDetails.minor,
		patch: versionDetails.patch,
	});

	try {
		await registerUserInDatabse(payload);
	} catch (error) {
		errorLogger.logError(error);
		return;
	}

	const allUsers = await retrieveAllRegisteredUsersFromDatabase();

	if (typeof allUsers === "undefined" || allUsers === null) {
		console.error("No users found");
		errorLogger.logError("No users found");
	}

	const clientListPayload: ClientListPayloadEnhanced = {
		payloadType: PayloadSubType.clientList,
		version: getVersionState(),
		// TODO validate this
		clients: allUsers as ClientEntity[],
	};

	server.publish("the-group-chat", JSON.stringify(clientListPayload));
}
