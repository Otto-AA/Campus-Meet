import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useFocusEffect } from "@react-navigation/native";
import haversine from "haversine";
import { DateTime, Duration } from "luxon";
import { useCallback, useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  TouchableWithoutFeedback,
} from "react-native";
import MapView, { Marker, MapCircle } from "react-native-maps";
import {
  useTheme,
  FAB,
  Card,
  Avatar,
  Text,
  Modal,
  Portal,
} from "react-native-paper";

import { fetchCurrentMeetings, IMeeting } from "../../api/meetings/meetingsApi";
import {
  getProfilesMetadataByUserIds,
  IProfileMetadata,
} from "../../api/profiles/profileAPI";
import PaddedView from "../../components/styled/PaddedView";
import ListWithDateDivider from "../../components/time/ListWithDateDivider";
import RelativeDate from "../../components/time/RelativeDate";
import { useAuthentication } from "../../hooks/useAuthentication";
import { useCurrentLocation } from "../../hooks/useCurrentLocation";
import { RootTabScreenProps } from "../../types";
import { getAddressFromCoordinates } from "../../utils/location/getAddressFromCoordinates";

const MAX_RADIUS_KM = 10;
const MIN_RADIUS_KM = 1;

export default function DiscoverMeetingsScreen({
  navigation,
}: RootTabScreenProps<"DiscoverMeetings">) {
  const [meetings, setMeetings] = useState<IMeeting[]>([]);
  const [profilesMetadata, setProfilesMetadata] = useState<
    Record<string, IProfileMetadata>
  >({});
  const [refreshing, setRefreshing] = useState(false);
  const [location] = useCurrentLocation();
  const [address, setAddress] = useState("Loading address...");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [radiusKm, setRadiusKm] = useState(MAX_RADIUS_KM);
  const { user } = useAuthentication();

  const theme = useTheme();
  const styles = getStyles(theme);

  useFocusEffect(
    useCallback(() => {
      getData();
    }, [])
  );

  useEffect(() => {
    if (location) getAddressFromCoordinates(location).then(setAddress);
  }, [location]);

  useEffect(() => {
    const allUserIds = meetings.flatMap((meeting) => meeting.members);
    getProfilesMetadataByUserIds(allUserIds).then((metadatas) => {
      const newMetadata: Record<string, IProfileMetadata> = {};
      for (const [userId, metadata] of Object.entries(metadatas)) {
        newMetadata[userId] = metadata;
      }
      setProfilesMetadata(newMetadata);
    });
  }, [meetings]);

  const getData = async () => {
    fetchCurrentMeetings().then(setMeetings);
  };

  const upcomingMeetingsCount = user
    ? meetings.filter((meeting) => meeting.members.includes(user?.uid)).length
    : 0;
  const filteredMeetings = location
    ? meetings.filter((meeting) => {
        const distance = haversine(location, meeting.location, { unit: "km" });
        return distance <= radiusKm;
      })
    : [];
  const markers = meetings.map((meeting) => meeting.location);

  const onRefresh = async () => {
    setRefreshing(true);
    await getData();
    setRefreshing(false);
  };

  const viewMeetingDetails = (id: string) =>
    navigation.navigate("MeetingDetails", { id });

  const createmeeting = (id: string) =>
    navigation.navigate("CreateMeeting", {});

  const renderMeeting = (filteredMeeting: IMeeting, i: number) => {
    let distance = 0;
    if (location) {
      distance = haversine(location, filteredMeeting.location, {
        unit: "km",
      });
    }

    const start = DateTime.fromJSDate(filteredMeeting.date);
    const end = DateTime.fromJSDate(filteredMeeting.end);
    const hasStarted = start.diffNow().as("minutes") <= 0;

    const getLargestTimeFormat = (duration: Duration) => {
      for (const format of ["days", "hours", "minutes"] as const) {
        if (duration.as(format) > 1) {
          return `${Math.round(duration.as(format))} ${format}`;
        }
      }
      return "0 minutes";
    };

    const remainingText = hasStarted
      ? `Ending in ${getLargestTimeFormat(end.diffNow())}`
      : `Starting in ${getLargestTimeFormat(start.diffNow())}`;

    const isMember = user && filteredMeeting.members.includes(user.uid);

    return (
      <Card
        onPress={() => viewMeetingDetails(filteredMeeting.id)}
        key={filteredMeeting.id}
        testID={`meeting-${i}`}
        style={[
          { paddingLeft: 25 },
          {
            borderColor: isMember ? theme.colors.accent : theme.colors.primary,
          },
          { borderWidth: 3 },
          styles.otherStyles,
        ]}
      >
        <Card.Title
          title={
            <Text style={styles.cardtitle}>
              {filteredMeeting.title.charAt(0).toUpperCase() +
                filteredMeeting.title.slice(1)}
            </Text>
          }
          titleStyle={{ marginBottom: 5, marginTop: 10 }}
        />

        <Card.Content>
          <View style={styles.cardContentContainer}>
            <View style={styles.cardRowContainer}>
              <Ionicons
                name="md-people"
                size={30}
                color="black"
                style={styles.icon}
              />
              {filteredMeeting.members.slice(0, 5).map((memberId) => {
                return (
                  <View>
                    {profilesMetadata[memberId] && (
                      <Avatar.Image
                        size={20}
                        source={{ uri: profilesMetadata[memberId].imageUrl }}
                        key={memberId}
                      />
                    )}
                  </View>
                );
              })}
              {filteredMeeting.members.length > 5 && <Text>+</Text>}
            </View>
            <View style={styles.cardRowContainer}>
              <FontAwesome
                name="location-arrow"
                size={30}
                color="black"
                style={styles.icon}
              />
              <Text style={styles.cardRow}>{distance.toFixed(1)} Km away</Text>
            </View>
            <View style={styles.cardRowContainer}>
              <Ionicons
                name="md-time"
                size={30}
                color="black"
                style={styles.icon}
              />
              <Text style={styles.cardRow}>{remainingText}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderDateDivider = (date: Date, i: number) => {
    return (
      <View
        style={styles.dateDivider}
        key={`divider-${date.valueOf()}`}
        testID={`date-divider-${i}`}
      >
        <RelativeDate
          datetime={DateTime.fromJSDate(date)}
          style={styles.dateDividerTime}
        />
      </View>
    );
  };

  return (
    <PaddedView testID="screen-discover-meetings">
      <View style={{ flex: 1 }}>
        <View style={{ height: 30, flexDirection: "row", marginBottom: 10 }}>
          <TouchableWithoutFeedback onPress={() => setIsModalVisible(true)}>
            <Ionicons name="md-location" style={styles.icon3} />
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={() => setIsModalVisible(true)}>
            <View style={{ flexDirection: "column" }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "bold",
                  borderRadius: 40,

                  color: theme.colors.accent,
                }}
              >
                {address}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "bold",
                  borderRadius: 40,
                  color: theme.colors.accent,
                }}
              >
                {radiusKm}km radius
              </Text>
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={() => setIsModalVisible(true)}>
            <MaterialIcons name="keyboard-arrow-down" style={styles.icon3} />
          </TouchableWithoutFeedback>
        </View>
        <View style={{ height: 30, flexDirection: "row" }}>
          {upcomingMeetingsCount !== 0 && (
            <>
              <FontAwesome name="bell" style={styles.icon2} />
              <Text
                style={{
                  marginTop: 5,
                  fontSize: 15,
                  fontWeight: "bold",
                  width: 250,
                  borderRadius: 40,
                  marginBottom: 5,
                  paddingRight: 5,
                }}
              >
                You have{" "}
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "bold",
                    paddingLeft: 5,
                    color: "red",
                  }}
                >
                  {upcomingMeetingsCount}
                </Text>{" "}
                upcoming meeting{upcomingMeetingsCount > 1 ? "s" : ""}
              </Text>
            </>
          )}
        </View>

        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {meetings && !meetings.length && (
            <Text>Be the first one to create a meeting!</Text>
          )}
          <ListWithDateDivider
            elements={filteredMeetings}
            renderElement={renderMeeting}
            renderDivider={renderDateDivider}
          />
        </ScrollView>

        <Portal>
          <Modal
            visible={isModalVisible}
            onDismiss={() => setIsModalVisible(false)}
          >
            <View style={{ marginTop: "-10%" }}>
              <MapView
                showsUserLocation
                style={styles.map}
                region={{
                  // @ts-ignore
                  latitude: location?.latitude,
                  // @ts-ignore
                  longitude: location?.longitude,
                  latitudeDelta: 1,
                  longitudeDelta: 0.121,
                }}
              >
                <MapCircle
                  radius={radiusKm * 1000}
                  center={{
                    latitude: location?.latitude || 37.400085,
                    longitude: location?.longitude || -122.0777717,
                  }}
                  strokeColor="black"
                  fillColor="rgba(0, 0, 0, 0.2)"
                  zIndex={0}
                />
                {markers.map((coordinate, index) => (
                  <Marker key={index} coordinate={coordinate} />
                ))}
              </MapView>
              <View
                style={{
                  width: 315,
                  height: 40,
                  marginTop: 5,
                  alignSelf: "center",
                  backgroundColor: theme.colors.accent,
                  borderRadius: 40,
                }}
              >
                <Slider
                  value={radiusKm}
                  onValueChange={setRadiusKm}
                  // onSlidingComplete={updateMeetings}
                  minimumValue={MIN_RADIUS_KM}
                  maximumValue={MAX_RADIUS_KM}
                  step={1}
                  thumbTintColor={theme.colors.primary}
                  minimumTrackTintColor={theme.colors.primary}
                  style={{ width: "100%", height: 40, marginTop: 0 }}
                />
              </View>
            </View>
          </Modal>
        </Portal>

        <FAB
          style={styles.fab}
          label="New meeting"
          icon="plus"
          onPress={() => createmeeting("not")}
          testID="new-meeting-button"
        />
      </View>
    </PaddedView>
  );
}

const getStyles = (theme: ReactNativePaper.Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    dateDivider: {
      flexDirection: "column",
      alignItems: "center",
      fontWeight: "bold",
      backgroundColor: theme.colors.disabled,
      alignSelf: "center",
      marginTop: 16,
      marginBottom: 5,
      width: 200,
      padding: 5,
      borderRadius: 200,
    },
    dateDividerTime: {
      fontWeight: "bold",
      fontSize: 18,
    },
    cardContentContainer: {
      width: "80%",
    },
    otherStyles: {
      borderRadius: 50,
      height: 150,
      marginTop: 10,
    },
    icon: {
      fontSize: 24,
      width: 30,
      alignContent: "center",
      color: theme.colors.primary,
    },
    cardtitle: {
      color: theme.colors.text,
      fontSize: 22,
      fontWeight: "bold",
    },
    icon2: {
      fontSize: 24,
      width: 30,
      alignContent: "center",
      marginTop: 3,

      color: theme.colors.bell,
    },
    icon3: {
      fontSize: 24,
      width: 30,
      alignContent: "center",

      color: theme.colors.accent,
    },
    cardRow: {
      height: 30,
      width: "100%",
      fontSize: 15,
      color: theme.colors.text,
      flexDirection: "row",
    },
    cardRowContainer: {
      height: 30,
      flexDirection: "row",
    },

    map: {
      aspectRatio: 1,
      width: "80%",
      alignSelf: "center",
    },
    fab: {
      position: "absolute",
      right: 10,
      bottom: 20,
      mode: "elevated",
    },
  });
};
