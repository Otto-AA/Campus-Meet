import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { getAuth, signOut } from "firebase/auth";
import * as React from "react";
import { StyleSheet, View, Image } from "react-native";
import { Text, FAB, useTheme } from "react-native-paper";

import { getProfile, IProfile } from "../../api/profiles/profileAPI";
import { ChatsDbContext } from "../../contexts/ChatsDbContext";
import { useAuthentication } from "../../hooks/useAuthentication";
import { CapitalizedText } from "../typography/CapitalizedText";

interface IProfileDetailsProps {
  profile: IProfile;
}

export default function ProfileDetails({
  profile: initialProfile,
}: IProfileDetailsProps) {
  const navigation = useNavigation();
  const { user } = useAuthentication();
  const { db } = React.useContext(ChatsDbContext);
  const [profile, setProfile] = React.useState(initialProfile);

  const isMe = user?.uid === profile.creator;

  const [state, setState] = React.useState({ open: false });
  const onStateChange = ({ open }: { open: boolean }) => setState({ open });
  const { open } = state;
  const theme = useTheme();
  const styles = getStyles(theme);

  useFocusEffect(
    React.useCallback(() => {
      getProfile(profile.id).then(setProfile);
    }, [profile.id])
  );

  const logout = async () => {
    await db.reset();
    signOut(getAuth());
  };

  console.log(profile);
  return (
    <View style={styles.container}>
      <View>
        <Image
          testID="profile-image"
          source={{ uri: profile.imageUrl }}
          style={styles.image}
        />
      </View>
      <View style={styles.nameContainer}>
        <CapitalizedText style={styles.name}>{profile.name}</CapitalizedText>
        <View style={styles.rect} />
      </View>
      <View style={styles.inputsContainer}>
        <View style={styles.inputRow}>
          <View style={styles.iconContainer}>
            <FontAwesome name="graduation-cap" style={styles.icon} />
          </View>
          <Text style={styles.input}>{profile.studies}</Text>
        </View>
        <View style={styles.inputRow}>
          <View style={styles.iconContainer}>
            <FontAwesome name="language" style={styles.icon} />
          </View>
          <Text style={styles.input}>{profile.languages}</Text>
        </View>
        <View style={styles.inputRow}>
          <View style={styles.iconContainer}>
            <FontAwesome name="hand-peace-o" style={styles.icon} />
          </View>
          <Text style={styles.input}>{profile.about}</Text>
        </View>
      </View>
      {!isMe && (
        <FAB
          testID="open-private-chat"
          label="Send Message"
          icon="chat"
          style={styles.sendMessageFab}
          onPress={() => navigation.navigate("PrivateChat", { profile })}
        />
      )}
      {isMe && (
        <FAB.Group
          open={open}
          theme={{ colors: { backdrop: "transparent" } }}
          visible
          icon={open ? "cog" : "cog"}
          actions={[
            {
              icon: "door",
              label: "Logout",
              onPress: () => logout(),
              color: theme.colors.primary,
              labelStyle: { backgroundColor: theme.colors.primary },
              style: { backgroundColor: theme.colors.accent },
              labelTextColor: "black",
            },
            {
              icon: "account-circle-outline",
              label: "Edit",
              onPress: () => navigation.navigate("CreateProfile"),
              color: theme.colors.primary,
              labelStyle: { backgroundColor: theme.colors.primary },
              style: { backgroundColor: theme.colors.accent },
              labelTextColor: "black",
            },
          ]}
          onStateChange={onStateChange}
          onPress={() => {
            if (open) {
              // do something if the speed dial is open
            }
          }}
        />
      )}
    </View>
  );
}

const getStyles = (theme: ReactNativePaper.Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
    },

    image: {
      width: "70%",
      alignSelf: "center",
      aspectRatio: 1 / 1,
      borderRadius: 58,
      borderWidth: 5,
      borderColor: theme.colors.accent,
      position: "relative",
      marginBottom: 20,
    },
    name: {
      fontSize: 20,
      textAlign: "center",
      alignSelf: "center",
      fontWeight: "bold",
      color: theme.colors.primary,
    },
    inputRow: {
      flexDirection: "row",
      marginTop: 28,
    },
    iconContainer: {
      width: 50,
      marginRight: 5,
    },
    icon: {
      alignSelf: "center",
      fontSize: 40,
      color: theme.colors.accent,
    },
    input: {
      flex: 1,
      color: theme.colors.text,
      fontSize: 20,
      fontWeight: "400",
      alignSelf: "center",
    },

    rect: {
      width: "60%",
      height: 4,
      backgroundColor: theme.colors.accent,
      alignSelf: "center",
    },

    inputsContainer: {
      paddingHorizontal: 10,
    },
    nameContainer: {
      textAlign: "center",
      width: "100%",
    },
    sendMessageFab: {
      marginTop: 15,
      alignSelf: "center",
    },
  });
};
