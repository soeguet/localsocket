import Ajv from "ajv";
import { PayloadSubType } from "../types/payloadTypes";
import { which } from "bun";

const ajvValidator = new Ajv();

ajvValidator.addSchema(
    {
        type: "object",
        properties: {
            message: {
                type: "string",
            },
            quote: {
                type: "boolean",
            },
        },
        required: ["message"],
        additionalProperties: false,
    },
    "testValidator"
);

ajvValidator.addSchema(
    {
        type: "object",
        properties: {
            payloadType: {
                type: "number",
            },
            clientUsername: {
                type: "string",
            },
            clientId: {
                type: "string",
            },
        },
        required: ["payloadType", "clientUsername", "clientId"],
        additionalProperties: false,
    },
    "authPayloadValidator"
);

/**
 * export type MessagePayload = {
 *      payloadType: PayloadSubType.message;
 *      messageType: {
 *          messageId: string;
 *          messageConext: string;
 *          messageTime: string;
 *          messageDate: Date;
 *      };
 *      clientType: {
 *          clientId: string;
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
ajvValidator.addSchema(
    {
        type: "object",
        properties: {
            payloadType: {
                type: "number",
            },
            messageType: {
                type: "object",
                properties: {
                    messageId: {
                        type: "string",
                    },
                    messageConext: {
                        type: "string",
                    },
                    messageTime: {
                        type: "string",
                    },
                    messageDate: {
                        type: "string",
                    },
                },
                required: [
                    "messageId",
                    "messageConext",
                    "messageTime",
                    "messageDate",
                ],
                additionalProperties: false,
            },
            quoteType: {
                type: "object",
                properties: {
                    quoteMessageId: {
                        type: "string",
                    },
                    quoteClientId: {
                        type: "string",
                    },
                    quoteMessageContext: {
                        type: "string",
                    },
                    quoteTime: {
                        type: "string",
                    },
                    quoteDate: {
                        type: "string",
                    },
                },
                required: [
                    "quoteMessageId",
                    "quoteClientId",
                    "quoteMessageContext",
                    "quoteTime",
                    "quoteDate",
                ],
                additionalProperties: false,
            },
            reactionType: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        reactionMessageId: {
                            type: "string",
                        },
                        reactionContext: {
                            type: "string",
                        },
                        reactionClientId: {
                            type: "string",
                        },
                    },
                    required: [
                        "reactionMessageId",
                        "reactionContext",
                        "reactionClientId",
                    ],
                    additionalProperties: false,
                },
            },
        },
        // required: ["message", "payloadType"],
        required: ["payloadType", "messageType"],
        additionalProperties: false,
    },
    "messagePayloadValidator"
);

export default ajvValidator;
