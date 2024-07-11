import type { Server, ServerWebSocket } from "bun";
import {
	type EmergencyMessagePayload,
	PayloadSubType,
} from "../../types/payloadTypes";
import {
	persistEmergencyMessage,
	retrieveLastEmergencyMessage,
} from "../databaseHandler";
import { validateEmergencyMessagePayload } from "../typeHandler";

export async function emergencyMessagePayloadHandler(
	payloadFromClientAsObject: unknown,
	ws: ServerWebSocket<WebSocket>,
	server: Server
) {
	const validatedEmergencyPayload = validateEmergencyMessagePayload(
		payloadFromClientAsObject
	);
	if (!validatedEmergencyPayload) {
		ws.send(
			`Invalid emergency payload type. Type check not successful! ${JSON.stringify(
				payloadFromClientAsObject
			)}`
		);
		console.error(
			"VALIDATION OF _EMERGENCY_MESSAGE_ PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
		);
		ws.close(
			1008,
			"Invalid emergency payload type. Type check not successful!"
		);
		return;
	}

	const payload = payloadFromClientAsObject as EmergencyMessagePayload;

	try {
		await persistEmergencyMessage(payload);
	} catch (error) {
		console.error("Error persisting emergency message", error);
		return;
	}

	let lastEmergencyMessage;
	try {
		lastEmergencyMessage = await retrieveLastEmergencyMessage(
			payload.messageDbId
		);
	} catch (error) {
		console.error("Error retrieving last emergency message", error);
		return;
	}

	if (lastEmergencyMessage === undefined || lastEmergencyMessage === null) {
		console.error("lastEmergencyMessage is undefined or null");
		return;
	}

	const updatedMessageWithPayloadType = {
		...lastEmergencyMessage,
		payloadType: PayloadSubType.emergencyMessage,
	};

	server.publish(
		"the-group-chat",
		JSON.stringify(updatedMessageWithPayloadType)
	);
}
