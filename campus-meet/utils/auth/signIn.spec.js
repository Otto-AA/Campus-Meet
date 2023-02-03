import AsyncStorageMock from "@react-native-async-storage/async-storage/jest/async-storage-mock";
import * as Linking from "expo-linking";
import * as firebaseAuth from "firebase/auth";

import { sendSignInEmail } from "./signIn";

jest.mock("expo-linking");
jest.mock("firebase/auth");

test("sendSignInEmail calls sendSignInLinkToEmail", async () => {
  firebaseAuth.getAuth.mockReturnValue("fake auth");
  Linking.createURL.mockReturnValue("created-url/sign-in/");

  await sendSignInEmail("fake@mail.com");

  expect(Linking.createURL).toHaveBeenCalledWith("/");
  expect(firebaseAuth.sendSignInLinkToEmail).toHaveBeenCalledWith(
    "fake auth",
    "fake@mail.com",
    {
      url: `https://campus-meet-cc6a6.web.app/?appUrl=created-url%2Fsign-in%2F`,
      handleCodeInApp: true,
    }
  );
  expect(AsyncStorageMock.setItem).toHaveBeenCalledWith(
    "email",
    "fake@mail.com"
  );
});
