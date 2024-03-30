import ajvValidator from "../validator/ajvValidator";

const messagePayloadvalidator = ajvValidator.getSchema(
    "messagePayloadValidator"
);

const authPayloadValidator = ajvValidator.getSchema("authPayloadValidator");

export function validateMessagePayloadTyping(messagePayload: object | null) {
    if (messagePayloadvalidator === undefined) {
        throw new Error("Validator not found");
    }

    console.log("messagePayload", messagePayload);
    try {
        return messagePayloadvalidator(messagePayload);
    } catch (error) {
        return false;
    }
}

export function validateAuthPayloadTyping(
    authenticationPayload: object | null
) {
    if (authPayloadValidator === undefined) {
        throw new Error("Validator not found");
    }

    console.log("authenticationPayload", authenticationPayload);
    try {
        return authPayloadValidator(authenticationPayload);
    }
    catch (error) {
        return false;
    }
}
