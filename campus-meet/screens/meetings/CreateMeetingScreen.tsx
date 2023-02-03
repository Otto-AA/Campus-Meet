import {
  FontAwesome,
  MaterialIcons,
  Entypo,
  Foundation,
} from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import Slider from "@react-native-community/slider";
import { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import DatePicker from "react-native-date-picker";
import {
  Text,
  Button,
  Portal,
  Modal,
  TextInput,
  useTheme,
} from "react-native-paper";

import {
  fetchMeeting,
  IMeeting,
  updateMeeting,
  createMeeting,
} from "../../api/meetings/meetingsApi";
import LocationSelector from "../../components/location/LocationSelector";
import { MeetingNotFoundExcxeption } from "../../exceptions/exceptions";
import {
  Coordinates,
  useCurrentLocation,
} from "../../hooks/useCurrentLocation";
import { RootStackScreenProps } from "../../types";
import { isExpoGo } from "../../utils/environment/isExpoGo";
import { getAddressFromCoordinates } from "../../utils/location/getAddressFromCoordinates";

export default function CreateMeetingScreen({
  navigation,
  route: {
    params: { id: meetingId },
  },
}: RootStackScreenProps<"CreateMeeting">) {
  const [location, setLocation] = useCurrentLocation();
  const [locationAddress, setLocationAddress] = useState("");
  const [title, setTitle] = useState({ value: "", error: false });
  const [notes, setNotes] = useState({ value: "", error: false });
  const [date, setDate] = useState(new Date());
  const [datePickerMode, setDatePickerMode] = useState<"date" | "time">("date");
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [meeting, setMeeting] = useState<IMeeting>();
  const [showMap, setShowMap] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState(60);

  const theme = useTheme();
  const styles = getStyles(theme);

  useEffect(() => {
    if (meetingId) {
      loadMeeting(meetingId);
    }
  }, [meetingId]);

  useEffect(() => {
    if (meetingId) {
      navigation.setOptions({
        title: "Edit Meeting",
      });
    } else {
      navigation.setOptions({
        title: "Create Meeting",
      });
    }
  }, [meetingId, navigation]);

  useEffect(() => {
    if (location) {
      getAddressFromCoordinates(location).then(setLocationAddress);
    }
  }, [location]);

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

  useEffect(() => {
    if (meeting) {
      setLocation(meeting.location);
      setLocationAddress(meeting.address);
      onTitleChange(meeting.title);
      onNotesChange(meeting.notes || "");
      setDate(meeting.date);
    }
  }, [meeting, setLocation]);

  const Update = async () => {
    if (!title.value) {
      return setTitle({
        value: title.value,
        error: true,
      });
    }
    if (!location || !locationAddress) {
      return alert("Cannot update a meeting without a location");
    }

    await updateMeeting(meetingId!, {
      date,
      location,
      durationMinutes,
      address: locationAddress,
      title: title.value,
      notes: notes.value,
    });

    navigation.navigate("Root", {
      screen: "DiscoverMeetings",
    });
  };

  const onTitleChange = (title: string) => {
    setTitle({
      value: title,
      error: false,
    });
  };

  const onNotesChange = (notes: string) => {
    setNotes({
      value: notes,
      error: false,
    });
  };

  const submitMeeting = async () => {
    if (!title.value) {
      return setTitle({
        value: "",
        error: true,
      });
    }
    if (!location) {
      return alert("Cannot create a meeting without a location");
    }

    const doc = await createMeeting({
      date,
      location,
      title: title.value,
      notes: notes.value,
      address: locationAddress,
      durationMinutes,
    });
    console.log(`Created meeting with id ${doc.id}`);

    navigation.navigate("Root", {
      screen: "DiscoverMeetings",
    });
  };

  const onDateTimePickerChange = (
    _: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    setShowDateTimePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      if (datePickerMode === "date") setTimeout(() => showMode("time"), 0);
    }
  };

  const openDateTimePicker = () => {
    if (isExpoGo()) {
      showMode("date");
    } else {
      setShowDateTimePicker(true);
    }
  };

  const showMode = (currentMode: "date" | "time") => {
    setDatePickerMode(currentMode);
    setShowDateTimePicker(true);
  };

  const developmentDateTimePicker = (
    <View style={{ marginTop: 15, width: "100%" }}>
      {showDateTimePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode={datePickerMode}
          onChange={onDateTimePickerChange}
          is24Hour
        />
      )}
    </View>
  );
  const productionDateTimePicker = (
    <View>
      <DatePicker
        modal
        open={showDateTimePicker}
        date={date}
        textColor="black"
        onConfirm={(date) => {
          setShowDateTimePicker(false);
          setDate(date);
        }}
        onCancel={() => {
          setShowDateTimePicker(false);
        }}
        testID="datePicker"
      />
    </View>
  );

  const onLocationChange = (coordinates: Coordinates) => {
    setLocation(coordinates);
  };

  const dateString = date.toLocaleDateString();
  const timeString = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateTimeString = dateString + ", " + timeString;

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.inputRow}>
          <MaterialIcons name="drive-file-rename-outline" style={styles.icon} />
          <TextInput
            style={styles.input}
            label="Title"
            value={title.value}
            error={title.error}
            onChangeText={onTitleChange}
            testID="input-title"
          />
        </View>
        <View style={styles.inputRow5}>
          <FontAwesome name="calendar" style={styles.icon} />
          <Button
            labelStyle={{
              fontWeight: "700",
              width: "70%",
            }}
            mode="contained"
            testID="show-date-picker"
            onPress={openDateTimePicker}
          >
            {dateTimeString}
          </Button>
        </View>
        {isExpoGo() ? developmentDateTimePicker : productionDateTimePicker}
        <View style={styles.inputRow}>
          <Entypo name="time-slot" style={styles.icon} />
          <Slider
            style={{ width: "80%", height: 50, marginLeft: -15 }}
            value={durationMinutes}
            onValueChange={setDurationMinutes}
            minimumValue={30}
            maximumValue={240}
            step={15}
            thumbTintColor={theme.colors.accent}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.accent}
          />
        </View>
        <Text
          style={{
            alignSelf: "center",
          }}
        >
          {durationMinutes} minutes
        </Text>

        <View style={styles.inputRow1}>
          <Entypo name="location" style={styles.icon} />
          <Button
            labelStyle={{
              fontWeight: "700",
              fontSize: 10,
              paddingLeft: 0,
              width: "79%",
              textAlign: "center",
            }}
            mode="contained"
            testID="show-map"
            onPress={() => setShowMap(true)}
          >
            {locationAddress && (
              <Text
                testID="address"
                style={{
                  fontWeight: "700",
                  lineHeight: 20,
                  textAlign: "center",
                }}
              >
                {locationAddress}
              </Text>
            )}
          </Button>
          {showMap && location && (
            <Portal>
              <Modal
                visible={showMap}
                onDismiss={() => setShowMap(false)}
                contentContainerStyle={styles.modal}
              >
                <View style={styles.map}>
                  <LocationSelector
                    initialLocation={location}
                    onLocationChange={onLocationChange}
                  />
                </View>
                <Button mode="contained" onPress={() => setShowMap(false)}>
                  Choose
                </Button>
              </Modal>
            </Portal>
          )}
        </View>

        <View style={styles.inputRow4}>
          <Foundation name="clipboard-notes" style={styles.icon2} />

          <TextInput
            style={styles.input2}
            label="Notes"
            multiline
            numberOfLines={3}
            value={notes.value}
            error={notes.error}
            onChangeText={onNotesChange}
            testID="notes"
          />
        </View>
        <View style={styles.inputRow3}>
          {!meeting ? (
            <Button
              labelStyle={{
                fontWeight: "700",
                fontSize: 20,
              }}
              contentStyle={{
                width: "100%",
                height: 50,
                borderWidth: 2,

                borderColor: theme.colors.accent,
                borderBottomLeftRadius: 50,
              }}
              testID="create"
              onPress={submitMeeting}
            >
              Create
            </Button>
          ) : (
            <Button
              labelStyle={{
                fontWeight: "700",
                fontSize: 20,
              }}
              contentStyle={{
                width: "91%",
                height: 50,
                borderWidth: 2,

                borderColor: theme.colors.accent,
                borderBottomLeftRadius: 50,
              }}
              testID="save"
              onPress={Update}
            >
              Save changes
            </Button>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const getStyles = (theme: ReactNativePaper.Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
    },
    icon: {
      fontSize: 40,
      width: 50,
      marginRight: 30,
      marginLeft: 10,
      color: theme.colors.accent,
    },
    icon2: {
      fontSize: 40,
      width: 50,
      marginRight: 20,
      marginLeft: 18,
      color: theme.colors.accent,
    },
    inputRow: {
      height: 40,
      width: "92%",
      flexDirection: "row",
      marginTop: 25,
      numberOfLines: 2,
    },
    inputRow1: {
      height: 40,
      width: "70%",
      flexDirection: "row",
      marginTop: 25,
      numberOfLines: 2,
    },
    inputRow2: {
      borderWidth: 3,
      borderColor: theme.colors.primary,
      borderRadius: 50,
      backgroundColor: theme.colors.accent,
      fontWeight: "900",
      color: theme.colors.primary,
      marginLeft: 10,
      height: 50,
      width: "80%",
      flexDirection: "row",
      marginTop: 20,
      numberOfLines: 2,
    },
    inputRow3: {
      height: 50,
      width: "94%",
      flexDirection: "row",
      marginTop: 35,
      marginLeft: 90,
    },
    inputRow4: {
      height: 40,
      width: "92%",
      flexDirection: "row",
      marginTop: 50,
      numberOfLines: 2,
    },
    inputRow5: {
      height: 40,
      width: "80%",
      flexDirection: "row",
      marginTop: 25,
      numberOfLines: 2,
    },
    modal: {
      padding: 10,
    },
    map: {
      aspectRatio: 1,
      width: "100%",
    },
    input: {
      height: 50,
      width: "70%",
      alignSelf: "center",
      fontSize: 20,
      borderLeftWidth: 2,
      borderTopWidth: 2,
      borderRightWidth: 2,
      borderRadius: 0,
      marginTop: 5,
      borderTopEndRadius: 20,
      borderColor: theme.colors.accent,
      underlineColor: "transparent",
    },

    input2: {
      height: 70,
      width: "70%",
      alignSelf: "center",
      fontSize: 20,
      borderLeftWidth: 2,
      borderTopWidth: 2,
      borderRightWidth: 2,
      borderRadius: 0,
      marginTop: 5,
      borderTopEndRadius: 20,
      borderColor: theme.colors.accent,
      underlineColor: "transparent",
    },
  });
};
