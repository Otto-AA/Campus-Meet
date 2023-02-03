import { collection, doc, setDoc } from "firebase/firestore";

import { getCurrentUserId } from "../../utils/auth/currentUser";
import { getDb } from "../../utils/database/firestore";

export const getPushTokensCollection = () => collection(getDb(), "pushtokens");

export const savePushTokenToServer = async (token: string) => {
  const currentUserId = getCurrentUserId();
  const pushTokenDoc = doc(getPushTokensCollection(), currentUserId);
  await setDoc(pushTokenDoc, {
    token,
  });
};
