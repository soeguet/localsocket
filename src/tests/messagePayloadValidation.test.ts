import ajvValidator from "../validator/ajvValidator";
import { expect, test, describe } from "bun:test";

describe("validate message payload from client", () => {
    const validate = ajvValidator.getSchema("messagePayloadValidator");

    if (validate === undefined) {
        throw new Error("Schema not found");
    }

    test("validator false - wrong object", () => {
        expect(
            validate({
                message: "test",
            })
        ).toBe(false);
    });

    test("validator true - correct object - required only", () => {
        expect(
            validate({
                payloadType: 1,
                clientType: {
                    clientDbId: "test",
                },
                messageType: {
                    messageDbId: "test",
                    messageContext: "test",
                    messageTime: "test",
                    messageDate: "test",
                },
            })
        ).toBe(true);
    });

    test("validator true - correct object - required + quoteType", () => {
        expect(
            validate({
                payloadType: 1,
                clientType: {
                    clientDbId: "test",
                },
                messageType: {
                    messageDbId: "test",
                    messageContext: "test",
                    messageTime: "test",
                    messageDate: "test",
                },
                quoteType: {
                    quoteDbId: "test",
                    quoteClientId: "test",
                    quoteMessageContext: "test",
                    quoteTime: "test",
                    quoteDate: "test",
                },
            })
        ).toBe(true);
    });

    test("validator true - correct object - required + quoteType + reactionType", () => {
        expect(
            validate({
                payloadType: 1,
                clientType: {
                    clientDbId: "test",
                },
                messageType: {
                    messageDbId: "test",
                    messageContext: "test",
                    messageTime: "test",
                    messageDate: "test",
                },
                quoteType: {
                    quoteDbId: "test",
                    quoteClientId: "test",
                    quoteMessageContext: "test",
                    quoteTime: "test",
                    quoteDate: "test",
                },
                reactionType: [
                    {
                        reactionDbId: "test",
                        reactionMessageId: "test",
                        reactionContext: "test",
                        reactionClientId: "test",
                    },
                ],
            })
        ).toBe(true);
    });

    test("validator false - correct object - random typing", () => {
        expect(
            validate({
                payloadType: 1,
                clientType: {
                    clientDbId: "test",
                },
                messageType: {
                    messageDbId: "test",
                    messageContext: 5,
                    messageTime: "test",
                    messageDate: "test",
                },
                quoteType: {
                    quoteMessageId: "test",
                    quoteClientId: "test",
                    quoteMessageContext: "test",
                    quoteTime: "test",
                    quoteDate: "test",
                },
                reactionType: [
                    {
                        reactionMessageId: "test",
                        reactionContext: "test",
                        reactionClientId: "test",
                    },
                ],
            })
        ).toBe(false);
    });
});
