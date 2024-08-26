import { test, describe, vi, beforeEach } from "vitest";
import { updateClientProfileInformation } from "../handlers/databaseHandler";
import {
	type ClientUpdatePayloadV2,
	PayloadSubTypeEnum,
} from "../types/payloadTypes.ts";

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
		const payload: ClientUpdatePayloadV2 = {
			payloadType: PayloadSubTypeEnum.enum.profileUpdateV2,
			clientDbId: "123",
			clientUsername: "testuser",
			clientProfilePictureHash: "testimage.jpg",
			clientColor: "blue",
			availability: true,
		};

		await updateClientProfileInformation(payload);

		// expect(prismaClientMock).toHaveBeenCalled();
		// expect(prismaClientMock.client.upsert).toHaveBeenCalledWith({
		//     where: { clientDbId: payloa },
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