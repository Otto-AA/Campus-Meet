import React, { useState } from "react";
import {
  Image,
  ImageSourcePropType,
  Keyboard,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  Button,
  Divider,
  TextInput,
  Subheading,
  Text,
  Title,
  HelperText,
  ActivityIndicator,
  useTheme,
} from "react-native-paper";

import { NetworkRequestFailedException } from "../exceptions/exceptions";
import {
  sendSignInEmail,
  loginWithEmailAndPassword,
} from "../utils/auth/signIn";
import { isE2eTest } from "../utils/e2e/isE2eTest";
import { validateEmail } from "../utils/validator/email";

function Feature({ text, img }: { text: string; img: ImageSourcePropType }) {
  return (
    <View style={styles.feature}>
      <Subheading>{text}</Subheading>
      <Image source={img} style={styles.featureImage} />
    </View>
  );
}

export default function SignInScreen() {
  const [email, setEmail] = useState({ value: "", error: false });
  const [errorMessage, setErrorMessage] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const theme = useTheme();

  const signIn = async () => {
    if (isE2eTest()) {
      return testLogin();
    }
    Keyboard.dismiss();
    setErrorMessage("");
    setEmailSent(false);
    if (!validateEmail(email.value)) {
      return setEmail({ value: email.value, error: true });
    }
    try {
      setLoading(true);
      await sendSignInEmail(email.value);
      setEmailSent(true);
    } catch (err) {
      console.error(err);
      if (err instanceof NetworkRequestFailedException) {
        setErrorMessage(
          "Could not connect to the server. Please check your network connection."
        );
      } else setErrorMessage((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    try {
      await loginWithEmailAndPassword(email.value, "123456");
    } catch (err) {
      alert(`Test login as ${email.value} failed: ${(err as Error).message}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View>
        <Title>Campus Meet</Title>
        <Subheading>Meet new students at your campus!</Subheading>
      </View>
      <Divider style={styles.separator} />
      <View style={styles.contents}>
        <Subheading style={{ textAlign: "center" }}>
          Find students to...
        </Subheading>
        <View style={styles.featureContainer}>
          <Feature
            text="Enjoy lunch"
            img={require("../assets/images/plate-cuttlery.png")}
          />
          <Feature
            text="Study together"
            img={require("../assets/images/study-group.png")}
          />
          <Feature
            text="And more!"
            img={require("../assets/images/table-tennis.png")}
          />
        </View>
      </View>
      <View style={styles.signIn}>
        {!emailSent && (
          <View>
            <Subheading style={{ textAlign: "center", marginBottom: 10 }}>
              Get started now!
            </Subheading>
            <Text>Sign in with your email address</Text>
            <TextInput
              label="Email"
              keyboardType="email-address"
              mode="outlined"
              value={email.value}
              error={email.error}
              onChangeText={(text) => setEmail({ value: text, error: false })}
              onSubmitEditing={signIn}
              testID="email-input"
            />
            <HelperText type="error" visible={email.error} testID="email-error">
              Please enter a valid email address
            </HelperText>
            {!!errorMessage && (
              <Text
                style={{ color: theme.colors.error }}
                testID="sending-error"
              >
                Error: {errorMessage}
              </Text>
            )}
            {isLoading ? (
              <ActivityIndicator size="large" />
            ) : (
              <Button onPress={signIn} mode="contained" testID="signInButton">
                Sign In
              </Button>
            )}
          </View>
        )}
        {emailSent && (
          <View
            style={{
              ...styles.emailSentContainer,
              backgroundColor: theme.colors.accent,
            }}
          >
            <Subheading style={{ alignSelf: "center", marginBottom: 10 }}>
              Email sent!
            </Subheading>
            <Text style={styles.emailSentMessage} testID="email-sent-message">
              Please check your emails to finish the sign in process.
            </Text>
            <Button onPress={() => setEmailSent(false)} mode="text">
              Retry
            </Button>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  contents: {},
  featureContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
  },
  feature: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column-reverse",
  },
  featureImage: {
    height: 90,
    width: 90,
  },
  separator: {
    marginVertical: 30,
    height: 1,
  },
  signIn: {
    marginTop: 30,
  },
  emailSentContainer: {
    borderRadius: 5,
    padding: 5,
  },
  emailSentMessage: {},
});
