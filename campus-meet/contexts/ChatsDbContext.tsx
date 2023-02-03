import { createContext } from "react";

import { ChatsDb } from "../database/chatsDb";

type ChatsDbContextValue = {
  db: ChatsDb;
};

export const ChatsDbContext = createContext<ChatsDbContextValue>({
  db: null as any,
});

export default function ChatsDbProvider(props: React.PropsWithChildren) {
  const db = new ChatsDb();

  return (
    <ChatsDbContext.Provider value={{ db }}>
      {props.children}
    </ChatsDbContext.Provider>
  );
}
