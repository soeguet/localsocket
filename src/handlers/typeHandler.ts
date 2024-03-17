import ajvValidator from "../validator/ajvValidator";

const messagePayloadvalidator = ajvValidator.getSchema(
    "messagePayloadValidator"
);

export function validateMessagePayloadTyping(messagePayload: object | null) {
    if (messagePayloadvalidator === undefined) {
        throw new Error("Validator not found");
    }
    return messagePayloadvalidator(messagePayload);
}
