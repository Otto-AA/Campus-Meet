import * as functions from "firebase-functions";
import {
  getChatIdForMeeting,
  setChatMembers,
  setChatTitle,
} from "../utils/chats";
import {
  ExpoPushMessageContent,
  sendNotificationsTo,
} from "../utils/expoPushNotifications";
import { getProfilesByUserIds } from "../utils/profiles";

// notify all members when a new one joins the group
export const onMeetingJoinSendNotifications = functions
  .region("europe-west1")
  .firestore.document("meetings/{meetingId}")
  .onUpdate(async (change, context) => {
    const { after, before } = change;
    const membersBefore = before.data().members;
    const membersAfter = after.data().members;
    const meetingTitle = after.data().title;
    const newUsers = newMembers(membersBefore, membersAfter);

    if (newUsers.length) {
      const profiles = await getProfilesByUserIds(newUsers);
      const newUserName = profiles[0].data().name;
      const message: ExpoPushMessageContent = {
        title: meetingTitle,
        body: `${newUserName} joined your meeting`,
        data: {
          event: "newMeetingMember",
          content: {
            meetingId: after.id,
            newMemberUid: newUsers[0],
          },
        },
      };
      await sendNotificationsTo(membersBefore, message);
    }
  });

export const onMeetingUpdateUpdateChat = functions
  .region("europe-west1")
  .firestore.document("meetings/{meetingId}")
  .onUpdate(async (change, context) => {
    const { after, before } = change;
    const newMeeting = change.after.data();
    const newMembers = newMeeting.members;

    const chatId = await getChatIdForMeeting(change.after.id);
    await setChatMembers(chatId, newMembers);

    if (after.data().title !== before.data().title)
      await setChatTitle(chatId, after.data().title);
  });

const newMembers = (before: string[], after: string[]) => {
  return after.filter((uid) => !before.includes(uid));
};
