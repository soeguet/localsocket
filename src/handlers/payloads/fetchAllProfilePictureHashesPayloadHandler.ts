import { fetchAllProfilePictureHashes } from "../databaseHandler";

export async function fetchAllProfilePictureHashesPayloadHandler(
	ws: ServerWebSocket<WebSocket>
) {
	const allProfilePictureHashes: ProfilePictureHash[] =
		await fetchAllProfilePictureHashes();
}
