import { renderHook } from "@testing-library/react-native";

import { ChatsSyncingContext } from "../../contexts/ChatsSyncingContext";
import { useChatsSync } from "./useChatsSync";

describe("useChatsSync", () => {
  it("should return the syncChats function from the ChatsSyncingContext", () => {
    const sync = jest.fn();
    const providerValue = { sync };

    const { result } = renderHook(() => useChatsSync(), {
      wrapper: ({ children }) => (
        <ChatsSyncingContext.Provider value={providerValue}>
          {children}
        </ChatsSyncingContext.Provider>
      ),
    });

    expect(result.current.syncChats).toEqual(sync);
  });
});
