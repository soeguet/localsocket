import type { ServerWebSocket } from "bun";
import {
	type AllProfilePictureHashesPayload,
	PayloadSubTypeEnum, type ProfilePicturesHashes,
} from "../../types/payloadTypes";
import { fetchAllProfilePictureHashes } from "../databaseHandler";

export async function fetchAllProfilePictureHashesPayloadHandler(
	ws: ServerWebSocket<WebSocket>
) {
	const hashes = await fetchAllProfilePictureHashes();
	if (hashes === null) {
		return;
	}

	const profilePictureHashes: ProfilePicturesHashes[] = [];
	for (const hash of hashes) {
		profilePictureHashes.push({
			clientDbId: hash.clientDbId,
			imageHash: hash.clientProfilePictureHash ?? "",
		});
	}

	const payload: AllProfilePictureHashesPayload = {
		payloadType: PayloadSubTypeEnum.enum.fetchAllProfilePictureHashes,
		profilePictureHashes: profilePictureHashes,
	};

	ws.send(JSON.stringify(payload));
}