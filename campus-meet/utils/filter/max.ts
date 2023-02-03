export const maxBy = <T>(arr: T[], getValue: (element: T) => number): T => {
  let maxElement = arr[0];
  let maxValue = getValue(arr[0]);

  for (let i = 1; i < arr.length; i++) {
    const val = getValue(arr[i]);
    if (val > maxValue) {
      maxValue = val;
      maxElement = arr[i];
    }
  }
  return maxElement;
};
