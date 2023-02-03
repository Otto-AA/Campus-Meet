import * as functions from "firebase-functions";
import { createChatForMeeting } from "../utils/chats";

export const onMeetingCreationCreateChat = functions
  .region("europe-west1")
  .firestore.document("meetings/{meetingId}")
  .onCreate(async (snapshot, context) => {
    const meetingId = snapshot.id;
    const meeting = snapshot.data();
    await createChatForMeeting(meetingId, meeting.title, meeting.members);
  });
