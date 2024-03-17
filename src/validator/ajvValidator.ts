import Ajv from "ajv";

const ajv = new Ajv();

ajv.addSchema(
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

ajv.addSchema(
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
    "messagePayloadValidator"
);

export default ajv;
