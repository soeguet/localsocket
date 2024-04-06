import { expect, test, describe } from "bun:test";
import { hasTooFewFields, hasTooManyFields, isNotNull, matchesExpectedKeys } from "../handlers/nullChecker";


describe("nullChecker", () => {

    test("nullChecker false - field undefined", () => {
        expect(isNotNull({
            message: undefined,
        })).toBe(false);
    });

    test("nullChecker true - only required", () => {
        expect(isNotNull({
            message: "test",
        })).toBe(true);
    });

    test("nullChecker true - include optional field", () => {
        expect(isNotNull({
            message: "test",
            quote: true,
        })).toBe(true);
    });
});

describe("hasTooManyFields", () => {

    test("hasTooManyFields false - within limit", () => {
        expect(hasTooManyFields({
            message: "test",
        }, 1)).toBe(false);
    });

    test("hasTooManyFields true - over limit", () => {
        expect(hasTooManyFields({
            message: "test",
            quote: true,
        }, 1)).toBe(true);
    });
});

describe("hasTooFewFields", () => {

    test("hasTooFewFields false - within limit", () => {
        expect(hasTooFewFields({
            message: "test",
            quote: true,
        }, 2)).toBe(false);
    });

    test("hasTooFewFields true - under limit", () => {
        expect(hasTooFewFields({
            message: "test",
        }, 2)).toBe(true);
    });
});
