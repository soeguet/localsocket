import ajvValidator from "../validator/ajvValidator";

const messagePayloadvalidator = ajvValidator.getSchema(
	"messagePayloadValidator"
);
const reactionPayloadValidator = ajvValidator.getSchema(
	"reactionPayloadValidator"
);
const authPayloadValidator = ajvValidator.getSchema("authPayloadValidator");
const profileUpdateValidator = ajvValidator.getSchema("profileUpdateValidator");
const deletePayloadValidator = ajvValidator.getSchema("deletePayloadValidator");
const editPayloadValidator = ajvValidator.getSchema("editPayloadValidator");
const newProfilePictureValidator = ajvValidator.getSchema(
	"newProfilePictureValidator"
);
const fetchProfilePictureValidator = ajvValidator.getSchema(
	"fetchProfilePictureValidator"
);
const fetchCurrentClientProfilePictureHashValidator = ajvValidator.getSchema(
	"fetchCurrentClientProfilePictureHashValidator"
);
const fetchAllProfilePicturesValidator = ajvValidator.getSchema(
	"fetchAllProfilePicturesValidator"
);
const emergencyInitPayloadValidator = ajvValidator.getSchema(
	"emergencyInitPayloadValidator"
);
const emergencyMessagePayloadValidator = ajvValidator.getSchema(
	"emergencyMessagePayloadValidator"
);

export function validateNewProfilePicturePayload(
	newProfilePicturePayload: object | null
): boolean | Promise<unknown> {
	if (newProfilePictureValidator === undefined) {
		throw new Error("Validator not found");
	}

	try {
		return newProfilePictureValidator(newProfilePicturePayload);
	} catch (error) {
		console.error("Error validating new profile picture payload", error);
		return false;
	}
}

export function validateFetchProfilePicturePayload(
	fetchProfilePicturePayload: object | null
): boolean | Promise<unknown> {
	if (fetchProfilePictureValidator === undefined) {
		throw new Error("Validator not found");
	}

	try {
		return fetchProfilePictureValidator(fetchProfilePicturePayload);
	} catch (error) {
		console.error("Error validating fetch profile picture payload", error);
		return false;
	}
}

export function validateFetchCurrentClientProfilePictureHashPayload(
	fetchCurrentClientProfilePictureHashPayload: object | null
): boolean | Promise<unknown> {
	if (fetchCurrentClientProfilePictureHashValidator === undefined) {
		throw new Error("Validator not found");
	}

	try {
		return fetchCurrentClientProfilePictureHashValidator(
			fetchCurrentClientProfilePictureHashPayload
		);
	} catch (error) {
		console.error(
			"Error validating fetch current client profile picture hash payload",
			error
		);
		return false;
	}
}

export function validateFetchAllProfilePicturesPayload(
	fetchAllProfilePicturesPayload: object | null
): boolean | Promise<unknown> {
	if (fetchAllProfilePicturesValidator === undefined) {
		throw new Error("Validator not found");
	}

	try {
		return fetchAllProfilePicturesValidator(fetchAllProfilePicturesPayload);
	} catch (error) {
		console.error(
			"Error validating fetch all profile pictures payload",
			error
		);
		return false;
	}
}

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

	try {
		return messagePayloadvalidator(messagePayload);
	} catch (error) {
		console.error("Error validating message payload", error);
		return false;
	}
}

export function validateEmergencyInitPayload(
	emergencyInitPayload: object | null
): boolean | Promise<unknown> {
	if (emergencyInitPayloadValidator === undefined) {
		throw new Error("Validator not found");
	}

	try {
		return emergencyInitPayloadValidator(emergencyInitPayload);
	} catch (error) {
		console.error("Error validating emergency init payload", error);
		return false;
	}
}

export function validateEmergencyMessagePayload(
	emergencyPayload: object | null
): boolean | Promise<unknown> {
	if (emergencyMessagePayloadValidator === undefined) {
		throw new Error("Validator not found");
	}

	try {
		return emergencyMessagePayloadValidator(emergencyPayload);
	} catch (error) {
		console.error("Error validating emergency payload", error);
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

	try {
		return authPayloadValidator(authenticationPayload);
	} catch (error) {
		console.error("Error validating authentication payload", error);
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

	try {
		return reactionPayloadValidator(reactionPayload);
	} catch (error) {
		console.error("Error validating reaction payload", error);
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
	deletePayload: object | null
): boolean | Promise<unknown> {
	if (deletePayloadValidator === undefined) {
		throw new Error("Validator not found");
	}

	try {
		return deletePayloadValidator(deletePayload);
	} catch (error) {
		console.error("Error validating delete payload", error);
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

	try {
		return profileUpdateValidator(clientProfileUpdatePayload);
	} catch (error) {
		console.error("Error validating client profile update payload", error);
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
	editPayload: object | null
): boolean | Promise<unknown> {
	if (editPayloadValidator === undefined) {
		throw new Error("Validator not found");
	}

	try {
		return editPayloadValidator(editPayload);
	} catch (error) {
		console.error("Error validating edit payload", error);
		return false;
	}
}
