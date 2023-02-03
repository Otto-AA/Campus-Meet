import { maxBy } from "./max";

describe("maxBy", () => {
  it("returns the maximum of the elements", () => {
    const values = [1, 2, 5, 4];

    const max = maxBy(values, (n) => n);

    expect(max).toBe(5);
  });
});
