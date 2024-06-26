import { vi, afterEach, describe, test, expect } from "vitest";
import { processIncomingMessage } from "../handlers/incomingMessageHandler";
import { PayloadSubType } from "../types/payloadTypes";

const mockWebsocketConnection = {
	send: vi.fn(),
	close: vi.fn(),
} as any;

const mockServer = {
	send: vi.fn(),
	broadcast: vi.fn(),
	publish: vi.fn(),
} as any;

// /**
//  * [[ RESULTING TYPE ]]
//  * export type ClientEntity = {
//  *    clientDbId: string;
//  *    clientUsername: string;
//  *    clientColor?: string;
//  *    clientProfileImage?: string;
//  *    availability: boolean;
//  * };
//  *
//  * @param {string} clientDbId
//  * @param {string} clientUsername
//  * @param {string} clientColor
//  * @param {string} clientProfileImage
//  * @param {boolean} availability
//  */
// export type ClientEntity = {
//     clientDbId: string;
//     clientUsername: string;
//     clientColor?: string;
//     clientProfileImage?: string;
//     availability: boolean;
// };
vi.mock("../handlers/databaseHandler", () => ({
	persistMessageInDatabase: vi.fn(),
	retrieveUpdatedMessageFromDatabase: vi.fn(),
	retrieveLastMessageFromDatabase: vi.fn(() => ({})),
	retrieveAllRegisteredUsersFromDatabase: vi.fn(() => [
		{
			clientDbId: "1",
			clientUsername: "test",
			availability: true,
		},
		{
			clientDbId: "2",
			clientUsername: "test2",
			availability: true,
		},
	]),
	updateClientProfileInformation: vi.fn(),
	persistReactionToDatabase: vi.fn(),
	registerUserInDatabse: vi.fn(),
	checkForDatabaseErrors: vi.fn((message) => message),
}));

afterEach(() => {
	mockServer.publish.mockClear();
	mockWebsocketConnection.close.mockClear();
});

describe("incomingMessages - AuthPayload", () => {
	test("valid AuthPayload", async () => {
		const payload = JSON.stringify({
			payloadType: PayloadSubType.auth,
			clientUsername: "Test",
			clientDbId: "asdasd",
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			payload
		);

		expect(mockServer.publish).toBeCalledTimes(1);
	});

	test("invalid AuthPayload - null value clientUsername", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.auth,
			clientUsername: null,
			clientDbId: "asdasd",
		});
		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("valid AuthPayload - empty string clientUsername", async () => {
		const payload = JSON.stringify({
			payloadType: PayloadSubType.auth,
			clientUsername: "",
			clientDbId: "asdasd",
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			payload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
	});

	test("invalid AuthPayload - empty string clientDbId", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.auth,
			clientUsername: "Test",
			clientDbId: "",
			availability: true,
		});
		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("invalid AuthPayload - null value clientDbId", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.auth,
			clientUsername: "Test",
			clientDbId: null,
		});
		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("invalid AuthPayload - missing clientUsername", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.auth,
			clientDbId: "asdasd",
		});
		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("invalid AuthPayload - missing clientDbId", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.auth,
			clientDbId: "asdasd",
		});
		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});
});

describe("incomingMessages - MessagePayload", () => {
	/**
	 * [[ RESULTING TYPE ]]
	 * export type MessagePayload = {
	 *      payloadType: PayloadSubType.message;
	 *      messageType: {
	 *          messageDbId: string;
	 *          messageContext: string;
	 *          messageTime: string;
	 *          messageDate: Date;
	 *          edited: boolean;
	 *          deleted: boolean;
	 *      };
	 *      clientType: {
	 *          clientDbId: string;
	 *      };
	 *      quoteType?: {
	 *          quoteMessageId: string;
	 *          quoteClientId: string;
	 *          quoteMessageContext: string;
	 *          quoteTime: string;
	 *          quoteDate: Date;
	 *      };
	 *      reactionType?: {
	 *          reactionMessageId: string;
	 *          reactionContext: string;
	 *          reactionClientId: string;
	 *      }[];
	 *    };
	 */
	test("valid MessagePayload", async () => {
		const payload = JSON.stringify({
			payloadType: PayloadSubType.message,
			messageType: {
				messageDbId: "asdasd",
				messageContext: "Test",
				messageTime: "12:00",
				messageDate: "2021-09-01",
				edited: false,
				deleted: false,
			},
			clientType: {
				clientDbId: "asdasd",
			},
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			payload
		);

		expect(mockServer.publish).toBeCalledTimes(1);
	});

	test("invalid MessagePayload - null value messageDbId", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.message,
			messageType: {
				messageDbId: null,
				messageContext: "Test",
				messageTime: "12:00",
				messageDate: "2021-09-01",
				edited: false,
				deleted: false,
			},
			clientType: {
				clientDbId: "asdasd",
			},
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("invalid MessagePayload - null value messageContext", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.message,
			messageType: {
				messageDbId: "asdasd",
				messageContext: null,
				messageTime: "12:00",
				messageDate: "2021-09-01",
				edited: false,
				deleted: false,
			},
			clientType: {
				clientDbId: "asdasd",
			},
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("invalid MessagePayload - null value messageTime", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.message,
			messageType: {
				messageDbId: "asdasd",
				messageContext: "Test",
				messageTime: null,
				messageDate: "2021-09-01",
				edited: false,
				deleted: false,
			},
			clientType: {
				clientDbId: "asdasd",
			},
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("invalid MessagePayload - null value messageDate", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.message,
			messageType: {
				messageDbId: "asdasd",
				messageContext: "Test",
				messageTime: "12:00",
				messageDate: null,
				edited: false,
				deleted: false,
			},
			clientType: {
				clientDbId: "asdasd",
			},
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("invalid MessagePayload - null value clientDbId", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.message,
			messageType: {
				messageDbId: "asdasd",
				messageContext: "Test",
				messageTime: "12:00",
				messageDate: "2021-09-01",
				edited: false,
				deleted: false,
			},
			clientType: {
				clientDbId: null,
			},
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("invalid MessagePayload - missing messageType", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.message,
			clientType: {
				clientDbId: "asdasd",
			},
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("invalid MessagePayload - missing clientType", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.message,
			messageType: {
				messageDbId: "asdasd",
				messageContext: "Test",
				messageTime: "12:00",
				messageDate: "2021-09-01",
			},
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("invalid MessagePayload - missing messageType.messageDbId", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.message,
			messageType: {
				messageContext: "Test",
				messageTime: "12:00",
				messageDate: "2021-09-01",
			},
			clientType: {
				clientDbId: "asdasd",
			},
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("invalid MessagePayload - empty string messageType.messageDbId", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.message,
			messageType: {
				messageDbId: "",
				messageContext: "Test",
				messageTime: "12:00",
				messageDate: "2021-09-01",
			},
			clientType: {
				clientDbId: "asdasd",
			},
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("valid MessagePayload - quoteType added", async () => {
		const payload = JSON.stringify({
			payloadType: PayloadSubType.message,
			messageType: {
				messageDbId: "asdasd",
				messageContext: "Test",
				messageTime: "12:00",
				messageDate: "2021-09-01",
				edited: false,
				deleted: false,
			},
			clientType: {
				clientDbId: "asdasd",
			},
			quoteType: {
				quoteDbId: "asdasd",
				quoteClientId: "asdasd",
				quoteMessageContext: "Test",
				quoteTime: "12:00",
				quoteDate: "2021-09-01",
			},
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			payload
		);

		expect(mockServer.publish).toBeCalledTimes(1);
	});

	test("invalid MessagePayload - null value quoteDbId", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.message,
			messageType: {
				messageDbId: "asdasd",
				messageContext: "Test",
				messageTime: "12:00",
				messageDate: "2021-09-01",
			},
			clientType: {
				clientDbId: "asdasd",
			},
			quoteType: {
				quoteDbId: null,
				quoteClientId: "asdasd",
				quoteMessageContext: "Test",
				quoteTime: "12:00",
				quoteDate: "2021-09-01",
			},
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("invalid MessagePayload - null value quoteClientId", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.message,
			messageType: {
				messageDbId: "asdasd",
				messageContext: "Test",
				messageTime: "12:00",
				messageDate: "2021-09-01",
			},
			clientType: {
				clientDbId: "asdasd",
			},
			quoteType: {
				quoteDbId: "asdasd",
				quoteClientId: null,
				quoteMessageContext: "Test",
				quoteTime: "12:00",
				quoteDate: "2021-09-01",
			},
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("invalid MessagePayload - null value quoteMessageContext", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.message,
			messageType: {
				messageDbId: "asdasd",
				messageContext: "Test",
				messageTime: "12:00",
				messageDate: "2021-09-01",
			},
			clientType: {
				clientDbId: "asdasd",
			},
			quoteType: {
				quoteDbId: "asdasd",
				quoteClientId: "asdasd",
				quoteMessageContext: null,
				quoteTime: "12:00",
				quoteDate: "2021-09-01",
			},
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("invalid MessagePayload - null value quoteTime", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.message,
			messageType: {
				messageDbId: "asdasd",
				messageContext: "Test",
				messageTime: "12:00",
				messageDate: "2021-09-01",
			},
			clientType: {
				clientDbId: "asdasd",
			},
			quoteType: {
				quoteDbId: "asdasd",
				quoteClientId: "asdasd",
				quoteMessageContext: "Test",
				quoteTime: null,
				quoteDate: "2021-09-01",
			},
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("invalid MessagePayload - null value quoteDate", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.message,
			messageType: {
				messageDbId: "asdasd",
				messageContext: "Test",
				messageTime: "12:00",
				messageDate: "2021-09-01",
			},
			clientType: {
				clientDbId: "asdasd",
			},
			quoteType: {
				quoteDbId: "asdasd",
				quoteClientId: "asdasd",
				quoteMessageContext: "Test",
				quoteTime: "12:00",
				quoteDate: null,
			},
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("valid MessagePayload - reactionType added", async () => {
		const payload = JSON.stringify({
			payloadType: PayloadSubType.message,
			messageType: {
				messageDbId: "asdasd",
				messageContext: "Test",
				messageTime: "12:00",
				messageDate: "2021-09-01",
				edited: false,
				deleted: false,
			},
			clientType: {
				clientDbId: "asdasd",
			},
			reactionType: [
				{
					reactionDbId: "asdasd",
					reactionMessageId: "asdasd",
					reactionContext: "Test",
					reactionClientId: "asdasd",
				},
			],
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			payload
		);

		expect(mockServer.publish).toBeCalledTimes(1);
	});

	test("invalid MessagePayload - null value reactionDbId", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.message,
			messageType: {
				messageDbId: "asdasd",
				messageContext: "Test",
				messageTime: "12:00",
				messageDate: "2021-09-01",
			},
			clientType: {
				clientDbId: "asdasd",
			},
			reactionType: [
				{
					reactionDbId: null,
					reactionMessageId: "asdasd",
					reactionContext: "Test",
					reactionClientId: "asdasd",
				},
			],
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("invalid MessagePayload - null value reactionMessageId", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.message,
			messageType: {
				messageDbId: "asdasd",
				messageContext: "Test",
				messageTime: "12:00",
				messageDate: "2021-09-01",
			},
			clientType: {
				clientDbId: "asdasd",
			},
			reactionType: [
				{
					reactionDbId: "asdasd",
					reactionMessageId: null,
					reactionContext: "Test",
					reactionClientId: "asdasd",
				},
			],
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("invalid MessagePayload - null value reactionContext", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.message,
			messageType: {
				messageDbId: "asdasd",
				messageContext: "Test",
				messageTime: "12:00",
				messageDate: "2021-09-01",
			},
			clientType: {
				clientDbId: "asdasd",
			},
			reactionType: [
				{
					reactionDbId: "asdasd",
					reactionMessageId: "asdasd",
					reactionContext: null,
					reactionClientId: "asdasd",
				},
			],
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("invalid MessagePayload - null value reactionClientId", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.message,
			messageType: {
				messageDbId: "asdasd",
				messageContext: "Test",
				messageTime: "12:00",
				messageDate: "2021-09-01",
			},
			clientType: {
				clientDbId: "asdasd",
			},
			reactionType: [
				{
					reactionDbId: "asdasd",
					reactionMessageId: "asdasd",
					reactionContext: "Test",
					reactionClientId: null,
				},
			],
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("invalid MessagePayload - missing reactionClientId", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.message,
			messageType: {
				messageDbId: "asdasd",
				messageContext: "Test",
				messageTime: "12:00",
				messageDate: "2021-09-01",
			},
			clientType: {
				clientDbId: "asdasd",
			},
			reactionType: [
				{
					reactionDbId: "asdasd",
					reactionMessageId: "asdasd",
					reactionContext: "Test",
				},
			],
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("invalid MessagePayload - missing reactionContext", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.message,
			messageType: {
				messageDbId: "asdasd",
				messageContext: "Test",
				messageTime: "12:00",
				messageDate: "2021-09-01",
			},
			clientType: {
				clientDbId: "asdasd",
			},
			reactionType: [
				{
					reactionDbId: "asdasd",
					reactionMessageId: "asdasd",
					reactionClientId: "asdasd",
				},
			],
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("invalid MessagePayload - missing reactionMessageId", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.message,
			messageType: {
				messageDbId: "asdasd",
				messageContext: "Test",
				messageTime: "12:00",
				messageDate: "2021-09-01",
			},
			clientType: {
				clientDbId: "asdasd",
			},
			reactionType: [
				{
					reactionDbId: "asdasd",
					reactionContext: "Test",
					reactionClientId: "asdasd",
				},
			],
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});
});

describe("incomingMessages - ReactionPayload", () => {
	// /**
	//  * [[ RESULTING TYPE ]]
	//  *  export type ReactionEntity = {
	//  *     payloadType: PayloadSubType.reaction;
	//  *	 reactionDbId: string;
	//  *     reactionMessageId: string;
	//  *     reactionContext: string;
	//  *     reactionClientId: string;
	//  *  };
	//  *
	//  * @param {int} payloadType
	//  * @param {string} reactionDbId
	//  * @param {string} reactionMessageId
	//  * @param {string} reactionContext
	//  * @param {string} reactionClientId
	//  */
	// export type ReactionPayload = Omit<ReactionEntity, "reactionDbId"> & {
	//     payloadType: PayloadSubType.reaction;
	// };

	// properties: {
	// 	payloadType: {
	// 		type: "number",
	// 	},
	// 	reactionDbId: {
	// 		type: "string",
	// 	},
	// 	reactionMessageId: {
	// 		type: "string",
	// 	},
	// 	reactionContext: {
	// 		type: "string",
	// 	},
	// 	reactionClientId: {
	// 		type: "string",
	// 	},
	// 	availability: {
	// 		type: "boolean",
	// 	},
	// },
	test("valid ReactionPayload", async () => {
		const payload = JSON.stringify({
			payloadType: PayloadSubType.reaction,
			reactionDbId: "asdasd",
			reactionMessageId: "asdasd",
			reactionContext: "Test",
			reactionClientId: "asdasd",
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			payload
		);

		expect(mockServer.publish).toBeCalledTimes(1);
	});

	test("invalid ReactionPayload - null value reactionDbId", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.reaction,
			reactionDbId: null,
			reactionMessageId: "asdasd",
			reactionContext: "Test",
			reactionClientId: "asdasd",
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("invalid ReactionPayload - null value reactionMessageId", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.reaction,
			reactionDbId: "asdasd",
			reactionMessageId: null,
			reactionContext: "Test",
			reactionClientId: "asdasd",
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("invalid ReactionPayload - null value reactionContext", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.reaction,
			reactionDbId: "asdasd",
			reactionMessageId: "asdasd",
			reactionContext: null,
			reactionClientId: "asdasd",
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("invalid ReactionPayload - null value reactionClientId", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.reaction,
			reactionDbId: "asdasd",
			reactionMessageId: "asdasd",
			reactionContext: "Test",
			reactionClientId: null,
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("invalid ReactionPayload - missing reactionClientId", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.reaction,
			reactionDbId: "asdasd",
			reactionMessageId: "asdasd",
			reactionContext: "Test",
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("invalid ReactionPayload - missing reactionContext", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.reaction,
			reactionDbId: "asdasd",
			reactionMessageId: "asdasd",
			reactionClientId: "asdasd",
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("invalid ReactionPayload - missing reactionMessageId", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.reaction,
			reactionDbId: "asdasd",
			reactionContext: "Test",
			reactionClientId: "asdasd",
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("invalid ReactionPayload - missing reactionDbId", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.reaction,
			reactionMessageId: "asdasd",
			reactionContext: "Test",
			reactionClientId: "asdasd",
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("invalid ReactionPayload - empty string reactionDbId", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.reaction,
			reactionDbId: "",
			reactionMessageId: "asdasd",
			reactionContext: "Test",
			reactionClientId: "asdasd",
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("invalid ReactionPayload - empty string reactionMessageId", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.reaction,
			reactionDbId: "asdasd",
			reactionMessageId: "",
			reactionContext: "Test",
			reactionClientId: "asdasd",
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("invalid ReactionPayload - empty string reactionContext", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.reaction,
			reactionDbId: "asdasd",
			reactionMessageId: "asdasd",
			reactionContext: "",
			reactionClientId: "asdasd",
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("invalid ReactionPayload - empty string reactionClientId", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.reaction,
			reactionDbId: "asdasd",
			reactionMessageId: "asdasd",
			reactionContext: "Test",
			reactionClientId: "",
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});
});

describe("incomingMessages - invalid PayloadType", () => {
	test("invalid PayloadType", async () => {
		const payload = JSON.stringify({
			payloadType: "invalid",
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			payload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("invalid payload as simple string", async () => {
		const payload = "invalid";

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			payload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("missing PayloadType", async () => {
		const payload = JSON.stringify({});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			payload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(0);
	});
});

describe("incomingMessages - typing and force payloadType", () => {
	test("valid typing PayloadType", async () => {
		const payload = JSON.stringify({
			payloadType: PayloadSubType.typing,
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			payload
		);

		expect(mockServer.publish).toBeCalledTimes(1);
	});

	test("valid force PayloadType", async () => {
		const payload = JSON.stringify({
			payloadType: PayloadSubType.force,
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			payload
		);

		expect(mockServer.publish).toBeCalledTimes(1);
	});

	test("invalid typing PayloadType", async () => {
		const payload = JSON.stringify({
			payloadType: "typing",
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			payload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("invalid force PayloadType", async () => {
		const payload = JSON.stringify({
			payloadType: "force",
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			payload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("missing PayloadType", async () => {
		const payload = JSON.stringify({});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			payload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(0);
	});

	test("simple return of message", async () => {
		const payload = JSON.stringify({
			payloadType: PayloadSubType.message,
			messageType: {
				messageDbId: "asdasd",
				messageContext: "Test",
				messageTime: "12:00",
				messageDate: "2021-09-01",
				edited: false,
				deleted: false,
			},
			clientType: {
				clientDbId: "asdasd",
			},
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			payload
		);

		expect(mockServer.publish).toBeCalledTimes(1);
	});
});

describe("incomingMessages - clientListPayload", () => {
	test("valid clientListPayload", async () => {
		const payload = JSON.stringify({
			payloadType: PayloadSubType.clientList,
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			payload
		);

		expect(mockServer.publish).toBeCalledTimes(1);
	});
});

describe("incomingMessages - profileUpdatePayload", () => {
	test("valid profileUpdatePayload", async () => {
		const payload = JSON.stringify({
			payloadType: PayloadSubType.profileUpdate,
			clientDbId: "asdasd",
			clientUsername: "Test",
			clientColor: "red",
			clientProfileImage: "image",
			availability: true,
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			payload
		);

		expect(mockServer.publish).toBeCalledTimes(1);
	});

	test("invalid profileUpdatePayload - null value clientDbId", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.profileUpdate,
			clientDbId: null,
			clientUsername: "Test",
			clientColor: "red",
			clientProfileImage: "image",
			availability: true,
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("invalid profileUpdatePayload - empty string clientDbId", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.profileUpdate,
			clientDbId: "",
			clientUsername: "Test",
			clientColor: "red",
			clientProfileImage: "image",
			availability: true,
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("invalid profileUpdatePayload - null value clientUsername", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.profileUpdate,
			clientDbId: "asdasd",
			clientUsername: null,
			clientColor: "red",
			clientProfileImage: "image",
			availability: true,
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("invalid profileUpdatePayload - empty string clientUsername", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.profileUpdate,
			clientDbId: "asdasd",
			clientUsername: "",
			clientColor: "red",
			clientProfileImage: "image",
			availability: true,
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});
	test("invalid profileUpdatePayload - null value clientColor", async () => {

		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.profileUpdate,
			clientDbId: "asdasd",
			clientUsername: "Test",
			clientColor: null,
			clientProfileImage: "image",
			availability: true,
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("valid profileUpdatePayload - empty string clientColor", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.profileUpdate,
			clientDbId: "asdasd",
			clientUsername: "Test",
			clientColor: "",
			clientProfileImage: "image",
			availability: true,
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(1);
	});

	test("invalid profileUpdatePayload - null value clientProfileImage", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.profileUpdate,
			clientDbId: "asdasd",
			clientUsername: "Test",
			clientColor: "red",
			clientProfileImage: null,
			availability: true,
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(0);
		expect(mockWebsocketConnection.close).toBeCalledTimes(1);
	});

	test("valid profileUpdatePayload - empty string clientProfileImage", async () => {
		const invalidPayload = JSON.stringify({
			payloadType: PayloadSubType.profileUpdate,
			clientDbId: "asdasd",
			clientUsername: "Test",
			clientColor: "red",
			clientProfileImage: "",
			availability: true,
		});

		await processIncomingMessage(
			mockWebsocketConnection,
			mockServer,
			invalidPayload
		);

		expect(mockServer.publish).toBeCalledTimes(1);
	});
});
