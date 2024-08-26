import type { ServerWebSocket } from "bun";
import {
	type AllProfilePictureHashesPayload, PayloadSubTypeEnum, type ProfilePicturesHash,
} from "../../types/payloadTypes";
import { fetchAllProfilePictureHashes } from "../databaseHandler";

export async function fetchAllProfilePictureHashesPayloadHandler(
	ws: ServerWebSocket<WebSocket>
) {
	const allProfilePictureHashes: ProfilePicturesHash[] =
		await fetchAllProfilePictureHashes();

	const fetchAllProfilePictureHashesPayload: AllProfilePictureHashesPayload =
	{
		payloadType: PayloadSubTypeEnum.enum.fetchAllProfilePictureHashes,
		profilePictureHashes: allProfilePictureHashes,
	};

	ws.send(JSON.stringify(fetchAllProfilePictureHashesPayload));
}