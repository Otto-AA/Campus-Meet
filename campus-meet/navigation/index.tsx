/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as SplashScreen from "expo-splash-screen";
import * as React from "react";
import { useEffect } from "react";
import { ColorSchemeName } from "react-native";
import { useTheme } from "react-native-paper";

import { BottomTabNavigator } from "../components/navigation/BottomTabNavigator";
import NotificationReceiver from "../components/notifications/NotificationReceiver";
import VerifyProfileScreen from "../components/verifyprofile/Verifyprofilescreen";
import ChatsDbProvider from "../contexts/ChatsDbContext";
import ChatsDbSyncedProvider from "../contexts/ChatsDbSyncedContext";
import ChatsSyncingContextProvider from "../contexts/ChatsSyncingContext";
import NotificationReceiverProvider from "../contexts/NotificationReceiverContext";
import { useAuthentication } from "../hooks/useAuthentication";
import NotFoundScreen from "../screens/NotFoundScreen";
import SignInScreen from "../screens/SignInScreen";
import ChatScreen from "../screens/chats/ChatScreen";
import PrivateChatScreen from "../screens/chats/PrivateChatScreen";
import CreateMeetingScreen from "../screens/meetings/CreateMeetingScreen";
import MeetingDetailsScreen from "../screens/meetings/MeetingDetailsScreen";
import EditProfileScreen from "../screens/profile/EditProfileScreen";
import ProfiledetailsScreen from "../screens/profile/ProfiledetailsScreen";
import { RootStackParamList } from "../types";
import LinkingConfiguration from "./LinkingConfiguration";

export default function Navigation({
  colorScheme,
}: {
  colorScheme: ColorSchemeName;
}) {
  const { user, initialized } = useAuthentication();

  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
    >
      <NotificationReceiverProvider>
        {!initialized ? null : !user ? <SignInNavigator /> : <RootNavigator />}
      </NotificationReceiverProvider>
    </NavigationContainer>
  );
}

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>();

function SignInNavigator() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);
  const theme = useTheme();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SignIn"
        component={SignInScreen}
        options={{
          title: "Sign In",
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTitleStyle: { color: "white" },
        }}
      />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const theme = useTheme();

  return (
    <NotificationReceiver>
      <ChatsDbProvider>
        <ChatsDbSyncedProvider>
          <ChatsSyncingContextProvider>
            <Stack.Navigator
              screenOptions={{
                headerStyle: {
                  backgroundColor: theme.colors.primary,
                },
                headerTitleStyle: { color: "white" },
              }}
            >
              <Stack.Screen
                name="Root"
                component={VerifyProfileScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Home"
                component={BottomTabNavigator}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="NotFound"
                component={NotFoundScreen}
                options={{ title: "Oops!" }}
              />
              <Stack.Screen
                name="CreateMeeting"
                component={CreateMeetingScreen}
                options={{
                  title: "Create a meeting",
                }}
              />
              <Stack.Screen
                name="MeetingDetails"
                component={MeetingDetailsScreen}
                options={{
                  title: "Meeting details",
                }}
              />
              <Stack.Screen
                name="ProfileDetails"
                component={ProfiledetailsScreen}
                options={{
                  title: "Profile details",
                }}
              />
              <Stack.Screen
                name="CreateProfile"
                component={EditProfileScreen}
                options={{
                  title: "Edit Profile",
                }}
              />
              <Stack.Screen
                name="Chat"
                component={ChatScreen}
                options={{ title: "Chat" }}
              />
              <Stack.Screen
                name="PrivateChat"
                component={PrivateChatScreen}
                options={{ title: "Chat" }}
              />
            </Stack.Navigator>
          </ChatsSyncingContextProvider>
        </ChatsDbSyncedProvider>
      </ChatsDbProvider>
    </NotificationReceiver>
  );
}
