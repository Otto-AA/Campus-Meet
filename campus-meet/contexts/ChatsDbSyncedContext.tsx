import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useState,
} from "react";

import { ChatsDb } from "../database/chatsDb";
import { ChatsDbContext } from "./ChatsDbContext";

interface ChatsDbContextValue {
  db: ChatsDb;
  // will be increased everytime the db updates
  // so it can be used as a useEffect dependency
  dbUpdatedDependency: number;
  markAsStale: () => void;
}

// context providing db which is rerendered when db has new values
export const ChatsDbSyncedContext = createContext<ChatsDbContextValue>(
  null as any
);

export default function ChatsDbSyncedProvider({ children }: PropsWithChildren) {
  console.log("rerender ChatsDbSyncedProvider");
  const { db } = useContext(ChatsDbContext);
  const [update, setUpdate] = useState(0);

  const markAsStale = useCallback(() => {
    console.log("markAsStale");
    setUpdate((val) => val + 1);
  }, []);

  return (
    <ChatsDbSyncedContext.Provider
      value={{
        db,
        dbUpdatedDependency: update,
        markAsStale,
      }}
    >
      {children}
    </ChatsDbSyncedContext.Provider>
  );
}
