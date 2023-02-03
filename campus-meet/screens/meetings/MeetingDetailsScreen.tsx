import { FontAwesome, Foundation, Ionicons } from "@expo/vector-icons";
import { DateTime } from "luxon";
import { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, Share, ScrollView } from "react-native";
import {
  ActivityIndicator,
  Button,
  List,
  Avatar,
  Subheading,
  useTheme,
  Text,
  IconButton,
} from "react-native-paper";

import { getChatIdOfMeeting } from "../../api/chats/chatApi";
import {
  deleteMeeting,
  fetchMeeting,
  IMeeting,
  joinMeeting,
  leaveMeeting,
} from "../../api/meetings/meetingsApi";
import { getProfilesByUserIds, IProfile } from "../../api/profiles/profileAPI";
import ConfirmDialog from "../../components/dialogs/ConfirmDialog";
import RelativeDateAndTime from "../../components/time/RelativeDateAndTime";
import { MeetingNotFoundExcxeption } from "../../exceptions/exceptions";
import { useChatsSync } from "../../hooks/chats/useChatsSync";
import { useAuthentication } from "../../hooks/useAuthentication";
import { RootStackScreenProps } from "../../types";
import { openCoordinatesInMap } from "../../utils/location/openCoordinatesApp";

export default function MeetingDetailsScreen({
  navigation,
  route: {
    params: { id: meetingId },
  },
}: RootStackScreenProps<"MeetingDetails">) {
  const { syncChats } = useChatsSync();
  const [meeting, setMeeting] = useState<IMeeting>();
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [members, setMembers] = useState<IProfile[]>([]);
  const { user } = useAuthentication();
  const theme = useTheme();
  const styles = getStyles(theme);

  useEffect(() => {
    if (meeting) {
      getProfilesByUserIds(meeting.members).then(setMembers);
      navigation.setOptions({
        title: meeting.title,
      });
    }
  }, [meeting, navigation]);

  useEffect(() => {
    loadMeeting(meetingId);
  }, [meetingId]);

  const viewEditDetails = useCallback(
    (id: string) => navigation.navigate("CreateMeeting", { id }),
    [navigation]
  );

  useEffect(() => {
    if (meeting && meeting.creator === user?.uid) {
      navigation.setOptions({
        headerRight: () => (
          <>
            <IconButton
              icon="pencil"
              onPress={() => viewEditDetails(meeting.id)}
              color="white"
            />
            <IconButton
              icon="delete"
              onPress={showRemoveMeetingDialog}
              color="white"
            />
          </>
        ),
      });
    }
  }, [meeting, navigation, user?.uid, viewEditDetails]);

  const loadMeeting = async (meetingId: string) => {
    try {
      const meeting = await fetchMeeting(meetingId);
      setMeeting(meeting);
    } catch (err) {
      if (err instanceof MeetingNotFoundExcxeption) {
        console.error(err);
        return alert("This meeting does not exist anymore");
      }
      throw err;
    }
  };

  const join = async () => {
    await joinMeeting(meetingId);
    await syncChats();
    await loadMeeting(meetingId);
  };

  const leave = async () => {
    await leaveMeeting(meetingId);
    await loadMeeting(meetingId);
  };

  const remove = async () => {
    await deleteMeeting(meetingId);
    hideRemoveMeetingDialog();
    navigation.goBack();
  };
  const showRemoveMeetingDialog = () => setShowRemoveConfirm(true);
  const hideRemoveMeetingDialog = () => setShowRemoveConfirm(false);

  const loaded = !!(user && meeting);
  const joined = loaded && meeting.members.includes(user.uid);
  const canJoin = loaded && !meeting.members.includes(user.uid);
  const isCreator = loaded && user.uid === meeting.creator;
  const canLeave = joined && !isCreator;
  const showChat = joined && meeting.members.length > 1;

  const openChat = async () => {
    const chatId = await getChatIdOfMeeting(meetingId);
    navigation.navigate("Chat", {
      chatId,
    });
  };

  const openMeetingLocationInMap = () =>
    openCoordinatesInMap(meeting!.location);

  const renderMember = (profile: IProfile, i: number) => {
    return (
      <List.Item
        key={profile.id}
        titleStyle={{
          fontSize: 16,
          fontWeight: "bold",
        }}
        testID={`member-${i}`}
        onPress={() => navigation.navigate("ProfileDetails", { profile })}
        style={{ padding: 0 }}
        title={
          profile.name +
          (profile.creator === meeting?.creator ? " (creator)" : "")
        }
        left={() => (
          <Avatar.Image
            size={26}
            source={{ uri: profile.imageUrl }}
            style={{ alignSelf: "center" }}
          />
        )}
      />
    );
  };

  if (!loaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <View style={styles.informationContainer}>
        <View style={styles.inputRow}>
          <FontAwesome name="calendar" style={styles.icon} />
          <View style={styles.righSideContainer}>
            <Subheading style={styles.textdetails}>
              When:{" "}
              <RelativeDateAndTime
                datetime={DateTime.fromJSDate(meeting.date)}
              />
            </Subheading>
          </View>
        </View>
        <View style={styles.inputRow}>
          <FontAwesome name="location-arrow" style={styles.icon} />
          <View style={styles.righSideContainer}>
            <Subheading
              style={styles.textdetails}
              onPress={openMeetingLocationInMap}
            >
              Where:{" "}
              <Text style={{ color: theme.colors.text, fontWeight: "600" }}>
                {meeting.address}
              </Text>
            </Subheading>
          </View>
        </View>
        {meeting.notes && (
          <View style={styles.inputRow}>
            <Foundation name="clipboard-notes" style={styles.icon} />
            <View style={styles.righSideContainer}>
              <ScrollView style={styles.notesContainer}>
                <Subheading style={styles.notesDetails}>
                  What: <Text>{meeting.notes}</Text>
                </Subheading>
              </ScrollView>
            </View>
          </View>
        )}
        <View style={styles.inputRow}>
          <Ionicons name="people" style={styles.icon} />
          <View style={styles.righSideContainer}>
            <Subheading style={styles.textdetails}>Participants:</Subheading>
            <ScrollView style={styles.participantsScrollView}>
              {members
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(renderMember)}
            </ScrollView>
          </View>
        </View>
      </View>
      <View style={styles.buttonsContainer}>
        {canJoin && (
          <Button
            labelStyle={styles.buttonLabel}
            contentStyle={styles.buttonContent}
            onPress={join}
            testID="join"
          >
            Join
          </Button>
        )}
        {canLeave && (
          <Button
            labelStyle={styles.buttonLabel}
            contentStyle={styles.buttonContent}
            onPress={leave}
            testID="leave"
          >
            Leave
          </Button>
        )}
        {showChat && (
          <Button
            labelStyle={styles.buttonLabel}
            contentStyle={styles.buttonContent}
            icon="chat"
            onPress={openChat}
          >
            Chat
          </Button>
        )}

        <Button
          labelStyle={styles.buttonLabel}
          contentStyle={styles.buttonContent}
          icon="share-variant-outline"
          onPress={() => {
            const message = `Join ${meeting.title} at ${meeting.address}!
When: ${new Date(meeting.date).toLocaleString()}
Where: https://maps.google.com/maps?q=${meeting.location.latitude},${
              meeting.location.longitude
            }
Sent from Campus Meet.`;
            Share.share({
              message,
            })
              .then((result) => console.log("meeting details shared", result))
              .catch((errorMsg) =>
                console.log("error sharing meeting details", errorMsg)
              );
          }}
        >
          Share
        </Button>

        <ConfirmDialog
          title="Delete meeting"
          message="Are you sure you want to delete this meeting?"
          visible={showRemoveConfirm}
          onConfirm={remove}
          onCancel={hideRemoveMeetingDialog}
        />
      </View>
    </View>
  );
}

const getStyles = (theme: ReactNativePaper.Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 15,
    },
    informationContainer: {},
    buttonsContainer: {
      flex: 1,
      flexDirection: "column",
      justifyContent: "center",
    },
    inputRow: {
      minHeight: 60,
      width: "100%",
      flexDirection: "row",
      marginTop: 10,
      marginBottom: 20,
    },
    righSideContainer: {
      flex: 0.85,
      borderColor: theme.colors.primary,
      borderWidth: 2,
      borderRadius: 20,
      padding: 13,
    },
    icon: {
      fontSize: 40,
      width: 50,
      marginRight: 10,
      marginLeft: 10,
      marginTop: 10,
      color: theme.colors.accent,
    },
    notesContainer: {
      maxHeight: 70,
    },
    notesDetails: {
      color: theme.colors.accent,
      fontWeight: "bold",
      fontSize: 15,
    },
    textdetails: {
      color: theme.colors.accent,
      fontWeight: "bold",
      fontSize: 15,
      maxHeight: 50,
    },
    participantsScrollView: {
      width: "100%",
      maxHeight: 105,
      marginTop: 5,
      paddingLeft: 5,
    },
    buttonLabel: {
      color: theme.colors.primary,
      fontWeight: "700",
      fontSize: 20,
    },
    buttonContent: {
      marginTop: 10,
      height: 48,
      borderRadius: 30,
      alignSelf: "center",
      width: "50%",
      borderWidth: 2,
      borderColor: theme.colors.accent,
    },
  });
};
