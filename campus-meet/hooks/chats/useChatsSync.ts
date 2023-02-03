import { useContext } from "react";

import { ChatsSyncingContext } from "../../contexts/ChatsSyncingContext";

export function useChatsSync() {
  const { sync } = useContext(ChatsSyncingContext);

  return { syncChats: sync };
}
