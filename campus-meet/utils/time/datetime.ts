import { DateTime } from "luxon";

export const isToday = (dt: DateTime) => {
  return daysDiff(dt, DateTime.now()) === 0;
};

export const daysDiff = (from: DateTime, to: DateTime) => {
  return to.startOf("day").diff(from.startOf("day"), "days").days;
};
