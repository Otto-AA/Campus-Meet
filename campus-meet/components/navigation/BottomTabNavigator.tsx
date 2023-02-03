import { FontAwesome } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { View, StatusBar } from "react-native";
import { useTheme } from "react-native-paper";

import ChatPreviewsScreen from "../../screens/chats/ChatPreviewsScreen";
import DiscoverMeetingsScreen from "../../screens/meetings/DiscoverMeetingsScreen";
import OwnProfileScreen from "../../screens/profile/OwnProfileScreen";
import { RootTabParamList, RootTabScreenProps } from "../../types";

/**
 * A bottom tab navigator displays tab buttons on the bottom of the display to switch screens.
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */

const BottomTab = createBottomTabNavigator<RootTabParamList>();

export const BottomTabNavigator = () => {
  const theme = useTheme();

  return (
    <View
      testID="bottom-tab"
      style={{ flex: 1, backgroundColor: theme.colors.primary }}
    >
      <StatusBar
        testID="bottom-tab"
        backgroundColor={theme.colors.statusbar}
        barStyle="light-content"
      />
      <BottomTab.Navigator
        testID="bottom-tab"
        initialRouteName="DiscoverMeetings"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTitleStyle: { color: "white" },
          tabBarActiveBackgroundColor: theme.colors.primary,
          tabBarActiveTintColor: theme.colors.accent,
          tabBarInactiveBackgroundColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.background,
          tabBarShowLabel: false,
        }}
      >
        <BottomTab.Screen
          name="DiscoverMeetings"
          component={DiscoverMeetingsScreen}
          options={({
            navigation,
          }: RootTabScreenProps<"DiscoverMeetings">) => ({
            title: "Meetings",
            tabBarTestID: "tab-meetings",

            tabBarIcon: ({ color }) => (
              <TabBarIcon name="users" color={color} />
            ),
          })}
        />
        <BottomTab.Screen
          name="ChatPreviews"
          component={ChatPreviewsScreen}
          options={() => ({
            title: "Chats",
            tabBarTestID: "tab-chats",
            tabBarIcon: ({ color }) => (
              <TabBarIcon testID="tab-bar-icon" name="comments" color={color} />
            ),
          })}
        />
        <BottomTab.Screen
          name="OwnProfile"
          component={OwnProfileScreen}
          options={{
            title: "Profile",
            tabBarTestID: "tab-settings",
            tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
          }}
        />
      </BottomTab.Navigator>
    </View>
  );
};

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
export function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return (
    <FontAwesome
      testID="tab-bar-icon"
      size={30}
      style={{ marginBottom: -3 }}
      {...props}
    />
  );
}
