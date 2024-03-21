import Ajv from "ajv";

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
            clientDbId: {
                type: "string",
            },
        },
        required: ["payloadType", "clientUsername", "clientDbId"],
        additionalProperties: false,
    },
    "authPayloadValidator"
);

/**
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
                    messageDbId: {
                        type: "string",
                    },
                    messageContext: {
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
                    "messageDbId",
                    "messageContext",
                    "messageTime",
                    "messageDate",
                ],
                additionalProperties: false,
            },
            clientType: {
                type: "object",
                properties: {
                    clientDbId: {
                        type: "string",
                    },
                },
                required: ["clientDbId"],
                additionalProperties: false,
            },
            quoteType: {
                type: "object",
                properties: {
                    quoteDbId: {
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
                    "quoteDbId",
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
                        reactionDbId: {
                            type: "string",
                        },
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
                        "reactionDbId",
                        "reactionMessageId",
                        "reactionContext",
                        "reactionClientId",
                    ],
                    additionalProperties: false,
                },
            },
        },
        required: [
            "payloadType",
            "clientType",
            "messageType",
        ],
        additionalProperties: false,
    },
    "messagePayloadValidator"
);

export default ajvValidator;
