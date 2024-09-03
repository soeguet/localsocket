import { fetchImage } from "../databaseHandler.ts";

export function fetchPictureApiHandler(imageHash: string) {
	return fetchImage(imageHash);
}