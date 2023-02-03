import { useCallback, useContext, useEffect, useState } from "react";

import { ChatsDbSyncedContext } from "../../contexts/ChatsDbSyncedContext";
import { IChatPreview } from "../../contexts/ChatsSyncingContext";
import { newestFirstBy } from "../../utils/sorter/sortByDate";

export const useSortedChatPreviews = () => {
  const { db, dbUpdatedDependency } = useContext(ChatsDbSyncedContext);
  const [chatPreviews, setChatPreviews] = useState<IChatPreview[]>([]);

  const getChatPreviews = useCallback(async () => {
    const chatPreviews = await db.getChatPreviews();
    const sortedChatPreviews = [...chatPreviews].sort(
      newestFirstBy((preview) => preview.lastMessage.date)
    );
    setChatPreviews(sortedChatPreviews);
  }, [db]);

  useEffect(() => {
    getChatPreviews();
  }, [dbUpdatedDependency, getChatPreviews]);

  return { chatPreviews };
};
