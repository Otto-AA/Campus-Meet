import { DateTime } from "luxon";

import { daysDiff, isToday } from "./datetime";

const CURRENT_DATE = new Date();

describe("datetime", () => {
  beforeAll(() => {
    jest.useFakeTimers({
      doNotFake: ["nextTick"],
      now: CURRENT_DATE,
    });
  });
  describe("isToday", () => {
    it("returns true for same day and same time", () => {
      const dt = DateTime.fromJSDate(CURRENT_DATE);

      expect(isToday(dt)).toBe(true);
    });

    it("returns true for same day and different time", () => {
      const dt = DateTime.fromJSDate(CURRENT_DATE).endOf("day");

      expect(isToday(dt)).toBe(true);
    });

    it("returns false for tomorrow", () => {
      const dt = DateTime.fromJSDate(CURRENT_DATE).plus({ days: 1 });

      expect(isToday(dt)).toBe(false);
    });

    it("returns false for exactly one year ago", () => {
      const dt = DateTime.fromJSDate(CURRENT_DATE).minus({ years: 1 });

      expect(isToday(dt)).toBe(false);
    });
  });

  describe("daysDiff", () => {
    it("returns 0 for the same day", () => {
      const a = DateTime.now().startOf("day");
      const b = a.endOf("day");

      expect(daysDiff(a, b)).toBe(0);
    });

    it("returns -1 for yesterday", () => {
      const a = DateTime.now();
      const b = a.minus({ days: 1 });

      expect(daysDiff(a, b)).toBe(-1);
    });

    it("returns 365 for one year in the future", () => {
      const a = DateTime.now();
      const b = a.plus({ days: 365 });

      expect(daysDiff(a, b)).toBe(365);
    });
  });

  afterAll(() => {
    jest.useRealTimers();
  });
});
