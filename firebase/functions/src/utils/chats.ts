import { Timestamp } from "firebase-admin/firestore";
import { getDb } from "./libraryGetters";
import { getProfilesByUserIds, IProfile } from "./profiles";

export interface IMessage {
  from: string;
  message: string;
  date: Timestamp;
}

export interface IChat {
  type: "meeting" | "private";
  title: string;
  meeting: string;
  members: string[];
  membersMetadata: Record<string, IChatMemberMetadata>;
  readUpTo: Record<string, Timestamp>;
}

export interface IChatMemberMetadata {
  name: string;
  imageUrl: string;
}

export const createChatForMeeting = async (
  meetingId: string,
  meetingTitle: string,
  members: string[]
) => {
  const db = getDb();
  const { id } = await getChatsCollection().add({
    type: "meeting",
    title: meetingTitle,
    meeting: meetingId,
    members: members,
    membersMetadata: {},
    readUpTo: {},
  });
  await updateChatMemberMetadata(id);
};

export const updateChatsMemberMetadata = async (memberUserId: string) => {
  const chats = await getChatsWithMember(memberUserId);
  await Promise.all(chats.map((chat) => updateChatMemberMetadata(chat.id)));
};

export const updateChatMemberMetadata = async (chatId: string) => {
  const chatRef = getChatRef(chatId);
  const chat = await getChat(chatId);
  const profiles = await getProfilesByUserIds(chat.data()!.members);
  const metadata = profiles.reduce<Record<string, IChatMemberMetadata>>(
    (result, doc) => {
      result[doc.data().creator] = profileToMetadata(doc.data());
      return result;
    },
    {}
  );

  await chatRef.update({
    membersMetadata: metadata,
  });
};

const profileToMetadata = (profile: IProfile): IChatMemberMetadata => {
  return {
    name: profile.name,
    imageUrl: profile.imageUrl,
  };
};

export const setChatMembers = async (chatId: string, members: string[]) => {
  const chatRef = getChatRef(chatId);
  await chatRef.update({
    members,
  });
  await updateChatMemberMetadata(chatId)
};

export const setChatTitle = async (chatId: string, title: string) => {
  const chatRef = getChatRef(chatId);
  await chatRef.update({
    title,
  });
};

export const getChat = (chatId: string) => {
  return getChatRef(chatId).get();
};

export const getChatRef = (
  chatId: string
): FirebaseFirestore.DocumentReference<IChat> => {
  return getDb().doc(
    getChatPath(chatId)
  ) as FirebaseFirestore.DocumentReference<IChat>;
};

export const getChatIdForMeeting = async (
  meetingId: string
): Promise<string> => {
  const snapshot = await getChatsCollection()
    .where("meeting", "==", meetingId)
    .get();

  if (snapshot.empty)
    throw new Error(`No chat exists for meeting ${meetingId}`);
  return snapshot.docs[0].id;
};

export const getMessageRecipients = async (chatId: string, sender: string) => {
  const chat = await getChat(chatId);
  const members = chat.data()!.members;
  return members.filter((member) => member !== sender);
};

export const getChatsWithMember = async (memberUserId: string) => {
  const snapshot = await getChatsCollection()
    .where("members", "array-contains", memberUserId)
    .get();

  return snapshot.docs;
};

const getChatPath = (chatId: string) => `chats/${chatId}`;

const getChatsCollection = () =>
  getDb().collection("chats") as FirebaseFirestore.CollectionReference<IChat>;
