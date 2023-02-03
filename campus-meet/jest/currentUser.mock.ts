import { getCurrentUserId } from "../utils/auth/currentUser";
import { mockedFunctionType } from "../utils/types/mockedType";

jest.mock("../utils/auth/currentUser", () => ({
  getCurrentUserId: jest.fn(),
}));

export const mockedGetCurrentUserId = mockedFunctionType(getCurrentUserId);
