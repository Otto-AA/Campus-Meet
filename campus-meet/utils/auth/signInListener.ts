import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import {
  getAuth,
  signInWithEmailLink,
  isSignInWithEmailLink,
  Auth,
} from "firebase/auth";

const handleSignInUrl = async (url: string, auth: Auth) => {
  const email = await AsyncStorage.getItem("email");
  await signInWithEmailLink(auth, email!, url);
  await AsyncStorage.removeItem("email");
};

const handleDeepLink = async (url: string | null) => {
  const auth = getAuth();
  if (url && isSignInWithEmailLink(auth, url)) {
    await handleSignInUrl(url, auth);
  }
};

const checkInitialUrl = async () => {
  const initialUrl = await Linking.getInitialURL();
  await handleDeepLink(initialUrl);
};

export const checkForSignInLink = () => {
  checkInitialUrl();
  const listener = Linking.addEventListener("url", (event) =>
    handleDeepLink(event.url)
  );
  return () => listener.remove();
};
