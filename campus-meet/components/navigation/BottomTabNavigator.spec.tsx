import { render } from "@testing-library/react-native";
import React from "react";

import { BottomTabNavigator } from "./BottomTabNavigator";

jest.mock("@react-navigation/bottom-tabs", () => {
  return {
    createBottomTabNavigator: jest.fn(() => {
      return {
        Navigator: jest.fn(({ children }) => children),
        Screen: jest.fn(({ children }) => children),
      };
    }),
  };
});

jest.mock("@expo/vector-icons", () => {
  return {
    FontAwesome: jest.fn(({ children }) => children),
  };
});

jest.mock("react-native-paper", () => {
  return {
    useTheme: jest.fn(() => ({
      colors: {
        primary: "red",
        statusbar: "red",
        accent: "red",
        background: "red",
      },
    })),
  };
});

jest.mock("../../screens/chats/ChatPreviewsScreen", () => {
  return {
    ChatPreviewsScreen: jest.fn(() => <div>ChatPreviewsScreen</div>),
  };
});

jest.mock("../../screens/meetings/DiscoverMeetingsScreen", () => {
  return {
    DiscoverMeetingsScreen: jest.fn(() => <div>DiscoverMeetingsScreen</div>),
  };
});

jest.mock("../../screens/profile/OwnProfileScreen", () => {
  return {
    OwnProfileScreen: jest.fn(() => <div>OwnProfileScreen</div>),
  };
});

describe("BottomTabNavigator", () => {
  it("renders correctly", () => {
    const { getByTestId, queryByTestId } = render(<BottomTabNavigator />);

    expect(getByTestId("bottom-tab")).toBeDefined();
    expect(queryByTestId("tab-meetings")).toBeDefined();
    expect(queryByTestId("tab-chats")).toBeDefined();
    expect(queryByTestId("tab-settings")).toBeDefined();
  });
});
