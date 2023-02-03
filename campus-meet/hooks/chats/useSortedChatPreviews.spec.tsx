import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { DateTime } from "luxon";
import { useContext } from "react";
import { Button, Text } from "react-native-paper";

// mock must be at the top
// eslint-disable-next-line prettier/prettier, import/order
import { mockedChatsDb, resetMockedChatsDb } from "../../jest/db.mock";
import ChatsDbProvider from "../../contexts/ChatsDbContext";
import ChatsDbSyncedProvider, {
  ChatsDbSyncedContext,
} from "../../contexts/ChatsDbSyncedContext";
import { IChatPreview } from "../../contexts/ChatsSyncingContext";
import { useSortedChatPreviews } from "./useSortedChatPreviews";

const mockDbChatPreviews = (chatPreviews: IChatPreview[]) => {
  mockedChatsDb.getChatPreviews.mockResolvedValue(chatPreviews);
};

const DisplayLastMessages = function () {
  const { chatPreviews } = useSortedChatPreviews();
  const { markAsStale } = useContext(ChatsDbSyncedContext);

  const lastMessages = chatPreviews.map(
    (preview) => preview.lastMessage.message
  );
  return (
    <>
      {lastMessages.map((message, i) => (
        <Text key={`message-${i}`} testID={`message-${i}`}>
          {message}
        </Text>
      ))}
      <Button onPress={markAsStale} testID="mark-as-stale">
        Sync
      </Button>
    </>
  );
};

const customRender = (element: JSX.Element) => {
  return render(
    <ChatsDbProvider>
      <ChatsDbSyncedProvider>{element}</ChatsDbSyncedProvider>
    </ChatsDbProvider>
  );
};
const renderExample = () => customRender(<DisplayLastMessages />);

const sampleChatPreviewOld = {
  chatId: "chat-1",
  lastMessage: {
    id: "message-1",
    date: DateTime.now().minus({ days: 1 }).toJSDate(),
    from: {
      uid: "user-1",
      name: "Jacobo",
    },
    message: "old message",
  },
  title: "Chat title",
  unreadCount: 1,
};

const sampleChatPreviewNew = {
  chatId: "chat-1",
  lastMessage: {
    id: "message-2",
    date: DateTime.now().toJSDate(),
    from: {
      uid: "user-2",
      name: "Lilia",
    },
    message: "new message",
  },
  title: "Chat title",
  unreadCount: 1,
};

const originalLog = console.log.bind(console.log);
describe("useSortedChatPreviews", () => {
  beforeAll(() => {
    console.log = (msg) =>
      !msg.includes("rerender ChatsDbSyncedProvider") && originalLog(msg);
  });
  beforeEach(() => {
    resetMockedChatsDb();
  });

  it("should display last messages ordered", async () => {
    mockDbChatPreviews([sampleChatPreviewOld, sampleChatPreviewNew]);

    renderExample();

    await waitFor(() =>
      expect(screen.getByTestId("message-0")).toHaveTextContent("new message")
    );
    await waitFor(() =>
      expect(screen.getByTestId("message-1")).toHaveTextContent("old message")
    );
  });

  it("calls database only once", async () => {
    mockDbChatPreviews([sampleChatPreviewOld]);

    renderExample();

    await waitFor(() => expect(screen.getByTestId("message-0")).toBeVisible());
    expect(mockedChatsDb.getChatPreviews).toHaveBeenCalledTimes(1);
  });

  it("updates data if synced", async () => {
    mockDbChatPreviews([sampleChatPreviewOld]);
    renderExample();
    await waitFor(() => expect(screen.getByTestId("message-0")).toBeVisible());

    mockDbChatPreviews([sampleChatPreviewOld, sampleChatPreviewNew]);
    act(() => fireEvent.press(screen.getByTestId("mark-as-stale")));

    expect(mockedChatsDb.getChatPreviews).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(screen.getByTestId("message-1")).toBeVisible());
  });

  afterAll(() => {
    console.log = originalLog;
  });
});
