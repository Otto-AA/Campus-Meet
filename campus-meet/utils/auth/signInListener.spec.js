import AsyncStorageMock from "@react-native-async-storage/async-storage/jest/async-storage-mock";
import * as Linking from "expo-linking";
import * as firebaseAuth from "firebase/auth";

import { checkForSignInLink } from "./signInListener";

jest.mock("expo-linking");
jest.mock("firebase/auth");

AsyncStorageMock.getItem = jest.fn(() => "fake@mail.com");

beforeEach(() => {
  jest.clearAllMocks();
});

test("checkForSignInLink calls signInWithEmailLink given initial url", (done) => {
  Linking.getInitialURL.mockResolvedValue("fake:url");
  firebaseAuth.getAuth.mockReturnValue("fake auth");
  firebaseAuth.isSignInWithEmailLink.mockReturnValue(true);
  // workaround because checkForSignInLink does not return a promise to await the callback
  firebaseAuth.signInWithEmailLink.mockImplementation(
    (fakeAuth, email, url) => {
      expect(fakeAuth).toEqual("fake auth");
      expect(email).toEqual("fake@mail.com");
      expect(url).toEqual("fake:url");
      done();
    }
  );

  checkForSignInLink();
});

test("checkForSignInLink calls signInWithEmailLink on url change", async () => {
  Linking.getInitialURL.mockResolvedValue(null);
  firebaseAuth.getAuth.mockReturnValue("fake auth");
  firebaseAuth.isSignInWithEmailLink.mockReturnValue(true);
  firebaseAuth.signInWithEmailLink.mockResolvedValue();

  checkForSignInLink();

  const callback = Linking.addEventListener.mock.calls[0][1];
  expect(typeof callback).toEqual("function");

  await callback({ url: "fake:url" });

  expect(firebaseAuth.signInWithEmailLink).toHaveBeenCalledWith(
    "fake auth",
    "fake@mail.com",
    "fake:url"
  );
});

test("checkForSignInLink calls Linking.addEventListener", () => {
  checkForSignInLink();

  expect(Linking.addEventListener).toHaveBeenCalled();
});
