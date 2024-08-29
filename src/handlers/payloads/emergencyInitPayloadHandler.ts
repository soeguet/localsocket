import type { Server, ServerWebSocket } from "bun";
import emergencyChatState from "../../state/emergencyChatState";
import {
	type EmergencyMessage,
	type AllEmergencyMessagesPayload, PayloadSubTypeEnum, EmergencyInitPayloadSchema, type EmergencyInitPayload,
} from "../../types/payloadTypes";
import { retrieveAllEmergencyMessages } from "../databaseHandler";
import { errorLogger } from "../../logger/errorLogger";




export async function emergencyInitPayloadHandler(
	payloadFromClientAsObject: unknown,
	message: string | Buffer,
	ws: ServerWebSocket<WebSocket>,
	server: Server
) {
	const validatedEmergencyInitPayload = validatePayload(payloadFromClientAsObject, ws);

	if (!validatedEmergencyInitPayload.success) {
		return;
	}

	// emergency chat mode
	// 1) deactivate it
	// 2) activate - if not active
	// 3) activate -> ignore if already active
	const payload = validatedEmergencyInitPayload.data;

	if (!payload.active) {
		// 1)
		extracted(payload, server, message);
		return;

	} else if (payload.active && !emergencyChatState.active) {
		// 2)
		extracted(payload, server, message);
		return;

	} else {
		// 3)
		const activeChats = sendAlreadyActiveEmergencyChatInfoToAllClients(server);

		// TODO send out all messages for this emergency chat to all clients
		const allExistingEmergencyMessages: EmergencyMessage[] =
			await retrieveAllEmergencyMessages(
				activeChats.emergencyChatId
			);

		const newPayload: AllEmergencyMessagesPayload =
			{
				emergencyMessages: allExistingEmergencyMessages,
				payloadType: PayloadSubTypeEnum.enum.allEmergencyMessages,
				emergencyChatId: activeChats.emergencyChatId,
			};

		ws.send(JSON.stringify(newPayload));
	}
}

function extracted(
	payload: EmergencyInitPayload,
	server: Server,
	message: string | Buffer
) {
	emergencyChatState.active = payload.active;
	emergencyChatState.emergencyChatId = payload.emergencyChatId;
	emergencyChatState.initiatorClientDbId = payload.initiatorClientDbId;
	server.publish("the-group-chat", message);
}

function sendAlreadyActiveEmergencyChatInfoToAllClients(server: Server) {

	const alreadyActiveEmergencyChat = {
		...emergencyChatState,
		payloadType: PayloadSubTypeEnum.enum.emergencyInit,
	};

	server.publish(
		"the-group-chat",
		JSON.stringify(alreadyActiveEmergencyChat)
	);

	return alreadyActiveEmergencyChat;
}

function validatePayload(payload: unknown, ws: ServerWebSocket<WebSocket>) {
	const validAuthPayload = EmergencyInitPayloadSchema.safeParse(payload);

	if (!validAuthPayload.success) {
		ws.send(
			`Invalid emergency_init payload type. Type check not successful! ${JSON.stringify(
				payload
			)}`
		);

		console.error(
			"VALIDATION OF _EMERGENCY_INIT_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
		);
		errorLogger.logError(
			"VALIDATION OF _EMERGENCY_INIT_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
		);

		ws.close(
			1008,
			"Invalid emergency_init payload type. Type check not successful!"
		);
	}

	return validAuthPayload;
}