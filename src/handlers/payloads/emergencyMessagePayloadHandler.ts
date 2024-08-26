import type { Server, ServerWebSocket } from "bun";
import {
	type EmergencyMessagePayload,
	EmergencyMessagePayloadSchema,
	PayloadSubTypeEnum,
} from "../../types/payloadTypes";
import {
	persistEmergencyMessage,
	retrieveLastEmergencyMessage,
} from "../databaseHandler";
import { errorLogger } from "../../logger/errorLogger";

export async function emergencyMessagePayloadHandler(
	payloadFromClientAsObject: unknown,
	ws: ServerWebSocket<WebSocket>,
	server: Server
) {
	const validatedEmergencyPayload = validatePayload(
		payloadFromClientAsObject,
		ws
	);

	const payload = validatedEmergencyPayload.data as EmergencyMessagePayload;

	const persistSuccessful = await persistEmergencyMessage(payload);
	if (!persistSuccessful) {
		return;
	}
	await sendLastEmergencyMessagesToAllClients(payload, server);
}

function validatePayload(payload: unknown, ws: ServerWebSocket<WebSocket>) {
	const validAuthPayload = EmergencyMessagePayloadSchema.safeParse(payload);

	if (!validAuthPayload.success) {
		ws.send(
			`Invalid emergency payload type. Type check not successful! ${JSON.stringify(
				payload
			)}`
		);
		console.error(
			"VALIDATION OF _EMERGENCY_MESSAGE_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
		);
		errorLogger.logError(
			"VALIDATION OF _EMERGENCY_MESSAGE_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
		);
		ws.close(
			1008,
			"Invalid emergency payload type. Type check not successful!"
		);
	}
	return validAuthPayload;
}

async function sendLastEmergencyMessagesToAllClients(payload: EmergencyMessagePayload, server: Server) {
	const lastEmergencyMessage = await retrieveLastEmergencyMessage(
		payload.messageDbId
	);
	if (lastEmergencyMessage === null) {
		return;
	}

	const updatedMessageWithPayloadType = {
		...lastEmergencyMessage,
		payloadType: PayloadSubTypeEnum.enum.emergencyMessage,
	};

	server.publish(
		"the-group-chat",
		JSON.stringify(updatedMessageWithPayloadType)
	);
}