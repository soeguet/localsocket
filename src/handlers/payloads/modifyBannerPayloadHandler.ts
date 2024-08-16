import type { ServerWebSocket } from "bun";
import { validateBannerPayload } from "../typeHandler";
import {
	deleteExistingBanner,
	persistBanner,
	updateExistingBanner,
} from "../databaseHandler";
import type { BannerPayload } from "../../types/payloadTypes";
import { errorLogger } from "../../logger/errorLogger";

export async function modifyBannerPayloadHandler(
	payloadFromClientAsObject: unknown,
	ws: ServerWebSocket<WebSocket>
) {
	const validatedModifyBannerPayload = validateBannerPayload(
		payloadFromClientAsObject
	);

	if (!validatedModifyBannerPayload) {
		ws.send(
			`Invalid modify banner payload type. Type check not successful! ${JSON.stringify(
				payloadFromClientAsObject
			)}`
		);
		console.error(
			"VALIDATION OF MODIFY BANNER PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
		);
		await errorLogger.logError(
			"VALIDATION OF MODIFY BANNER PAYLOAD FAILED. PLEASE CHECK THE PAYLOAD AND TRY AGAIN."
		);
		ws.close(
			1008,
			"Invalid modify banner payload type. Type check not successful!"
		);
		return;
	}

	const payload = payloadFromClientAsObject as BannerPayload;

	if (payload.action === "add") {
		await addBanner(payload);
	} else if (payload.action === "remove") {
		await removeBanner(payload);
	} else if (payload.action === "update") {
		await updateBanner(payload);
	}
}

async function removeBanner(payload: BannerPayload) {
	try {
		await deleteExistingBanner(payload.banner.id);
	} catch (error) {
		await errorLogger.logError(error);
		return;
	}
}

async function updateBanner(payload: BannerPayload) {
	try {
		await updateExistingBanner(payload.banner);
	} catch (error) {
		await errorLogger.logError(error);
		return;
	}
}

async function addBanner(payload: BannerPayload) {
	try {
		await persistBanner(payload.banner);
	} catch (error) {
		errorLogger.logError(error);
		return;
	}
}