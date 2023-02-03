import Constants, { ExecutionEnvironment } from "expo-constants";

// see https://docs.expo.dev/bare/using-expo-client/
export const isExpoGo = () =>
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
