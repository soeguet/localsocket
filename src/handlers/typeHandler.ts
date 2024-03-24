import ajvValidator from "../validator/ajvValidator";

const messagePayloadvalidator = ajvValidator.getSchema(
    "messagePayloadValidator"
);

const authPayloadValidator = ajvValidator.getSchema("authPayloadValidator");

export function validateMessagePayloadTyping(messagePayload: object | null) {
    if (messagePayloadvalidator === undefined) {
        throw new Error("Validator not found");
    }
    return messagePayloadvalidator(messagePayload);
}

export function validateAuthPayloadTyping(
    authenticationPayload: object | null
) {
    if (authPayloadValidator === undefined) {
        throw new Error("Validator not found");
    }
    return authPayloadValidator(authenticationPayload);
}
