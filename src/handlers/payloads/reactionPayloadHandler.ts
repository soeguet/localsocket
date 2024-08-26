import type { ServerWebSocket, Server } from "bun";
import {
	persistReactionToDatabase,
	retrieveUpdatedMessageFromDatabase,
} from "../databaseHandler";
import { validateReactionPayload } from "../typeHandler";
import { errorLogger } from "../../logger/errorLogger";
import { PayloadSubTypeEnum, type ReactionPayload } from "../../types/payloadTypes.ts";

export async function reactionPayloadHandler(
	payloadFromClientAsObject: unknown,
	ws: ServerWebSocket<WebSocket>,
	server: Server
) {
	const validatedReactionPayload = validateReactionPayload(
		payloadFromClientAsObject
	);

	if (!validatedReactionPayload) {
		ws.send(
			`Invalid reaction payload type. Type check not successful! ${JSON.stringify(
				payloadFromClientAsObject
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
		return;
	}

	const payload = payloadFromClientAsObject as ReactionPayload;

	try {
		await persistReactionToDatabase(payload);
	} catch (error) {
		errorLogger.logError(error);
		return;
	}

	const updatedMessage = await retrieveUpdatedMessageFromDatabase(
		(payloadFromClientAsObject as ReactionPayload).reactionMessageId
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