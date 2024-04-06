import { expect, test, describe, afterEach } from "bun:test";
import { PayloadSubType } from "../types/payloadTypes";
import { processIncomingMessage } from "../incomingMessages";
import { jest } from "@jest/globals";

const mockWebsocketConnection = {
    send: jest.fn(),
    close: jest.fn(),
} as any;

const mockServer = {
    send: jest.fn(),
    broadcast: jest.fn(),
    publish: jest.fn(),
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
    test.skip("valid MessagePayload", async () => {
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
});
