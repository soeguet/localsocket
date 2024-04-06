import ajvValidator from "../validator/ajvValidator";
import { expect, test, describe } from "vitest";

describe("validator tests just to be sure everything is fine", () => {
    const validate = ajvValidator.getSchema("testValidator");

    if (validate === undefined) {
        throw new Error("Schema not found");
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
