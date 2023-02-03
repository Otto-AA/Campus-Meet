import { useIsFocused } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { ActivityIndicator } from "react-native-paper";

import { IProfile, getProfilebyUserId } from "../../api/profiles/profileAPI";
import { useAuthentication } from "../../hooks/useAuthentication";
import EditProfileScreen from "../../screens/profile/EditProfileScreen";
import { RootStackParamList } from "../../types";
import { BottomTabNavigator } from "../navigation/BottomTabNavigator";

export default function VerifyProfileScreen() {
  const [profile, setProfile] = useState<IProfile>();
  const [loading, setLoading] = useState(true);

  const { user } = useAuthentication();

  const isFocused = useIsFocused();

  const Stack = createNativeStackNavigator<RootStackParamList>();

  useEffect(() => {
    if (isFocused && user?.uid) {
      getProfilebyUserId(user?.uid)
        .then((profile) => {
          setProfile(profile);
        })
        .catch((err) =>
          console.log(`User seems not to have a profile (${err.message})`)
        )
        .finally(() => {
          setLoading(false);
          SplashScreen.hideAsync();
        });
    }
  }, [isFocused, user?.uid]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator testID="activity-indicator" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!profile ? (
        <Stack.Navigator>
          <Stack.Screen
            name="CreateProfile"
            component={EditProfileScreen}
            options={{ title: "Create Profile" }}
          />
        </Stack.Navigator>
      ) : (
        <BottomTabNavigator />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
