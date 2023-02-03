import { newestFirst, oldestFirst } from "./sortByDate";

const timestampsToDateObjects = (timestamps: number[]) =>
  timestamps.map((time) => {
    return {
      date: new Date(time),
    };
  });

describe("sortByDate", () => {
  it("newestFirst returns newest elements first", () => {
    const objs = timestampsToDateObjects([1, 5, 4]);

    objs.sort(newestFirst);

    expect(objs.map(({ date }) => date.getTime())).toEqual([5, 4, 1]);
  });

  it("oldestFirst returns oldest elements first", () => {
    const objs = timestampsToDateObjects([1, 5, 4]);

    objs.sort(oldestFirst);

    expect(objs.map(({ date }) => date.getTime())).toEqual([1, 4, 5]);
  });
});
