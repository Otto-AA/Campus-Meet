import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { savePushTokenToServer } from "../../api/notifications/notificationsApi";

/**
 * See https://docs.expo.dev/push-notifications/push-notifications-setup/
 * @returns true
 */
export const registerForPushNotificationsAsync = async (): Promise<boolean> => {
  if (!Device.isDevice) {
    console.log("Cannot use push notifications on emulator");
    return false;
  }

  const notificationPermissions = await requestNotificationPermissions();
  if (notificationPermissions !== "granted") {
    console.error("Failed to get push token for push notification!");
    return false;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log(token);
  await savePushTokenToServer(token);

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return true;
};

export const requestNotificationPermissions = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus;
};
