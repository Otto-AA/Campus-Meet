import { db } from "./admin";

// chats are automatically created by the firebase functions when a meeting is created
// therefore we wait for them to be created
export const waitForCreationByMeetingFunction = async (
  meetingId: string
): Promise<void> => {
  return tryUntilNoError(() =>
    getChatIdByMeetingId(meetingId).then((id) => {})
  );
};

const getChatIdByMeetingId = async (meetingId: string) => {
  const chat = await db
    .collection("chats")
    .where("meeting", "==", meetingId)
    .get();

  if (chat.empty)
    throw new Error(`Could not get chat for meeting ${meetingId}`);
  return chat.docs[0].id;
};

export const getChatByTitle = async (title: string) => {
  const results = await db
    .collection("chats")
    .where("title", "==", title)
    .get();
  if (results.empty) throw new Error(`Could not get chat with title ${title}`);
  return results.docs[0];
};

const tryUntilNoError = async <T>(
  callback: () => Promise<T>,
  { interval, maxTimeout } = { interval: 100, maxTimeout: 5000 }
) => {
  const start = Date.now();
  let elapsed = 0;
  let reason: Error | undefined = undefined;

  while (elapsed < maxTimeout) {
    try {
      return await callback();
    } catch (e) {
      await sleep(interval);
      elapsed = Date.now() - start;
      reason = e as Error;
    }
  }

  throw reason;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
