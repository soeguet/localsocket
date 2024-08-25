import {
	PayloadSubType,
	type ClientUpdatePayload,
} from "../types/payloadTypes";
import { expect, test, describe, vi, beforeEach } from "vitest";
import { updateClientProfileInformation } from "../handlers/databaseHandler";

const prismaClientMock = {
	client: {
		upsert: vi.fn(),
	},
};

beforeEach(() => {
	Object.values(prismaClientMock.client).forEach((mockFn) => {
		if (typeof mockFn.mockClear === "function") {
			mockFn.mockClear();
		}
	});
});

describe("databaseHandler - updateClientProfileInformation", () => {
	test.skip("create new client if it does not exist", async () => {
		const payload: ClientUpdatePayload = {
			payloadType: PayloadSubType.profileUpdate,
			clientDbId: "123",
			clientUsername: "testuser",
			clientProfilePictureHash: "testimage.jpg",
			clientColor: "blue",
			availability: true,
		};

		await updateClientProfileInformation(payload);

		expect(prismaClientMock).toHaveBeenCalled();
		// expect(prismaMock.client.upsert).toHaveBeenCalledWith({
		//     where: { clientDbId: payload.clientDbId },
		//     update: {
		//         clientUsername: payload.clientUsername,
		//         clientProfilePictureHash: payload.clientProfilePictureHash,
		//         clientColor: payload.clientColor,
		//     },
		//     create: {
		//         clientDbId: payload.clientDbId,
		//         clientUsername: payload.clientUsername,
		//         clientProfilePictureHash: payload.clientProfilePictureHash,
		//         clientColor: payload.clientColor,
		//     },
		// });
	});
});