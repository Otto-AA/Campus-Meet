export const cached = <T>(callback: () => T) => {
  let cachedReturnValue: T | undefined;
  return () => {
    if (!cachedReturnValue) {
      cachedReturnValue = callback();
    }
    return cachedReturnValue;
  };
};
