import { useContext, useEffect, useState } from "react";

import { ChatsDbSyncedContext } from "../../contexts/ChatsDbSyncedContext";

export const usePrivateChatId = (userId: string) => {
  const { db, dbUpdatedDependency } = useContext(ChatsDbSyncedContext);
  const [chatId, setChatId] = useState<string | null>();

  useEffect(() => {
    db.getPrivateChatId(userId).then(setChatId);
  }, [db, dbUpdatedDependency, userId]);

  return { chatId };
};
