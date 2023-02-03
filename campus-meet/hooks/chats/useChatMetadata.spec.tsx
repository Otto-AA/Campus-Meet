import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  renderHook,
} from "@testing-library/react-native";

import { ChatsDbSyncedContext } from "../../contexts/ChatsDbSyncedContext";
import { useChatMetadata } from "./useChatMetadata";

describe("useChatMetadata", () => {
  it("fetches chat metadata from the database", async () => {
    // Arrange
    const chatId = "some-chat-id";
    const db = {
      getChatMetadata: jest.fn().mockResolvedValue({
        id: chatId,
        title: "Some Chat",
        members: ["user1", "user2"],
        membersMetadata: {
          user1: { name: "User 1" },
          user2: { name: "User 2" },
        },
        private: false,
      }),
    };
    const providerValue = {
      db,
      dbUpdatedDependency: 0,
    };

    // Act
    const { result } = renderHook(() => useChatMetadata(chatId), {
      wrapper: ({ children }) => (
        <ChatsDbSyncedContext.Provider value={providerValue}>
          {children}
        </ChatsDbSyncedContext.Provider>
      ),
    });
    await waitFor(() => {
      expect(result.current.chatMetadata).toBeDefined();
    });

    // Assert
    const metadata = result.current.chatMetadata;
    expect(metadata).toHaveProperty("id", chatId);
    expect(metadata).toHaveProperty("title");
    expect(metadata).toHaveProperty("members");
    expect(metadata).toHaveProperty("membersMetadata");
    expect(metadata).toHaveProperty("private");
  });
});
