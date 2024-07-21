import { errorLogger } from "../logger/errorLogger";
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

const bannerPayloadValidator = ajvValidator.getSchema("bannerPayloadValidator");
const bannerListPayloadValidator = ajvValidator.getSchema(
	"bannerListPayloadValidator"
);
const errorLogValidator = ajvValidator.getSchema("errorLogValidator");

export function validateErrorLogPayload(
	errorLogPayload: object | null | unknown
): boolean | Promise<unknown> {
	if (errorLogValidator === undefined) {
		errorLogger.logError(new Error("errorLogValidator not found"));
		return false;
	}

	try {
		return errorLogValidator(errorLogPayload);
	} catch (error) {
		errorLogger.logError(error);
		return false;
	}
}

export function validateBannerPayload(
	bannerPayload: object | null | unknown
): boolean | Promise<unknown> {
	if (bannerPayloadValidator === undefined) {
		errorLogger.logError(new Error("bannerPayloadValidator not found"));
		return false;
	}

	try {
		return bannerPayloadValidator(bannerPayload);
	} catch (error) {
		errorLogger.logError(error);
		return false;
	}
}

export function validateBannerListPayload(
	bannerListPayload: object | null | unknown
): boolean | Promise<unknown> {
	if (bannerListPayloadValidator === undefined) {
		errorLogger.logError(new Error("bannerListPayloadValidator not found"));
		return false;
	}

	try {
		return bannerListPayloadValidator(bannerListPayload);
	} catch (error) {
		errorLogger.logError(error);
		return false;
	}
}

export function validateNewProfilePicturePayload(
	newProfilePicturePayload: object | null | unknown
): boolean | Promise<unknown> {
	if (newProfilePictureValidator === undefined) {
		errorLogger.logError(new Error("Validator not found"));
		return false;
	}

	try {
		return newProfilePictureValidator(newProfilePicturePayload);
	} catch (error) {
		errorLogger.logError(error);
		return false;
	}
}

export function validateFetchProfilePicturePayload(
	fetchProfilePicturePayload: object | null | unknown
): boolean | Promise<unknown> {
	if (fetchProfilePictureValidator === undefined) {
		errorLogger.logError(new Error("Validator not found"));
		return false;
	}

	try {
		return fetchProfilePictureValidator(fetchProfilePicturePayload);
	} catch (error) {
		errorLogger.logError(error);
		return false;
	}
}

export function validateFetchCurrentClientProfilePictureHashPayload(
	fetchCurrentClientProfilePictureHashPayload: object | null | unknown
): boolean | Promise<unknown> {
	if (fetchCurrentClientProfilePictureHashValidator === undefined) {
		errorLogger.logError(new Error("Validator not found"));
		return false;
	}

	try {
		return fetchCurrentClientProfilePictureHashValidator(
			fetchCurrentClientProfilePictureHashPayload
		);
	} catch (error) {
		errorLogger.logError(error);
		return false;
	}
}

export function validateFetchAllProfilePicturesPayload(
	fetchAllProfilePicturesPayload: object | null | unknown
): boolean | Promise<unknown> {
	if (fetchAllProfilePicturesValidator === undefined) {
		errorLogger.logError(new Error("Validator not found"));
		return false;
	}

	try {
		return fetchAllProfilePicturesValidator(fetchAllProfilePicturesPayload);
	} catch (error) {
		errorLogger.logError(error);
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
	messagePayload: object | null | unknown
): boolean | Promise<unknown> {
	if (messagePayloadvalidator === undefined) {
		errorLogger.logError(new Error("Validator not found"));
		return false;
	}

	try {
		return messagePayloadvalidator(messagePayload);
	} catch (error) {
		errorLogger.logError(error);
		return false;
	}
}

export function validateEmergencyInitPayload(
	emergencyInitPayload: object | null | unknown
): boolean | Promise<unknown> {
	if (emergencyInitPayloadValidator === undefined) {
		errorLogger.logError(new Error("Validator not found"));
		return false;
	}

	try {
		return emergencyInitPayloadValidator(emergencyInitPayload);
	} catch (error) {
		errorLogger.logError(error);
		return false;
	}
}

export function validateEmergencyMessagePayload(
	emergencyPayload: object | null | unknown
): boolean | Promise<unknown> {
	if (emergencyMessagePayloadValidator === undefined) {
		errorLogger.logError(new Error("Validator not found"));
		return false;
	}

	try {
		return emergencyMessagePayloadValidator(emergencyPayload);
	} catch (error) {
		errorLogger.logError(error);
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
	authenticationPayload: object | null | unknown
): boolean | Promise<unknown> {
	if (authPayloadValidator === undefined) {
		errorLogger.logError(new Error("Validator not found"));
		return false;
	}

	try {
		return authPayloadValidator(authenticationPayload);
	} catch (error) {
		errorLogger.logError(error);
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
	reactionPayload: object | null | unknown
): boolean | Promise<unknown> {
	if (reactionPayloadValidator === undefined) {
		errorLogger.logError(new Error("Validator not found"));
		return false;
	}

	try {
		return reactionPayloadValidator(reactionPayload);
	} catch (error) {
		errorLogger.logError(error);
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
	deletePayload: object | null | unknown
): boolean | Promise<unknown> {
	if (deletePayloadValidator === undefined) {
		errorLogger.logError(new Error("Validator not found"));
		return false;
	}

	try {
		return deletePayloadValidator(deletePayload);
	} catch (error) {
		errorLogger.logError(error);
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
	clientProfileUpdatePayload: object | null | unknown
): boolean | Promise<unknown> {
	if (profileUpdateValidator === undefined) {
		errorLogger.logError(new Error("Validator not found"));
		return false;
	}

	try {
		return profileUpdateValidator(clientProfileUpdatePayload);
	} catch (error) {
		errorLogger.logError(error);
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
	editPayload: object | null | unknown
): boolean | Promise<unknown> {
	if (editPayloadValidator === undefined) {
		errorLogger.logError(new Error("Validator not found"));
		return false;
	}

	try {
		return editPayloadValidator(editPayload);
	} catch (error) {
		errorLogger.logError(error);
		return false;
	}
}
