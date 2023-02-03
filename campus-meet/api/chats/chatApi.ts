import {
  collection,
  getDocs,
  where,
  query,
  Timestamp,
  DocumentData,
  doc,
  updateDoc,
  addDoc,
  getDoc,
} from "firebase/firestore";

import { getCurrentUserId } from "../../utils/auth/currentUser";
import { getDb } from "../../utils/database/firestore";
import {
  getProfileMetadataByUserId,
  IProfileMetadata,
} from "../profiles/profileAPI";

const getChatsCollection = () => collection(getDb(), "chats");
const getChatDoc = (chatId: string) => doc(getChatsCollection(), chatId);

export interface IChat {
  id: string;
  title: string | null;
  members: string[];
  membersMetadata: { [userId: string]: IProfileMetadata };
  readUpTo: { [userId: string]: Date };
  meeting: string | null;
  private: boolean;
}

export const createPrivateChat = async (userId: string) => {
  const currentUserId = getCurrentUserId();
  const profileMetadata = await getProfileMetadataByUserId(userId);
  const ownProfileMetadata = await getProfileMetadataByUserId(currentUserId);

  const chat = {
    type: "private",
    // the title is computed when fetching based on the others name
    title: null,
    meeting: null,
    members: [currentUserId, userId],
    membersMetadata: {
      [userId]: profileMetadata,
      [currentUserId]: ownProfileMetadata,
    },
    readUpTo: {},
  };
  const ref = await addDoc(getChatsCollection(), chat);
  console.log(`Created chat with id ${ref.id}`);
  return ref.id;
};

export const fetchOwnChats = async (): Promise<IChat[]> => {
  const currentUserId = getCurrentUserId();
  const chatsQuery = query(
    getChatsCollection(),
    where("members", "array-contains", currentUserId)
  );
  const querySnapshot = await getDocs(chatsQuery);
  const chats = querySnapshot.docs.map((doc) =>
    mapDataToChat(doc.id, doc.data())
  );
  return chats;
};

export const getChatIdOfMeeting = async (
  meetingId: string
): Promise<string> => {
  const chatsQuery = query(
    getChatsCollection(),
    where("meeting", "==", meetingId)
  );
  const querySnapshot = await getDocs(chatsQuery);
  if (querySnapshot.empty)
    throw new Error(`Could not get chat for meeting ${meetingId}`);

  return querySnapshot.docs.map((doc) => doc.id)[0];
};

export const getChat = async (chatId: string): Promise<IChat> => {
  const doc = await getDoc(getChatDoc(chatId));
  if (!doc.exists()) {
    throw new Error(`Could not get chat with id ${chatId}`);
  }
  return mapDataToChat(doc.id, doc.data());
};

export const markAsNewestReadMessage = async (
  chatId: string,
  messageDate: Date
) => {
  const currentUserId = getCurrentUserId();
  const chatCollection = doc(getChatsCollection(), chatId);

  await updateDoc(chatCollection, {
    [`readUpTo.${currentUserId}`]: messageDate,
  });
};

const mapDataToChat = (id: string, data: DocumentData): IChat => {
  const readUpTo: Record<string, Timestamp> = data.readUpTo;
  const readUpToDates: Record<string, Date> = {};
  Object.values(data.members as string[]).forEach(
    (userId) =>
      (readUpToDates[userId] = readUpTo[userId]?.toDate() ?? new Date(0))
  );

  const title = getChatTitle(
    data.type,
    data.title,
    data.members,
    data.membersMetadata
  );

  return {
    id,
    title,
    members: data.members,
    membersMetadata: data.membersMetadata,
    readUpTo: readUpToDates,
    meeting: data.meeting,
    private: data.type === "private",
  };
};

const getChatTitle = (
  chatType: "private" | "meeting",
  statedTitle: string,
  members: string[],
  membersMetadata: Record<string, IProfileMetadata>
) => {
  if (chatType === "meeting") return statedTitle;
  const currentUid = getCurrentUserId();
  const otherMembers = members.filter((member) => member !== currentUid);
  if (otherMembers.length !== 1)
    console.warn(`Unexpected number of users for private meeting`, members);
  return membersMetadata[otherMembers[0]].name;
};
