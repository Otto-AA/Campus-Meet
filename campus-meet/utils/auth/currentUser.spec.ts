import mockedAuth from "../../jest/auth.mock";
import { getCurrentUser, getCurrentUserId } from "./currentUser";

describe("currentUser", () => {
  describe("getCurrentUser", () => {
    it("throws error if not logged in currently", () => {
      mockedAuth.getAuth.mockReturnValue({ currentUser: undefined } as any);

      expect(getCurrentUser).toThrowError("Must be logged in");
    });

    it("returns current user when logged in", () => {
      const fakeCurrentUser = { fake: true };
      mockedAuth.getAuth.mockReturnValue({
        currentUser: fakeCurrentUser,
      } as any);

      const currentUser = getCurrentUser();

      expect(currentUser).toBe(fakeCurrentUser);
    });
  });

  describe("getCurrentUserId", () => {
    it("throws error if not logged in currently", () => {
      mockedAuth.getAuth.mockReturnValue({ currentUser: undefined } as any);

      expect(getCurrentUserId).toThrowError("Must be logged in");
    });

    it("returns current user id when logged in", () => {
      const fakeCurrentUser = { uid: "user-1" };
      mockedAuth.getAuth.mockReturnValue({
        currentUser: fakeCurrentUser,
      } as any);

      const id = getCurrentUserId();

      expect(id).toEqual("user-1");
    });
  });
});
