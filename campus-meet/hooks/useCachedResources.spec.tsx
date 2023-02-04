import { renderHook, act } from "@testing-library/react-native";
import * as SplashScreen from "expo-splash-screen";

import useCachedResources from "./useCachedResources";

jest.mock("expo-font", () => ({
  loadAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock("expo-splash-screen", () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve()),
}));

describe("useCachedResources", () => {
  it("should load resources and data asynchronously", async () => {
    const { result } = renderHook(() => useCachedResources());

    expect(result.current).toBe(false);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(result.current).toBe(true);
  });

  it("should catch errors while loading resources and data", async () => {
    const { result } = renderHook(() => useCachedResources());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current).toBe(true);
  });

  it("should prevent the auto hide of the splash screen", async () => {
    renderHook(() => useCachedResources());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(SplashScreen.preventAutoHideAsync).toHaveBeenCalled();
  });
});
