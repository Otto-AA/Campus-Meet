import { validateEmail } from "./email";

test("validateEmail returns false for undefined", () => {
  expect(validateEmail(undefined)).toBe(false);
});

test("validateEmail returns false for empty string", () => {
  expect(validateEmail("")).toBe(false);
});

test("validateEmail returns false for foo@bar string", () => {
  expect(validateEmail("foo@bar")).toBe(false);
});

test("validateEmail returns true for foo@bar string", () => {
  expect(validateEmail("foo@bar.com")).toBe(true);
});
