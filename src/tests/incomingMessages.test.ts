import { expect, test, describe, afterEach, vi } from "vitest";
import { PayloadSubType } from "../types/payloadTypes";
import { processIncomingMessage } from "../incomingMessages";

const mockWebsocketConnection = {
    send: vi.fn(),
    close: vi.fn(),
} as any;

const mockServer = {
    send: vi.fn(),
    broadcast: vi.fn(),
    publish: vi.fn(),
} as any;

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
        vi.mock("../databaseRequests", () => ({
            persistMessageInDatabase: vi.fn(),
            retrieveUpdatedMessageFromDatabase: vi.fn(),
            retrieveLastMessageFromDatabase: vi.fn(() => ({})),
            updateClientProfileInformation: vi.fn(),
        }));

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

    test.skip("valid MessagePayload - quoteType added", async () => {
        vi.mock("../databaseRequests", () => ({
            persistMessageInDatabase: vi.fn(),
            retrieveUpdatedMessageFromDatabase: vi.fn(),
            retrieveLastMessageFromDatabase: vi.fn(() => ({})),
            updateClientProfileInformation: vi.fn(),
        }));

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
                quoteMessageId: "asdasd",
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
});
