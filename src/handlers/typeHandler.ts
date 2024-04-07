import ajvValidator from "../validator/ajvValidator";

const messagePayloadvalidator = ajvValidator.getSchema(
    "messagePayloadValidator"
);

const authPayloadValidator = ajvValidator.getSchema("authPayloadValidator");

const reactionPayloadValidator = ajvValidator.getSchema(
    "reactionPayloadValidator"
);

const profileUpdateValidator = ajvValidator.getSchema("profileUpdateValidator");

/**
 * Validates the message payload
 * @param {object} messagePayload
 * @returns {boolean}
 * @throws {Error} Validator not found
 */
export function validateMessagePayload(
    messagePayload: object | null
): boolean | Promise<unknown> {
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

/**
 * Validates the authentication payload
 * @param {object} authenticationPayload
 * @returns {boolean}
 * @throws {Error} Validator not found
 */
export function validateAuthPayload(
    authenticationPayload: object | null
): boolean | Promise<unknown> {
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

/**
 * Validates the reaction payload
 * @param {object} reactionPayload
 * @returns {boolean}
 * @throws {Error} Validator not found
 */
export function validateReactionPayload(
    reactionPayload: object | null
): boolean | Promise<unknown> {
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

/**
 * Validates the client profile update payload
 * @param {object} clientProfileUpdatePayload
 * @returns {boolean}
 * @throws {Error} Validator not found
 */
export function validateclientUpdatePayload(
    clientProfileUpdatePayload: object | null
): boolean | Promise<unknown> {
    if (profileUpdateValidator === undefined) {
        throw new Error("Validator not found");
    }

    console.log("clientProfileUpdatePayload", profileUpdateValidator);
    try {
        return profileUpdateValidator(clientProfileUpdatePayload);
    } catch (error) {
        return false;
    }
}
