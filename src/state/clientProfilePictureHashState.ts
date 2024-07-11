const clientProfilePictureHastMap = new Map<string, string>();

export function setClientProfilePictureHash(
	clientDbId: string,
	imageHash: string
) {
	clientProfilePictureHastMap.set(clientDbId, imageHash);
}

export function getClientProfilePictureHash(clientDbId: string) {
	return clientProfilePictureHastMap.get(clientDbId);
}

export function deleteClientProfilePictureHash(clientDbId: string) {
	clientProfilePictureHastMap.delete(clientDbId);
}

export default clientProfilePictureHastMap;
