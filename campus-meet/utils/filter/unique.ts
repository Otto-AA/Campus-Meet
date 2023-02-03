export const unique = <T, X>(arr: T[], getDataToCompare: (element: T) => X) => {
  return arr.filter(
    (a, indexA) =>
      !arr.some(
        (b, indexB) =>
          indexA > indexB && getDataToCompare(a) === getDataToCompare(b)
      )
  );
};
