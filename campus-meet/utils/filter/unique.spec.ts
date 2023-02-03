import { unique } from "./unique";

describe("unique", () => {
  test("unique returns only unique elements", () => {
    const data = [1, 1, 2, 3, 3, 4].map((n) => ({ foo: n }));

    const result = unique(data, (el) => el.foo);

    expect(result.map((obj) => obj.foo)).toEqual([1, 2, 3, 4]);
  });
});
