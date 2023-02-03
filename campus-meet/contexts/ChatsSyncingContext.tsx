import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
} from "react";

import { fetchOwnChats, IChat } from "../api/chats/chatApi";
import { fetchMessagesNewerThan, IMessage } from "../api/chats/messagesApi";
import { ChatsDb } from "../database/chatsDb";
import { ChatsDbContext } from "./ChatsDbContext";
import { ChatsDbSyncedContext } from "./ChatsDbSyncedContext";
import { NotificationEvent } from "./NotificationEvent";
import { PushNotificationContext } from "./NotificationReceiverContext";

export interface IChatPreview {
  chatId: string;
  title: string;
  unreadCount: number;
  lastMessage: {
    id: string;
    from: {
      uid: string;
      name: string;
    };
    date: Date;
    message: string;
  };
}

type ChatsSyncingContextValue = {
  sync(): Promise<void>;
};

export const ChatsSyncingContext = createContext<ChatsSyncingContextValue>(
  undefined as any
);

// TODO: move utility functions to separate file
const syncOnlineWithDb = async (
  db: ChatsDb
): Promise<{ newMessages: IMessage[] }> => {
  const chats = await fetchOwnChats();
  console.log("syncing chats", chats);
  await db.addOrUpdateChats(chats);
  const newMessages = await getNewMessages(db, chats);
  console.log("syncing new messages", newMessages);
  await db.addMessages(newMessages);
  console.log("synced");
  return { newMessages };
};

const getNewMessages = async (
  db: ChatsDb,
  chats: IChat[]
): Promise<IMessage[]> => {
  const newestMessages = await getNewestStoredMessages(db);
  const newMessagesPerChat = await Promise.all(
    chats.map(async (chat) => {
      const newestMessageDate = newestMessages[chat.id] || new Date(0);
      return fetchMessagesNewerThan(chat.id, newestMessageDate);
    })
  );
  return newMessagesPerChat.flat();
};

const getNewestStoredMessages = async (db: ChatsDb) => {
  const chatPreviews = await db.getChatPreviews();
  const newestMessages = chatPreviews.reduce<{ [chatId: string]: Date }>(
    (acc, preview) => {
      acc[preview.chatId] = preview.lastMessage.date;
      return acc;
    },
    {}
  );
  return newestMessages;
};

export default function ChatsSyncingContextProvider(props: PropsWithChildren) {
  const { db } = useContext(ChatsDbContext);
  const { markAsStale: markDbAsStale } = useContext(ChatsDbSyncedContext);
  const notificationContext = useContext(PushNotificationContext);

  // downloads current chat info and new messages
  const syncAndUpdateChats = useCallback(async () => {
    console.log("syncing chats");
    await syncOnlineWithDb(db);
    markDbAsStale();
  }, [db, markDbAsStale]);

  // sync on initial load
  useEffect(() => {
    syncAndUpdateChats();
  }, [syncAndUpdateChats]);

  // sync on new messages notifications
  useEffect(() => {
    if (!notificationContext.listeningForNotifications) return;

    const subscription = notificationContext.subscribeToEvent(
      NotificationEvent.NewMessage,
      syncAndUpdateChats
    );

    return subscription.remove;
  }, [db, notificationContext, syncAndUpdateChats]);

  return (
    <ChatsSyncingContext.Provider
      value={{
        sync: syncAndUpdateChats,
      }}
    >
      {props.children}
    </ChatsSyncingContext.Provider>
  );
}
