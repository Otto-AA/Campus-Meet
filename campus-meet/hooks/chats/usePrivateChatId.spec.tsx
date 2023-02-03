import { act, renderHook, waitFor } from "@testing-library/react-native";

import { ChatsDbSyncedContext } from "../../contexts/ChatsDbSyncedContext";
import { usePrivateChatId } from "./usePrivateChatId";

describe("usePrivateChatId", () => {
  it("fetches the private chat ID from the database", async () => {
    // Arrange
    const userId = "user1";
    const privateChatId = "private-chat-id";
    const db = {
      getPrivateChatId: jest.fn().mockResolvedValue(privateChatId),
    };
    const providerValue = {
      db,
      dbUpdatedDependency: 0,
    };

    // Act
    const { result } = renderHook(() => usePrivateChatId(userId), {
      wrapper: ({ children }) => (
        <ChatsDbSyncedContext.Provider value={providerValue}>
          {children}
        </ChatsDbSyncedContext.Provider>
      ),
    });
    await act(async () => {
      await waitFor(() => {
        expect(result.current.chatId).toBe();
      });
    });

    // Assert
    expect(result.current.chatId).toBe(privateChatId);
    expect(db.getPrivateChatId).toHaveBeenCalledWith(userId);
  });
});
