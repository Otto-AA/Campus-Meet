import { useContext, useEffect, useState } from "react";

import { IProfileMetadata } from "../../api/profiles/profileAPI";
import { ChatsDbSyncedContext } from "../../contexts/ChatsDbSyncedContext";

export interface IChatMetadata {
  id: string;
  title: string;
  members: string[];
  membersMetadata: Record<string, IProfileMetadata>;
  private: boolean;
}

export function useChatMetadata(chatId: string) {
  const { db, dbUpdatedDependency } = useContext(ChatsDbSyncedContext);
  const [metadata, setMetadata] = useState<IChatMetadata>();

  useEffect(() => {
    db.getChatMetadata(chatId).then(setMetadata);
  }, [db, chatId, dbUpdatedDependency]);

  return {
    chatMetadata: metadata,
  };
}
