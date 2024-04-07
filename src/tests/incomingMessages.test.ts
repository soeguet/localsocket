import { expect, test, describe, afterEach, vi } from "vitest";
import { PayloadSubType } from "../types/payloadTypes";
import { processIncomingMessage } from "../incomingMessages";
import { retrieveAllRegisteredUsersFromDatabase } from "../handlers/databaseHandler";

const mockWebsocketConnection = {
    send: vi.fn(),
    close: vi.fn(),
} as any;

const mockServer = {
    send: vi.fn(),
    broadcast: vi.fn(),
    publish: vi.fn(),
} as any;

vi.mock("../databaseRequests", () => ({
    persistMessageInDatabase: vi.fn(),
    retrieveUpdatedMessageFromDatabase: vi.fn(),
    retrieveLastMessageFromDatabase: vi.fn(() => ({})),
    updateClientProfileInformation: vi.fn(),
}));

// /**
//  * [[ RESULTING TYPE ]]
//  * export type ClientEntity = {
//  *    clientDbId: string;
//  *    clientUsername: string;
//  *    clientColor?: string;
//  *    clientProfileImage?: string;
//  * };
//  *
//  * @param {string} clientDbId
//  * @param {string} clientUsername
//  * @param {string} clientColor
//  * @param {string} clientProfileImage
//  */
// export type ClientEntity = {
//     clientDbId: string;
//     clientUsername: string;
//     clientColor?: string;
//     clientProfileImage?: string;
// };
vi.mock("../handlers/databaseHandler.ts", () => ({
    persistReactionToDatabase: vi.fn(),
    registerUserInDatabse: vi.fn(),
    retrieveAllRegisteredUsersFromDatabase: vi.fn(() => [
        {
            clientDbId: "1",
            clientUsername: "test",
        },
        {
            clientDbId: "2",
            clientUsername: "test2",
        },
    ]),
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

        expect(mockServer.publish).toBeCalledTimes(1);
    });

    test("invalid AuthPayload - empty string clientDbId", async () => {
        const invalidPayload = JSON.stringify({
            payloadType: PayloadSubType.auth,
            clientUsername: "Test",
            clientDbId: "",
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
    //  *     reactionMessageId: string;
    //  *     reactionContext: string;
    //  *     reactionClientId: string;
    //  *  };
    //  *
    //  * @param {int} payloadType
    //  * @param {string} reactionMessageId
    //  * @param {string} reactionContext
    //  * @param {string} reactionClientId
    //  */
    // export type ReactionPayload = Omit<ReactionEntity, "reactionDbId"> & {
    //     payloadType: PayloadSubType.reaction;
    // };

    test("valid ReactionPayload", async () => {
        const payload = JSON.stringify({
            payloadType: PayloadSubType.reaction,
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
});
