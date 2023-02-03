import { renderHook, act, waitFor } from "@testing-library/react-native";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import * as authModule from "firebase/auth";

import mockedAuth from "../jest/auth.mock";
import mockedFirestore from "../jest/firestore.mock";
import { useAuthentication } from "./useAuthentication";

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
  User: jest.fn(),
}));

describe("useAuthentication", () => {
  it("should set the user when the authentication state changes", async () => {
    const mockUser = { email: "user@example.com" };
    (onAuthStateChanged as jest.Mock).mockImplementationOnce((_, cb) => {
      cb(mockUser);
      return jest.fn();
    });

    const { result } = renderHook(() => useAuthentication());

    expect(result.current.user).toBe(mockUser);
    expect(result.current.initialized).toBe(true);
  });

  it("should set user to undefined when the authentication state changes", async () => {
    (onAuthStateChanged as jest.Mock).mockImplementationOnce((_, cb) => {
      cb(undefined);
      return jest.fn();
    });

    const { result } = renderHook(() => useAuthentication());

    expect(result.current.user).toBe(undefined);
    expect(result.current.initialized).toBe(true);
  });

  it("should call onAuthStateChanged with the returned auth object", async () => {
    const mockAuth = {};
    (getAuth as jest.Mock).mockReturnValueOnce(mockAuth);

    renderHook(() => useAuthentication());

    expect(onAuthStateChanged).toHaveBeenCalledWith(
      mockAuth,
      expect.any(Function)
    );
  });

  it("should return the unsubscribe function from onAuthStateChanged", async () => {
    const unsubscribe = jest.fn();
    (onAuthStateChanged as jest.Mock).mockImplementationOnce(() => unsubscribe);

    const { unmount } = renderHook(() => useAuthentication());

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });

  it("sets the user state correctly", () => {
    const { result } = renderHook(() => useAuthentication());
    const mockUser = undefined;
    act(() => {
      mockedAuth.onAuthStateChanged.mock.calls[0][1](mockUser);
    });

    expect(result.current.user).toEqual(mockUser);
  });

  it("calls getAuth correctly", () => {
    const { result } = renderHook(() => useAuthentication());

    expect(authModule.getAuth).toHaveBeenCalledTimes(6);
    expect(result.current.auth).toBe(authModule.getAuth());
  });
});
