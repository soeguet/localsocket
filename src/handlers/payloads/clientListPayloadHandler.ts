import type { Server } from "bun";
import {
	type ClientListPayload,
	PayloadSubType,
	type ClientEntity,
} from "../../types/payloadTypes";
import { retrieveAllRegisteredUsersFromDatabase } from "../databaseHandler";
import { errorLogger } from "../../logger/errorLogger";

export async function clientListPayloadHandler(server: Server) {
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
