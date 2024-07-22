import { describe, expect, test } from "vitest";
import ajvValidator from "../validator/ajvValidator";
import { errorLogger } from "../logger/errorLogger";

describe("validator tests just to be sure everything is fine", () => {
	const validate = ajvValidator.getSchema("testValidator");

	if (validate === undefined) {
		errorLogger.logError(new Error("Schema not found"));
		return;
	}

	test("validator true - only required", () => {
		expect(
			validate({
				message: "test",
			})
		).toBe(true);
	});

	test("validator true - include optional field", () => {
		expect(
			validate({
				message: "test",
				quote: true,
			})
		).toBe(true);
	});

	test("validator false - wrong type", () => {
		expect(
			validate({
				message: 3,
			})
		).toBe(false);
	});

	test("validator false - additional field", () => {
		expect(
			validate({
				message: 3,
				quote: true,
				deleted: true,
			})
		).toBe(false);
	});

	test("validator false - object null", () => {
		expect(validate(null)).toBe(false);
	});

	test("validator false - field undefined", () => {
		expect(
			validate({
				message: undefined,
			})
		).toBe(false);
	});

	test("validator true - optional field undefined", () => {
		expect(
			validate({
				message: "test",
				quote: undefined,
			})
		).toBe(true);
	});
});

describe("ajvValidator tests - authPayloadValidator", () => {
	const validate = ajvValidator.getSchema("authPayloadValidator");

	if (validate === undefined) {
		errorLogger.logError(new Error("Schema not found"));
		return;
	}

	test("authPayloadValidator true - only required", () => {
		expect(
			validate({
				payloadType: 0,
				clientUsername: "test",
				clientDbId: "test",
			})
		).toBe(true);
	});

	test("authPayloadValidator false - wrong type", () => {
		expect(
			validate({
				payloadType: "test",
				clientUsername: "test",
				clientDbId: "test",
			})
		).toBe(false);
	});

	test("authPayloadValidator false - missing field", () => {
		expect(
			validate({
				payloadType: 0,
				clientUsername: "test",
			})
		).toBe(false);
	});

	test("authPayloadValidator false - additional field", () => {
		expect(
			validate({
				payloadType: 0,
				clientUsername: "test",
				clientDbId: "test",
				test: "test",
			})
		).toBe(false);
	});

	test("authPayloadValidator false - object null", () => {
		expect(validate(null)).toBe(false);
	});

	test("authPayloadValidator false - field undefined", () => {
		expect(
			validate({
				payloadType: 0,
				clientUsername: undefined,
				clientDbId: "test",
			})
		).toBe(false);
	});

	test("authPayloadValidator true - optional field undefined", () => {
		expect(
			validate({
				payloadType: 0,
				clientUsername: "test",
				clientDbId: "test",
				clientColor: undefined,
			})
		).toBe(false);
	});
});

describe("ajvValidator tests - messagePayloadValidator", () => {
	const validate = ajvValidator.getSchema("messagePayloadValidator");

	if (validate === undefined) {
		errorLogger.logError(new Error("Schema not found"));
		return;
	}

	test("messagePayloadValidator true - only required", () => {
		expect(
			validate({
				payloadType: 1,
				messageType: {
					messageDbId: "test",
					messageContext: "test",
					messageTime: "test",
					messageDate: new Date().toString(),
					edited: false,
					deleted: false,
				},
				clientType: {
					clientDbId: "test",
				},
			})
		).toBe(true);
	});

	test("messagePayloadValidator false - wrong type", () => {
		expect(
			validate({
				payloadType: "1",
				messageType: {
					messageDbId: "test",
					messageContext: "test",
					messageTime: "test",
					messageDate: new Date().toString(),
				},
				clientType: {
					clientDbId: "test",
				},
				quoteType: {
					quoteMessageId: "test",
					quoteClientId: "test",
					quoteMessageContext: "test",
					quoteTime: "test",
					quoteDate: new Date().toString(),
				},
				reactionType: [
					{
						reactionMessageId: "test",
						reactionContext: "test",
						reactionClientId: "test",
					},
				],
			})
		).toBe(false);
	});

	test("messagePayloadValidator false - missing field", () => {
		expect(
			validate({
				payloadType: 1,
				messageType: {
					messageDbId: "test",
					messageContext: "test",
					messageDate: new Date().toString(),
				},
			})
		).toBe(false);
	});

	test("messagePayloadValidator false - additional field", () => {
		expect(
			validate({
				payloadType: 1,
				messageType: {
					messageDbId: "test",
					messageContext: "test",
					messageTime: "test",
					messageDate: new Date().toString(),
				},
				clientType: {
					clientDbId: "test",
				},
				test: "test",
			})
		).toBe(false);
	});

	test("messagePayloadValidator false - object null", () => {
		expect(validate(null)).toBe(false);
	});

	test("messagePayloadValidator false - field undefined", () => {
		expect(
			validate({
				payloadType: 1,
				messageType: {
					messageDbId: "test",
					messageContext: "test",
					messageTime: "test",
					messageDate: new Date().toString(),
				},
				clientType: {
					clientDbId: undefined,
				},
			})
		).toBe(false);
	});

	test("messagePayloadValidator true - optional field undefined", () => {
		expect(
			validate({
				payloadType: 1,
				messageType: {
					messageDbId: "test",
					messageContext: "test",
					messageTime: "test",
					messageDate: new Date().toString(),
					edited: false,
					deleted: false,
				},
				clientType: {
					clientDbId: "test",
				},
				quoteType: undefined,
				reactionType: undefined,
			})
		).toBe(true);
	});

	test("messagePayloadValidator false - wrong quoteType null", () => {
		expect(
			validate({
				payloadType: 1,
				messageType: {
					messageDbId: "test",
					messageContext: "test",
					messageTime: "test",
					messageDate: new Date().toString(),
					edited: false,
					deleted: false,
				},
				clientType: {
					clientDbId: "test",
				},
				quoteType: null,
			})
		).toBe(true);
	});

	test("messagePayloadValidator false - wrong reactionType format", () => {
		expect(
			validate({
				payloadType: 1,
				messageType: {
					messageDbId: "test",
					messageContext: "test",
					messageTime: "test",
					messageDate: new Date().toString(),
				},
				clientType: {
					clientDbId: "test",
				},
				reactionType: [
					{
						reactionMessageId: "test",
						reactionContext: "test",
						reactionClientId: "test",
						test: "test",
					},
				],
			})
		).toBe(false);
	});

	test("messagePayloadValidator false - wrong quoteType format", () => {
		expect(
			validate({
				payloadType: 1,
				messageType: {
					messageDbId: "test",
					messageContext: "test",
					messageTime: "test",
					messageDate: new Date().toString(),
				},
				clientType: {
					clientDbId: "test",
				},
				quoteType: {
					quoteMessageId: "test",
					quoteClientId: "test",
					quoteMessageContext: "test",
					quoteTime: "test",
					quoteDate: "test",
				},
			})
		).toBe(false);
	});

	test("messagePayloadValidator true - wrong quoteType format", () => {
		expect(
			validate({
				payloadType: 1,
				messageType: {
					messageDbId: "test",
					messageContext: "test",
					messageTime: "test",
					messageDate: new Date().toString(),
				},
				clientType: {
					clientDbId: "test",
				},
				quoteType: [
					{
						quoteMessageId: "test",
						quoteClientId: "test",
						quoteMessageContext: "test",
						quoteTime: "test",
						quoteDate: new Date().toString(),
					},
				],
			})
		).toBe(false);
	});

	test("messagePayloadValidator true - wrong reactionType format", () => {
		expect(
			validate({
				payloadType: 1,
				messageType: {
					messageDbId: "test",
					messageContext: "test",
					messageTime: "test",
					messageDate: new Date().toString(),
				},
				clientType: {
					clientDbId: "test",
				},
				reactionType: [
					{
						reactionMessageId: "test",
						reactionContext: "test",
						reactionClientId: "test",
					},
				],
			})
		).toBe(false);
	});

	test("messagePayloadValidator true - wrong reactionType format", () => {
		expect(
			validate({
				payloadType: 1,
				messageType: {
					messageDbId: "test",
					messageContext: "test",
					messageTime: "test",
					messageDate: new Date().toString(),
				},
				clientType: {
					clientDbId: "test",
				},
				reactionType: {
					reactionMessageId: "test",
					reactionContext: "test",
					reactionClientId: "test",
				},
			})
		).toBe(false);
	});
});

describe("ajvValidator tests - reactionPayloadValidator", () => {
	const validate = ajvValidator.getSchema("reactionPayloadValidator");

	if (validate === undefined) {
		errorLogger.logError(new Error("Schema not found"));
		return;
	}

	test("reactionPayloadValidator true - only required", () => {
		expect(
			validate({
				payloadType: 2,
				reactionDbId: "test",
				reactionMessageId: "test",
				reactionContext: "test",
				reactionClientId: "test",
			})
		).toBe(true);
	});

	test("reactionPayloadValidator false - wrong type", () => {
		expect(
			validate({
				payloadType: "2",
				reactionMessageId: "test",
				reactionContext: "test",
				reactionClientId: "test",
			})
		).toBe(false);
	});

	test("reactionPayloadValidator false - missing field", () => {
		expect(
			validate({
				payloadType: 2,
				reactionMessageId: "test",
				reactionContext: "test",
			})
		).toBe(false);
	});

	test("reactionPayloadValidator false - additional field", () => {
		expect(
			validate({
				payloadType: 2,
				reactionMessageId: "test",
				reactionContext: "test",
				reactionClientId: "test",
				test: "test",
			})
		).toBe(false);
	});

	test("reactionPayloadValidator false - object null", () => {
		expect(validate(null)).toBe(false);
	});

	test("reactionPayloadValidator false - field undefined", () => {
		expect(
			validate({
				payloadType: 2,
				reactionMessageId: undefined,
				reactionContext: "test",
				reactionClientId: "test",
			})
		).toBe(false);
	});

	test("reactionPayloadValidator true - optional field undefined", () => {
		expect(
			validate({
				payloadType: 2,
				reactionDbId: "test",
				reactionMessageId: "test",
				reactionContext: "test",
				reactionClientId: "test",
			})
		).toBe(true);
	});
});

describe("ajvValidator tests - profileUpdateValidator", () => {
	const validate = ajvValidator.getSchema("profileUpdateValidator");

	if (validate === undefined) {
		errorLogger.logError(new Error("Schema not found"));
		return;
	}

	test("profileUpdateValidator true - only required", () => {
		expect(
			validate({
				payloadType: 3,
				clientDbId: "test",
				clientUsername: "test",
				availability: true,
			})
		).toBe(true);
	});

	test("profileUpdateValidator true - all fields", () => {
		expect(
			validate({
				payloadType: 3,
				clientDbId: "test",
				clientUsername: "test",
				clientColor: "test",
				clientProfileImage: "test",
				availability: true,
			})
		).toBe(true);
	});

	test("profileUpdateValidator false - wrong type", () => {
		expect(
			validate({
				payloadType: "3",
				clientDbId: "test",
				clientUsername: "test",
			})
		).toBe(false);
	});

	test("profileUpdateValidator false - missing field", () => {
		expect(
			validate({
				payloadType: 3,
				clientDbId: "test",
			})
		).toBe(false);
	});

	test("profileUpdateValidator false - additional field", () => {
		expect(
			validate({
				payloadType: 3,
				clientDbId: "test",
				clientUsername: "test",
				test: "test",
			})
		).toBe(false);
	});

	test("profileUpdateValidator false - object null", () => {
		expect(validate(null)).toBe(false);
	});

	test("profileUpdateValidator false - field undefined", () => {
		expect(
			validate({
				payloadType: 3,
				clientDbId: undefined,
				clientUsername: "test",
			})
		).toBe(false);
	});

	test("profileUpdateValidator true - optional field undefined", () => {
		expect(
			validate({
				payloadType: 3,
				clientDbId: "test",
				clientUsername: "test",
				clientColor: undefined,
				clientProfileImage: undefined,
				availability: true,
			})
		).toBe(true);
	});
});
