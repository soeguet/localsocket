import type { ServerWebSocket } from "bun";
import emergencyChatState from "../../state/emergencyChatState";
import {
	type MessageListPayload,
	type EmergencyInitPayload,
	type AllEmergencyMessagesPayload,
	type EmergencyMessage,
	PayloadSubTypeEnum,
} from "../../types/payloadTypes";
import {
	retrieveAllEmergencyMessages,
	sendLast100MessagesToNewClient,
} from "../databaseHandler";

export async function messageListPayloadHandler(
	ws: ServerWebSocket<WebSocket>
) {
	await sendLastMessagesToClient(ws);

	const emergencyChat = sendActiveEmergencyChatInfoToClient(ws);
	if (!emergencyChat.active) {
		return;
	}
	await sendEmergencyChatMessagesToClient(emergencyChat, ws);
}

async function sendLastMessagesToClient(ws: ServerWebSocket<WebSocket>) {
	const messageListPayload: MessageListPayload =
		await sendLast100MessagesToNewClient();

	ws.send(JSON.stringify(messageListPayload));
}

function sendActiveEmergencyChatInfoToClient(ws: ServerWebSocket<WebSocket>) {
	const emergencyChat: EmergencyInitPayload = {
		payloadType: PayloadSubTypeEnum.enum.emergencyInit,
		...emergencyChatState,
	};
	ws.send(JSON.stringify(emergencyChat));
	return emergencyChat;
}

async function sendEmergencyChatMessagesToClient(
	emergencyChat: EmergencyInitPayload,
	ws: ServerWebSocket<WebSocket>
) {
	const allEmergencyMessages: EmergencyMessage[] =
		await retrieveAllEmergencyMessages(emergencyChat.emergencyChatId);
	const allEmergencyMessagesWithPayloadType: AllEmergencyMessagesPayload = {
		payloadType: PayloadSubTypeEnum.enum.allEmergencyMessages,
		emergencyMessages: allEmergencyMessages,
		emergencyChatId: emergencyChat.emergencyChatId,
	};
	ws.send(JSON.stringify(allEmergencyMessagesWithPayloadType));
}