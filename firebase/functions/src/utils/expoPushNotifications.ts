import {ExpoPushMessage, ExpoPushToken} from "expo-server-sdk";
import { info, error } from "firebase-functions/logger";
import {getDb, getExpoInstance, getExpo} from "./libraryGetters";

export type ExpoPushMessageContent = Omit<ExpoPushMessage, "to">;

export const sendNotificationsTo = async (
    uids: string[],
    message: ExpoPushMessageContent
) => {
  info(`sendNotificationsTo(${uids}, ${JSON.stringify(message)})`)
  const pushTokens = await getPushTokens(uids);
  const messages: ExpoPushMessage[] = pushTokens.map((token) => {
    return {
      to: token,
      ...message,
    };
  });
  await sendPushNotifications(messages);
};

export const sendPushNotifications = async (messages: ExpoPushMessage[]) => {
  // The Expo push notification service accepts batches of notifications so
  // that you don't need to send 1000 requests to send 1000 notifications. We
  // recommend you batch your notifications to reduce the number of requests
  // and to compress them (notifications with similar content will get
  // compressed).
  const expo = getExpoInstance();
  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];
  // Send the chunks to the Expo push notification service. There are
  // different strategies you could use. A simple one is to send one chunk at a
  // time, which nicely spreads the load out over time:
  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
      // NOTE: If a ticket contains an error code in ticket.details.error, you
      // must handle it appropriately. The error codes are listed in the Expo
      // documentation:
      // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
    } catch (err) {
      error('could not send push notification', error)
    }
  }
  info('notification tickets', JSON.stringify(tickets))
};

const getPushToken = async (uid: string): Promise<ExpoPushToken | null> => {
  const pushTokenRef = getDb().doc(`pushtokens/${uid}`);
  const expoPushTokenDoc = await pushTokenRef.get();
  const token = expoPushTokenDoc.data()?.token;
  if (!getExpo().isExpoPushToken(token)) {
    error(`Could not get push token for ${uid}`, expoPushTokenDoc.exists)
    return null
    // throw new Error(`Invalid expo push token: ${token}`);
  }
  return token;
};

const getPushTokens = async (uids: string[]): Promise<string[]> => {
  const tokens = await Promise.all(uids.map(getPushToken));
  return tokens.filter(token => token !== null) as string[];
};
