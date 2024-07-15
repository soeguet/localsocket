import type { ServerWebSocket } from "bun";
import { validateBannerPayload } from "../typeHandler";
import { deleteBanner, persistBanner } from "../databaseHandler";
import type { BannerPayload } from "../../types/payloadTypes";

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
		ws.close(
			1008,
			"Invalid modify banner payload type. Type check not successful!"
		);
		return;
	}

	const payload = payloadFromClientAsObject as BannerPayload;

	if (payload.action === "add") {
		addBanner(payload);
	} else if (payload.action === "remove") {
		removeBanner(payload);
	} else if (payload.action === "update") {
		updateBanner(payload);
	}
}

async function removeBanner(payload: BannerPayload) {
	try {
		await deleteBanner(payload.banner.id);
	} catch (error) {
		console.error("Error deleting banner", error);
		return;
	}
}

async function updateBanner(payload: BannerPayload) {
	try {
		await updateBanner(payload);
	} catch (error) {
		console.error("Error updating banner", error);
		return;
	}
}

async function addBanner(payload: BannerPayload) {
	try {
		await persistBanner(payload.banner);
	} catch (error) {
		console.error("Error persisting banner", error);
		return;
	}
}
