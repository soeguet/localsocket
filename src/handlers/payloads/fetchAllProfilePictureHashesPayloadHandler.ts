import type { ServerWebSocket } from "bun";
import {
	type AllProfilePictureHashesPayload,
	PayloadSubTypeEnum,
} from "../../types/payloadTypes";
import { fetchAllProfilePictureHashes } from "../databaseHandler";

export async function fetchAllProfilePictureHashesPayloadHandler(
	ws: ServerWebSocket<WebSocket>
) {
	const hashes = await fetchAllProfilePictureHashes();
	if (hashes === null) {
		return;
	}

	const payload: AllProfilePictureHashesPayload = {
		payloadType: PayloadSubTypeEnum.enum.fetchAllProfilePictureHashes,
		profilePictureHashes: hashes,
	};

	ws.send(JSON.stringify(payload));
}