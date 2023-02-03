import * as admin from "firebase-admin";

admin.initializeApp();

export {
  onMeetingJoinSendNotifications,
  onMeetingUpdateUpdateChat,
} from "./functions/onMeetingUpdate";
export { onMeetingCreationCreateChat } from "./functions/onMeetingCreation";
export { onMessageSentNotifyRecipients } from "./functions/onMessageSent";
export { onProfileUpdateUpdateReferencedCollections } from './functions/onProfileUpdate'
