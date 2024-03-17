import { testValidator } from "../validator/ajvValidator";

/**
 * this is a test function, just to be sure the validator is working
 * @param {object} testObject - the object to be tested
 * @returns boolean
 */
export function testFunction(testObject: object | null) {
    return testValidator(testObject);
}
