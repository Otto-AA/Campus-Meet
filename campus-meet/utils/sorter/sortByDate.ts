export interface IDated {
  date: Date;
}

export const oldestFirstBy =
  <T>(getDate: (element: T) => Date) =>
  (a: T, b: T) =>
    getDate(a).getTime() - getDate(b).getTime();

export const newestFirstBy =
  <T>(getDate: (element: T) => Date) =>
  (a: T, b: T) =>
    getDate(b).getTime() - getDate(a).getTime();

export const oldestFirst = oldestFirstBy<IDated>((element) => element.date);

export const newestFirst = newestFirstBy<IDated>((element) => element.date);
