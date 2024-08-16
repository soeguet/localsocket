import type { Server, ServerWebSocket } from "bun";
import emergencyChatState from "../../state/emergencyChatState";
import {
	type EmergencyInitPayload,
	PayloadSubType,
	type EmergencyMessage,
	type AllEmergencyMessagesPayload,
} from "../../types/payloadTypes";
import { retrieveAllEmergencyMessages } from "../databaseHandler";
import { validateEmergencyInitPayload } from "../typeHandler";
import { errorLogger } from "../../logger/errorLogger";

export async function emergencyInitPayloadHandler(
	payloadFromClientAsObject: unknown,
	message: string | Buffer,
	ws: ServerWebSocket<WebSocket>,
	server: Server
) {
	const validatedEmergencyInitPayload = validateEmergencyInitPayload(
		payloadFromClientAsObject
	);

	if (!validatedEmergencyInitPayload) {
		ws.send(
			`Invalid emergency_init payload type. Type check not successful! ${JSON.stringify(
				payloadFromClientAsObject
			)}`
		);

		console.error(
			"VALIDATION OF _EMERGENCY_INIT_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
		);
		await errorLogger.logError(
			"VALIDATION OF _EMERGENCY_INIT_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
		);

		ws.close(
			1008,
			"Invalid emergency_init payload type. Type check not successful!"
		);
		return;
	}

	const payload = payloadFromClientAsObject as EmergencyInitPayload;

	// emergency chat mode
	// 1) deactive it
	// 2) activate - if not active
	// 3) activate -> ignore if already active
	if (!payload.active) {
		// 1)
		emergencyChatState.active = payload.active;
		emergencyChatState.emergencyChatId = payload.emergencyChatId;
		emergencyChatState.initiatorClientDbId = payload.initiatorClientDbId;

		server.publish("the-group-chat", message);
		return;
	} else if (payload.active && !emergencyChatState.active) {
		// 2)
		emergencyChatState.active = payload.active;
		emergencyChatState.emergencyChatId = payload.emergencyChatId;
		emergencyChatState.initiatorClientDbId = payload.initiatorClientDbId;
		server.publish("the-group-chat", message);
		return;
	} else {
		// 3)
		const alreadyActiveEmergencyChat = {
			...emergencyChatState,
			payloadType: PayloadSubType.emergencyInit,
		};
		server.publish(
			"the-group-chat",
			JSON.stringify(alreadyActiveEmergencyChat)
		);

		// TODO send out all messages for this emergency chat to all clients
		const allExistingEmergencyMessages: EmergencyMessage[] =
			await retrieveAllEmergencyMessages(
				alreadyActiveEmergencyChat.emergencyChatId
			);
		const allExistingEmergencyMessagesWithPayloadType: AllEmergencyMessagesPayload =
			{
				emergencyMessages: allExistingEmergencyMessages,
				payloadType: PayloadSubType.allEmergencyMessages,
				emergencyChatId: alreadyActiveEmergencyChat.emergencyChatId,
			};
		ws.send(JSON.stringify(allExistingEmergencyMessagesWithPayloadType));
	}
}