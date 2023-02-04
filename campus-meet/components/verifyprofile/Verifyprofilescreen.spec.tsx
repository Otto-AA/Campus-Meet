import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { render, act, screen, waitFor } from "@testing-library/react-native";
import * as SplashScreen from "expo-splash-screen";

import { getProfilebyUserId } from "../../api/profiles/profileAPI";
import { mockedFunctionType } from "../../utils/types/mockedType";
import { BottomTabNavigator } from "../navigation/BottomTabNavigator";
import VerifyProfileScreen from "./Verifyprofilescreen";

jest.mock("../../api/profiles/profileAPI");
jest.mock("@react-navigation/native", () => ({
  useIsFocused: jest.fn().mockReturnValue(true),
}));
jest.mock("expo-splash-screen", () => ({
  hideAsync: jest.fn(),
}));
jest.mock("../../hooks/useAuthentication", () => ({
  useAuthentication: jest.fn().mockReturnValue({
    user: { uid: "user-0" },
  }),
}));

jest.mock("@react-navigation/native-stack", () => ({
  createNativeStackNavigator: jest.fn(() => {
    return {
      Navigator: jest.fn(({ children }) => children),
      Screen: jest.fn(),
    };
  }),
}));
jest.mock("../navigation/BottomTabNavigator", () => ({
  BottomTabNavigator: jest.fn(() => <></>),
}));

const originalWarn = console.warn.bind(console);
const originalLog = console.log.bind(console);
// TODO: this test fails in the CI because the loading indicator is not null, while it passes locally
describe.skip("VerifyProfileScreen", () => {
  beforeAll(() => {
    console.log = (msg) =>
      !msg.includes("User seems not to have a profile") && originalLog(msg);
    console.warn = (msg) =>
      !msg.includes("useNativeDriver") && originalWarn(msg);
  });
  beforeEach(() => {});

  it("shows BottomTabNavigator when user has a profile", async () => {
    mockedFunctionType(getProfilebyUserId).mockResolvedValue({} as any);

    render(<VerifyProfileScreen />);

    await act(async () => {
      await waitFor(() =>
        expect(screen.queryByTestId("activity-indicator")).toBeNull()
      );
    });

    expect(getProfilebyUserId).toHaveBeenCalledWith("user-0");
    await waitFor(() => expect(SplashScreen.hideAsync).toHaveBeenCalled());
    expect(BottomTabNavigator).toHaveBeenCalled();
  });

  it("shows CreateProfile screen when user has no profile", async () => {
    mockedFunctionType(getProfilebyUserId).mockRejectedValue(
      new Error(`Could not find profile`)
    );

    render(<VerifyProfileScreen />);

    await act(async () => {
      await waitFor(() =>
        expect(screen.queryByTestId("activity-indicator")).toBeNull()
      );
    });

    expect(getProfilebyUserId).toHaveBeenCalledWith("user-0");
    expect(SplashScreen.hideAsync).toHaveBeenCalled();
    const results = mockedFunctionType(createNativeStackNavigator).mock.results;
    const lastResult = results[results.length - 1];
    const Stack = lastResult.value;
    expect(Stack.Navigator).toHaveBeenCalled();
    expect(Stack.Screen).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "CreateProfile",
      }),
      expect.anything()
    );
  });

  it("activity indicator should be shown and then disappear", async () => {
    const { getByTestId } = render(<VerifyProfileScreen />);

    expect(getByTestId("activity-indicator")).toBeTruthy();

    await act(async () => {
      await waitFor(() =>
        expect(screen.queryByTestId("activity-indicator")).toBeNull()
      );
    });
  });

  afterAll(() => {
    console.log = originalLog;
    console.warn = originalWarn;
  });
});
