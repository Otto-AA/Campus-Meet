import Constants from "expo-constants";

export const isE2eTest = (): boolean => {
  return Constants.manifest?.extra?.isE2eTest === true;
};
