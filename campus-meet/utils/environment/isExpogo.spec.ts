import Constants, { ExecutionEnvironment } from "expo-constants";

import { isExpoGo } from "./isExpoGo";

describe("isExpoGo", () => {
  it("returns true when the execution environment is StoreClient", () => {
    Constants.executionEnvironment = ExecutionEnvironment.StoreClient;

    expect(isExpoGo()).toBe(true);
  });

  it("returns false when the execution environment is not StoreClient", () => {
    Constants.executionEnvironment = ExecutionEnvironment.Standalone;

    expect(isExpoGo()).toBe(false);
  });
});
