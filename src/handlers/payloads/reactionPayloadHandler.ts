import type { ServerWebSocket, Server } from "bun";
import {
	persistReactionToDatabase,
	retrieveUpdatedMessageFromDatabase,
} from "../databaseHandler";
import { errorLogger } from "../../logger/errorLogger";
import {
	PayloadSubTypeEnum,
	type ReactionPayload,
	ReactionPayloadSchema,
} from "../../types/payloadTypes.ts";

export async function reactionPayloadHandler(
	payloadFromClientAsObject: unknown,
	ws: ServerWebSocket<WebSocket>,
	server: Server
) {
	const validAuthPayload = validatePayload(payloadFromClientAsObject, ws);
	if (!validAuthPayload.success) {
		return;
	}

	await persistReactionToDatabase(validAuthPayload.data);
	await sendReactionPayloadToAllClients(validAuthPayload.data, server);
}

async function sendReactionPayloadToAllClients(
	payload: ReactionPayload,
	server: Server
) {
	const updatedMessage = await retrieveUpdatedMessageFromDatabase(
		payload.reactionMessageId
	);

	const updatedMessageWithPayloadType = {
		...updatedMessage,
		payloadType: PayloadSubTypeEnum.enum.reaction,
	};

	server.publish(
		"the-group-chat",
		JSON.stringify(updatedMessageWithPayloadType)
	);
}

function validatePayload(payload: unknown, ws: ServerWebSocket<WebSocket>) {
	const validAuthPayload = ReactionPayloadSchema.safeParse(payload);

	if (!validAuthPayload.success) {
		ws.send(
			`Invalid reaction payload type. Type check not successful! ${JSON.stringify(
				payload
			)}`
		);
		console.error(
			"VALIDATION OF _REACTION_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
		);
		errorLogger.logError(
			"VALIDATION OF _REACTION_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
		);
		ws.close(
			1008,
			"Invalid authentication payload type. Type check not successful!"
		);
	}
	return validAuthPayload;
}