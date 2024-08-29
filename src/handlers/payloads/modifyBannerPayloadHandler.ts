import type { ServerWebSocket } from "bun";
import {
	deleteExistingBanner,
	persistBanner,
	updateExistingBanner,
} from "../databaseHandler";
import {
	BannerPayloadSchema,
} from "../../types/payloadTypes";
import { errorLogger } from "../../logger/errorLogger";

export async function modifyBannerPayloadHandler(
	payloadFromClientAsObject: unknown,
	ws: ServerWebSocket<WebSocket>
) {
	const validAuthPayload = validatePayload(payloadFromClientAsObject, ws);
	if (!validAuthPayload.success) {
		return;
	}

	switch (validAuthPayload.data.action) {
		case "add": {
			await persistBanner(validAuthPayload.data.banner);
			break;
		}
		case "remove": {
			await deleteExistingBanner(validAuthPayload.data.banner.id);
			break;
		}
		case "update": {
			await updateExistingBanner(validAuthPayload.data.banner);
			break;
		}
	}
}

function validatePayload(payload: unknown, ws: ServerWebSocket<WebSocket>) {
	const validAuthPayload = BannerPayloadSchema.safeParse(payload);

	if (!validAuthPayload.success) {
		ws.send(
			`Invalid modify banner payload type. Type check not successful! ${JSON.stringify(
				payload
			)}`
		);
		console.error(
			"VALIDATION OF MODIFY BANNER PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
		);
		errorLogger.logError(
			"VALIDATION OF MODIFY BANNER PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
		);
		ws.close(
			1008,
			"Invalid modify banner payload type. Type check not successful!"
		);
	}
	return validAuthPayload;
}