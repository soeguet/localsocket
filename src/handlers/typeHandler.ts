import ajvValidator from "../validator/ajvValidator";

const messagePayloadvalidator = ajvValidator.getSchema("messagePayloadValidator",);
const reactionPayloadValidator = ajvValidator.getSchema("reactionPayloadValidator",);
const authPayloadValidator = ajvValidator.getSchema("authPayloadValidator");
const profileUpdateValidator = ajvValidator.getSchema("profileUpdateValidator");
const deletePayloadValidator = ajvValidator.getSchema("deletePayloadValidator");
const editPayloadValidator = ajvValidator.getSchema("editPayloadValidator");
const emergencyInitPayloadValidator = ajvValidator.getSchema("emergencyInitPayloadValidator");
const emergencyMessagePayloadValidator = ajvValidator.getSchema("emergencyMessagePayloadValidator");

/**
 * Validates the message payload
 * @param {object} messagePayload
 * @returns {boolean}
 * @throws {Error} Validator not found
 */
export function validateMessagePayload(
	messagePayload: object | null,
): boolean | Promise<unknown> {
	if (messagePayloadvalidator === undefined) {
		throw new Error("Validator not found");
	}

	try {
		return messagePayloadvalidator(messagePayload);
	} catch (error) {
		return false;
	}
}

export function validateEmergencyInitPayload(
	emergencyInitPayload: object | null,
): boolean | Promise<unknown> {
	if (emergencyInitPayloadValidator === undefined) {
		throw new Error("Validator not found");
	}

	try {
		return emergencyInitPayloadValidator(emergencyInitPayload);
	} catch (error) {
		return false;
	}
}

export function validateEmergencyPayload(
	emergencyPayload: object | null,
): boolean | Promise<unknown> {
	if (emergencyMessagePayloadValidator === undefined) {
		throw new Error("Validator not found");
	}

	try {
		return emergencyMessagePayloadValidator(emergencyPayload);
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
	authenticationPayload: object | null,
): boolean | Promise<unknown> {
	if (authPayloadValidator === undefined) {
		throw new Error("Validator not found");
	}

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
	reactionPayload: object | null,
): boolean | Promise<unknown> {
	if (reactionPayloadValidator === undefined) {
		throw new Error("Validator not found");
	}

	try {
		return reactionPayloadValidator(reactionPayload);
	} catch (error) {
		return false;
	}
}

/**
 * Validates the delete payload
 * @param {object} deletePayload
 * @returns {boolean}
 * @throws {Error} Validator not found
 */
export function validateDeletePayload(
	deletePayload: object | null,
): boolean | Promise<unknown> {
	if (deletePayloadValidator === undefined) {
		throw new Error("Validator not found");
	}

	try {
		return deletePayloadValidator(deletePayload);
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
	clientProfileUpdatePayload: object | null,
): boolean | Promise<unknown> {
	if (profileUpdateValidator === undefined) {
		throw new Error("Validator not found");
	}

	try {
		return profileUpdateValidator(clientProfileUpdatePayload);
	} catch (error) {
		return false;
	}
}

/**
 * Validates the edit payload
 * @param {object} editPayload
 * @returns {boolean}
 * @throws {Error} Validator not found
 */
export function validateEditPayload(
	editPayload: object | null,
): boolean | Promise<unknown> {
	if (editPayloadValidator === undefined) {
		throw new Error("Validator not found");
	}

	try {
		return editPayloadValidator(editPayload);
	} catch (error) {
		return false;
	}
}
