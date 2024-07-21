import { errorLogger } from "../logger/errorLogger";
import ajvValidator from "../validator/ajvValidator";
import { expect, test, describe } from "vitest";

describe("validate auth payload from client", () => {
	const validate = ajvValidator.getSchema("authPayloadValidator");

	if (validate === undefined) {
		errorLogger.logError(new Error("Schema not found"));
		return;
	}

	test("validator false - wrong object", () => {
		expect(
			validate({
				message: "test",
			})
		).toBe(false);
	});

	test("validator true - correct object", () => {
		expect(
			validate({
				payloadType: 1,
				clientUsername: "test",
				clientDbId: "test",
			})
		).toBe(true);
	});

	test("validator false - missing field", () => {
		expect(
			validate({
				payloadType: 1,
				clientUsername: "test",
			})
		).toBe(false);
	});

	test("validator false - wrong type", () => {
		expect(
			validate({
				payloadType: 1,
				clientUsername: "test",
				clientDbId: 1,
			})
		).toBe(false);
	});
});
