import type { Server } from "bun";
import {
	PayloadSubType,
	type ClientEntity,
	type ClientListPayloadEnhanced,
} from "../../types/payloadTypes";
import { retrieveAllRegisteredUsersFromDatabase } from "../databaseHandler";
import { errorLogger } from "../../logger/errorLogger";
import { getVersionState } from "../../state/versionState";

export async function clientListPayloadHandler(server: Server) {
	const allUsers = await retrieveAllRegisteredUsersFromDatabase();
	if (allUsers === undefined || allUsers === null) {
		await errorLogger.logError(new Error("No users found"));
		return;
	}

	//const clientListPayload: ClientListPayload = {
	//	payloadType: PayloadSubType.clientList,
	//	// TODO validate this
	//	clients: allUsers as ClientEntity[],
	//};

	const clientListPayload: ClientListPayloadEnhanced = {
		payloadType: PayloadSubType.clientList,
		version: getVersionState(),
		clients: allUsers as ClientEntity[],
	};

	console.log("clientListPayload", clientListPayload);
	server.publish("the-group-chat", JSON.stringify(clientListPayload));
}