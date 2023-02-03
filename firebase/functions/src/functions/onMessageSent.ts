import * as functions from "firebase-functions";
import { getChat, getMessageRecipients, IMessage } from "../utils/chats";
import { sendNotificationsTo } from "../utils/expoPushNotifications";
import { getMeeting } from "../utils/meetings";

export const onMessageSentNotifyRecipients = functions
  .region("europe-west1")
  .firestore.document("chats/{chatId}/messages/{messageId}")
  .onCreate(async (snapshot, context) => {
    const { chatId, messageId } = context.params;
    const { message, from, date } = snapshot.data() as IMessage;

    const recipients = await getMessageRecipients(chatId, from);
    const chat = await getChat(chatId);
    const meetingId = chat.data()!.meeting as string;
    const meeting = await getMeeting(meetingId);
    const fromName = chat.data()!.membersMetadata[from].name

    await sendNotificationsTo(recipients, {
      title: meeting ? meeting.data()!.title : 'New Message',
      body: `${fromName}: ${message}`,
      data: {
        event: "newMessage",
        content: {
          id: messageId,
          chatId,
          from,
          date: date.toDate().getTime(),
          message,
        },
      },

    });
  });
