import {
  addDoc,
  collection,
  DocumentData,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { getCurrentUserId } from "../../utils/auth/currentUser";
import { getDb } from "../../utils/database/firestore";
import { markAsNewestReadMessage } from "./chatApi";

const getChatsCollection = () => collection(getDb(), "chats");

const getMessagesCollection = (chatId: string) =>
  collection(getChatsCollection(), chatId, "messages");

export interface IMessage {
  id: string;
  chatId: string;
  from: string;
  message: string;
  date: Date;
}

export const sendMessage = async (
  chatId: string,
  message: string
): Promise<string> => {
  const currentUserId = getCurrentUserId();
  const messagesCollection = getMessagesCollection(chatId);
  const date = new Date();

  const { id: newMessageId } = await addDoc(messagesCollection, {
    from: currentUserId,
    message,
    date,
  });

  await markAsNewestReadMessage(chatId, date);

  return newMessageId;
};

const mapDataToMessage = (
  id: string,
  chatId: string,
  data: DocumentData
): IMessage => {
  return {
    id,
    chatId,
    date: data.date.toDate(),
    from: data.from,
    message: data.message,
  };
};

export const fetchMessagesNewerThan = async (chatId: string, date: Date) => {
  const messagesCollection = getMessagesCollection(chatId);
  const newMessages = await getDocs(
    query(messagesCollection, where("date", ">", date))
  );
  return newMessages.docs.map((doc) =>
    mapDataToMessage(doc.id, chatId, doc.data())
  );
};
