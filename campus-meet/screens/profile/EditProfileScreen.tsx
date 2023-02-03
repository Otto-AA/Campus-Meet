import { useIsFocused } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useState, useEffect, useRef } from "react";
import * as React from "react";
import {
  StyleSheet,
  View,
  Image,
  ScrollView,
  TextInput as RNTextInput,
} from "react-native";
import { TextInput, Button, FAB, useTheme } from "react-native-paper";
import FontAwesome from "react-native-vector-icons/FontAwesome";

import {
  createProfile,
  getProfile,
  getProfilebyUserId,
  updateProfile,
  uploadImage,
} from "../../api/profiles/profileAPI";
import { useAuthentication } from "../../hooks/useAuthentication";
import { RootStackScreenProps } from "../../types";

export const defaultImageUrl =
  "https://www.pngitem.com/pimgs/m/20-203432_profile-icon-png-image-free-download-searchpng-ville.png";

export default function EditProfileScreen({
  navigation,
}: RootStackScreenProps<"CreateProfile">) {
  const [name, setName] = useState({ value: "", error: false });
  const [studies, setStudies] = useState({ value: "", error: false });
  const [languages, setLanguages] = useState({ value: "", error: false });
  const [about, setAbout] = useState({ value: "", error: false });
  const [pickedImagePath, setPickedImagePath] = useState(defaultImageUrl);
  const [profileId, setProfileId] = useState<string>();
  const { user } = useAuthentication();

  const [open, setOpen] = useState(false);

  const onStateChange = ({ open }: { open: boolean }) => setOpen(open);

  const theme = useTheme();
  const styles = getStyles(theme);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused && user?.uid) {
      getProfilebyUserId(user?.uid)
        .then((profile) => {
          setPickedImagePath(profile.imageUrl);
          onNameChange(profile.name);
          onStudiesChange(profile.studies);
          onLanguagesChange(profile.languages);
          onAboutChange(profile.about);
          setProfileId(profile.id);
        })
        .catch((err) => console.log(`Could not fetch profile: ${err.message}`));
    }
  }, [isFocused, user?.uid]);

  const validateInput = (): boolean => {
    if (!name.value) {
      setName({
        value: "",
        error: true,
      });
      return false;
    }
    if (!studies.value) {
      setStudies({
        value: "",
        error: true,
      });
      return false;
    }
    if (!languages.value) {
      setLanguages({
        value: "",
        error: true,
      });
      return false;
    }
    if (!about.value) {
      setAbout({
        value: "",
        error: true,
      });
      return false;
    }
    if (!pickedImagePath) {
      setPickedImagePath(defaultImageUrl);
    }
    return true;
  };

  const update = async () => {
    if (!validateInput()) return;

    await updateProfile(profileId!, {
      name: name.value,
      studies: studies.value,
      languages: languages.value,
      about: about.value,
      imageUrl: pickedImagePath,
    });

    await getProfile(profileId!);
    navigation.navigate("Root", { screen: "OwnProfile" });
  };

  const showImagePicker = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      return alert("You've refused to allow this appp to access your photos!");
    }

    const result = await ImagePicker.launchImageLibraryAsync();
    await processImagePickerResult(result);
  };

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("You've refused to allow this appp to access your camera!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync();
    await processImagePickerResult(result);
  };

  const processImagePickerResult = async (
    result: ImagePicker.ImagePickerResult
  ) => {
    if (result.canceled || result.assets === null) {
      return;
    }
    console.log("image picker result", result.assets);
    const localImageUrl = result.assets[0].uri;

    const imageUrl = await uploadImage(localImageUrl);
    setPickedImagePath(imageUrl);
    console.log(`A Picture has been uploaded ${imageUrl}`);
  };

  const deletePicture = () => {
    setPickedImagePath(defaultImageUrl);
  };

  const onNameChange = (name: string) => {
    setName({
      value: name,
      error: false,
    });
  };

  const onStudiesChange = (studies: string) => {
    setStudies({
      value: studies,
      error: false,
    });
  };

  const onLanguagesChange = (languages: string) => {
    setLanguages({
      value: languages,
      error: false,
    });
  };

  const onAboutChange = (about: string) => {
    setAbout({
      value: about,
      error: false,
    });
  };

  const onCreateProfile = async () => {
    if (!validateInput()) return;

    const id = await createProfile({
      name: name.value,
      studies: studies.value,
      languages: languages.value,
      about: about.value,
      imageUrl: pickedImagePath,
    });
    console.log(`Created Profile with id ${id}`);
    navigation.navigate("Home");
  };
  const inputRefStudy = useRef<RNTextInput>(null);
  const inputRefLanguages = useRef<RNTextInput>(null);
  const inputRefAbout = useRef<RNTextInput>(null);

  console.log("pickedImagePath", pickedImagePath);

  return (
    <View style={styles.container} testID="screen-edit-profile">
      <ScrollView>
        <View style={styles.imageContainer}>
          <Image source={{ uri: pickedImagePath }} style={styles.image} />

          <FAB.Group
            style={styles.fab}
            open={open}
            theme={{ colors: { backdrop: "transparent" } }}
            visible
            icon={open ? "plus" : "camera"}
            actions={[
              {
                icon: "account-box-multiple",
                label: "Pick a pic!",
                onPress: () => showImagePicker(),
                color: theme.colors.primary,
                labelStyle: { backgroundColor: theme.colors.primary },
                style: { backgroundColor: theme.colors.accent },
                labelTextColor: "black",
              },
              {
                icon: "camera",
                label: "Selfie!",
                onPress: () => openCamera(),
                color: theme.colors.primary,
                labelStyle: { backgroundColor: theme.colors.primary },
                style: { backgroundColor: theme.colors.accent },
                labelTextColor: "black",
              },
              {
                icon: "delete",
                label: "Delete Pic!",
                labelStyle: { backgroundColor: theme.colors.primary },
                onPress: () => deletePicture(),
                color: theme.colors.primary,
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
        </View>

        <View style={styles.inputsContainer}>
          <TextInput
            testID="input-name"
            label="Name*"
            style={styles.name1}
            value={name.value}
            error={name.error}
            returnKeyType="next"
            onChangeText={onNameChange}
            onSubmitEditing={() => inputRefStudy.current?.focus()}
          />
          <View style={styles.inputRow}>
            <FontAwesome name="graduation-cap" style={styles.icon} />
            <TextInput
              testID="input-study"
              label="Field of Study*"
              style={styles.input}
              value={studies.value}
              returnKeyType="next"
              error={studies.error}
              onChangeText={onStudiesChange}
              onSubmitEditing={() => inputRefLanguages.current?.focus()}
              ref={inputRefStudy}
            />
          </View>
          <View style={styles.inputRow}>
            <FontAwesome name="language" style={styles.icon} />
            <TextInput
              testID="input-languages"
              label="Languages*"
              style={styles.input}
              value={languages.value}
              error={languages.error}
              returnKeyType="next"
              onChangeText={onLanguagesChange}
              onSubmitEditing={() => inputRefAbout.current?.focus()}
              ref={inputRefLanguages}
            />
          </View>
          <View style={styles.inputRow}>
            <FontAwesome name="hand-peace-o" style={styles.icon} />
            <TextInput
              testID="input-about"
              label="Who are you?*"
              style={styles.input}
              value={about.value}
              error={about.error}
              onChangeText={onAboutChange}
              ref={inputRefAbout}
            />
          </View>
        </View>
        {!profileId ? (
          <Button
            labelStyle={{
              fontWeight: "700",
              fontSize: 20,
            }}
            contentStyle={{
              width: "72%",
              height: 50,
              borderWidth: 2,
              marginLeft: 63,

              borderColor: theme.colors.accent,
              borderBottomLeftRadius: 50,
            }}
            testID="create-profile"
            onPress={onCreateProfile}
          >
            Create Profile
          </Button>
        ) : (
          <Button
            testID="update-profile"
            labelStyle={{
              fontWeight: "700",
              fontSize: 20,
            }}
            contentStyle={{
              width: "72%",
              height: 50,
              borderWidth: 2,
              marginLeft: 63,

              borderColor: theme.colors.accent,
              borderBottomLeftRadius: 50,
            }}
            onPress={update}
          >
            Update
          </Button>
        )}
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
    imageContainer: {
      width: "70%",
      alignSelf: "center",
    },
    image: {
      width: "100%",
      aspectRatio: 1 / 1,
      borderRadius: 58,
      borderWidth: 5,
      borderColor: theme.colors.accent,
      color: theme.colors.primary,
    },
    fab: {
      marginRight: -25,
      marginBottom: -25,
      backgroundColor: "transparent",
    },
    name1: {
      height: 50,
      width: "60%",
      fontSize: 20,
      marginTop: 30,
      marginBottom: 10,
      borderLeftWidth: 2,
      borderTopWidth: 2,
      borderRightWidth: 2,
      borderTopEndRadius: 20,
      borderColor: theme.colors.accent,
      underlineColor: "transparent",
    },
    icon: {
      marginTop: 10,
      fontSize: 40,
      width: 50,
    },
    inputsContainer: {
      marginBottom: 20,
    },
    input: {
      height: 50,
      width: "100%",
      fontSize: 20,
      marginLeft: 15,
      borderLeftWidth: 2,
      borderTopWidth: 2,
      borderRightWidth: 2,
      marginTop: 5,
      borderTopEndRadius: 20,
      borderColor: theme.colors.accent,
      underlineColor: "transparent",
    },
    inputRow: {
      height: 55,
      flexDirection: "row",
      marginTop: 28,
      marginRight: 100,
    },
  });
};
