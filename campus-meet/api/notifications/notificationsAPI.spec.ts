import { collection, doc } from "firebase/firestore";


jest.mock("firebase/firestore", () => ({
  collection: jest.fn().mockReturnValue({}),
  doc: jest.fn().mockReturnValue({}),
  setDoc: jest.fn().mockReturnValue(Promise.resolve({})),
}));

jest.mock("../../utils/auth/currentUser", () => ({
  getCurrentUserId: jest.fn().mockReturnValue("userId"),
}));

jest.mock("../../utils/database/firestore", () => ({
  getDb: jest.fn().mockReturnValue({}),
}));



const { setDoc } = require("firebase/firestore");

const { getCurrentUserId } = require("../../utils/auth/currentUser");
const { getDb } = require("../../utils/database/firestore");
const { savePushTokenToServer } = require("./notificationsApi");

describe("savePushTokenToServer", () => {
  it("calls setDoc with the correct parameters", async () => {
    const token = "testToken";

    await savePushTokenToServer(token);

    expect(getCurrentUserId).toHaveBeenCalled();
    expect(getDb).toHaveBeenCalled();
    expect(collection).toHaveBeenCalledWith(getDb(), "pushtokens");
    expect(doc).toHaveBeenCalledWith({}, "userId");
    expect(setDoc).toHaveBeenCalledWith({}, { token });
  });

  
});