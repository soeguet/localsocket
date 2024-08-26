import type { ServerWebSocket } from "bun";
import emergencyChatState from "../../state/emergencyChatState";
import {
	type MessageListPayload,
	type EmergencyInitPayload,
	type AllEmergencyMessagesPayload,
	type EmergencyMessage, PayloadSubTypeEnum,
} from "../../types/payloadTypes";
import {
	retrieveAllEmergencyMessages,
	sendLast100MessagesToNewClient,
} from "../databaseHandler";

export async function messageListPayloadHandler(
	ws: ServerWebSocket<WebSocket>
) {
	const messageListPayload: MessageListPayload =
		await sendLast100MessagesToNewClient();

	ws.send(JSON.stringify(messageListPayload));

	//
	// also send information about active emergency chats
	const emergencyChat: EmergencyInitPayload = {
		payloadType: PayloadSubTypeEnum.enum.emergencyInit,
		...emergencyChatState,
	};
	ws.send(JSON.stringify(emergencyChat));

	// additionally send out all messages for this emergency chat to all clients
	if (!emergencyChat.active) {
		return;
	}

	const allEmergencyMessages: EmergencyMessage[] =
		await retrieveAllEmergencyMessages(emergencyChat.emergencyChatId);
	const allEmergencyMessagesWithPayloadType: AllEmergencyMessagesPayload = {
		payloadType: PayloadSubTypeEnum.enum.allEmergencyMessages,
		emergencyMessages: allEmergencyMessages,
		emergencyChatId: emergencyChat.emergencyChatId,
	};
	ws.send(JSON.stringify(allEmergencyMessagesWithPayloadType));
}