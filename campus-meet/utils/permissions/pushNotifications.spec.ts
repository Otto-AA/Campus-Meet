import * as Notifications from "expo-notifications";

import {
  registerForPushNotificationsAsync,
  requestNotificationPermissions,
} from "./pushNotification";

jest.mock("expo-device", () => ({
  isDevice: true,
}));

jest.mock("expo-notifications", () => ({
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: "push-token" }),
  setNotificationChannelAsync: jest.fn(),
}));

jest.mock("react-native", () => ({
  Platform: {
    OS: "ios",
  },
}));

jest.mock("../../api/notifications/notificationsApi", () => ({
  savePushTokenToServer: jest.fn().mockResolvedValue(),
}));

describe("registerForPushNotificationsAsync", () => {
  it("registers for push notifications", async () => {
    const result = await registerForPushNotificationsAsync();
    expect(result).toEqual(true);
    expect(Notifications.getPermissionsAsync).toHaveBeenCalled();
    expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalled();
    expect(Notifications.setNotificationChannelAsync).not.toHaveBeenCalled();
  });
});

describe("requestNotificationPermissions", () => {
  it("requests notification permissions", async () => {
    const result = await requestNotificationPermissions();
    expect(result).toEqual("granted");
    expect(Notifications.getPermissionsAsync).toHaveBeenCalled();
  });
});
