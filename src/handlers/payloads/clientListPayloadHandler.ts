import type { Server } from "bun";
import {
	type ClientEntity,
	type ClientListPayloadEnhanced, PayloadSubTypeEnum,
} from "../../types/payloadTypes";
import { retrieveAllRegisteredUsersFromDatabase } from "../databaseHandler";
import { errorLogger } from "../../logger/errorLogger";
import { getVersionState } from "../../state/versionState";

export async function clientListPayloadHandler(server: Server) {

	const allUsers = await retrieveAllRegisteredUsersFromDatabase();

	if (allUsers === undefined || allUsers === null) {
		errorLogger.logError(new Error("No users found"));
		return;
	}

	const clientListPayload: ClientListPayloadEnhanced = {
		payloadType: PayloadSubTypeEnum.enum.clientList,
		version: getVersionState(),
		clients: allUsers as ClientEntity[],
	};

	server.publish("the-group-chat", JSON.stringify(clientListPayload));
}