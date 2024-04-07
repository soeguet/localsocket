import ajvValidator from "../validator/ajvValidator";

const messagePayloadvalidator = ajvValidator.getSchema(
    "messagePayloadValidator"
);

const authPayloadValidator = ajvValidator.getSchema("authPayloadValidator");

const reactionPayloadValidator = ajvValidator.getSchema(
    "reactionPayloadValidator"
);

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
    } catch (error) {
        return false;
    }
}

export function validateReactionPayloadTyping(reactionPayload: object | null) {
    if (reactionPayloadValidator === undefined) {
        throw new Error("Validator not found");
    }

    console.log("reactionPayload", reactionPayload);
    try {
        return reactionPayloadValidator(reactionPayload);
    } catch (error) {
        return false;
    }
}
