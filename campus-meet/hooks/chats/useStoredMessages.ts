import { useContext, useEffect, useState } from "react";

import { IMessage } from "../../api/chats/messagesApi";
import { ChatsDbSyncedContext } from "../../contexts/ChatsDbSyncedContext";

// returns up-to-date messages from local database
export function useStoredMessages(chatId: string) {
  const { db, dbUpdatedDependency } = useContext(ChatsDbSyncedContext);
  const [messages, setMessages] = useState<IMessage[]>();

  useEffect(() => {
    db.getMessages(chatId).then((messages) => {
      setMessages(messages);
    });
  }, [chatId, db, dbUpdatedDependency]);

  return { messages };
}
