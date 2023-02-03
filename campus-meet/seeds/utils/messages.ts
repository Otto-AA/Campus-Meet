import { db } from "./admin";

export interface ISeedMessage {
  from: string;
  date: Date;
  message: string;
}

export const addMessages = async (chatId: string, messages: ISeedMessage[]) => {
  const batch = await db.batch();
  const chatsCollection = db
    .collection("chats")
    .doc(chatId)
    .collection("messages");

  for (const message of messages) {
    batch.create(chatsCollection.doc(), message);
  }

  await batch.commit();
};
