import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { DateTime } from "luxon";

import { markAsNewestReadMessage } from "../../api/chats/chatApi";
import { IMessage, sendMessage } from "../../api/chats/messagesApi";
import {
  IChatMetadata,
  useChatMetadata,
} from "../../hooks/chats/useChatMetadata";
import { useChatsSync } from "../../hooks/chats/useChatsSync";
import { useStoredMessages } from "../../hooks/chats/useStoredMessages";
import mockedAuth from "../../jest/auth.mock";
import {
  mockedNavigate,
  mockedSetOptions,
} from "../../jest/useNavigation.mock";
import { mockedFunctionType } from "../../utils/types/mockedType";
import ChatScreen from "./ChatScreen";

jest.mock("../../hooks/chats/useStoredMessages");
const mockedUseStoredMessages = mockedFunctionType(useStoredMessages);

jest.mock("../../hooks/chats/useChatMetadata");
const mockedUseChatMetadata = mockedFunctionType(useChatMetadata);

jest.mock("../../hooks/chats/useChatsSync");
const mockedUseChatsSync = mockedFunctionType(useChatsSync);
const mockedSyncChats = jest.fn();
mockedUseChatsSync.mockReturnValue({ syncChats: mockedSyncChats });

jest.mock("../../api/chats/chatApi");
const mockedMarkAsNewestReadMessage = mockedFunctionType(
  markAsNewestReadMessage
);
jest.mock("../../api/chats/messagesApi");
const mockedSendMessage = mockedFunctionType(sendMessage);

const givenMessages = (messages: IMessage[]) =>
  mockedUseStoredMessages.mockReturnValue({
    messages,
  });

const givenMetadata = (metadata: IChatMetadata) =>
  mockedUseChatMetadata.mockReturnValue({
    chatMetadata: metadata,
  });

const sampleChatMetadata: IChatMetadata = {
  id: "chat-1",
  title: "Test IT",
  members: ["user1", "user2"],
  membersMetadata: {
    user1: {
      name: "Jacobo",
      imageUrl: "https://example.org",
    },
    user2: {
      name: "Lilia",
      imageUrl: "https://example.org",
    },
  },
  private: false,
};

const sampleOldMessage = {
  id: "message-1",
  chatId: sampleChatMetadata.id,
  date: DateTime.now().minus({ days: 2 }).toJSDate(),
  from: sampleChatMetadata.members[0],
  message: "an old message",
};
const sampleMessage = {
  id: "message-2",
  chatId: sampleChatMetadata.id,
  date: DateTime.now().minus({ days: 1 }).toJSDate(),
  from: sampleChatMetadata.members[0],
  message: "a medium old message",
};
const sampleNewMessage = {
  id: "message-3",
  chatId: sampleChatMetadata.id,
  date: DateTime.now().toJSDate(),
  from: sampleChatMetadata.members[1],
  message: "a new message",
};
const sampleMessages: IMessage[] = [
  sampleNewMessage,
  sampleOldMessage,
  sampleMessage,
];

const routeFor = (chatId: string) =>
  ({
    params: {
      chatId,
    },
  } as any);

const originalWarn = console.warn.bind(console.warn);
describe("ChatScreen", () => {
  beforeAll(() => {
    // hide warnings that occur because of paper TextInput
    console.warn = (msg) =>
      !msg.toString().includes("useNativeDriver") && originalWarn(msg);
  });

  beforeEach(() => {
    mockedSendMessage.mockReset();
    mockedNavigate.mockReset();
    mockedSetOptions.mockReset();
    mockedAuth.getAuth.mockReturnValue({ uid: "test-user" } as any);
  });

  it("can render chat screen without errors", async () => {
    givenMessages([]);
    givenMetadata(sampleChatMetadata);

    render(<ChatScreen navigation={null as any} route={routeFor("chat-1")} />);
  });

  it("updates screen title to chat title", async () => {
    givenMessages([]);
    givenMetadata(sampleChatMetadata);

    render(
      <ChatScreen
        navigation={null as any}
        route={routeFor(sampleChatMetadata.id)}
      />
    );

    expect(mockedSetOptions).toHaveBeenCalledWith({
      headerTitle: expect.any(Function),
    });
  });

  it("displays messages from oldest to newest", async () => {
    givenMetadata(sampleChatMetadata);
    givenMessages(sampleMessages);

    render(
      <ChatScreen
        navigation={null as any}
        route={routeFor(sampleChatMetadata.id)}
      />
    );

    const messages = screen.queryAllByTestId(/message-\d+/);
    expect(messages).toHaveLength(3);
    expect(messages[0]).toHaveTextContent(sampleOldMessage.message);
    expect(messages[1]).toHaveTextContent(sampleMessage.message);
    expect(messages[2]).toHaveTextContent(sampleNewMessage.message);
  });

  it("marks newest message as read", async () => {
    givenMetadata(sampleChatMetadata);
    givenMessages(sampleMessages);

    render(
      <ChatScreen
        navigation={null as any}
        route={routeFor(sampleChatMetadata.id)}
      />
    );

    expect(mockedMarkAsNewestReadMessage).toHaveBeenCalledWith(
      sampleChatMetadata.id,
      sampleNewMessage.date
    );
  });

  it("can send new messages", async () => {
    givenMetadata(sampleChatMetadata);
    givenMessages([]);
    const newMessage = "A new test message";

    render(
      <ChatScreen
        navigation={null as any}
        route={routeFor(sampleChatMetadata.id)}
      />
    );

    act(() => {
      fireEvent.changeText(screen.getByTestId("message-input"), newMessage);
    });
    act(() => {
      fireEvent.press(screen.getByTestId("send"));
    });
    await waitFor(() =>
      expect(screen.getByTestId("message-input")).toHaveTextContent("")
    );

    expect(mockedSendMessage).toHaveBeenCalledWith(
      sampleChatMetadata.id,
      newMessage
    );
  });

  it("cannot send empty message", async () => {
    givenMetadata(sampleChatMetadata);
    givenMessages([]);

    render(
      <ChatScreen
        navigation={null as any}
        route={routeFor(sampleChatMetadata.id)}
      />
    );

    act(() => {
      fireEvent.changeText(screen.getByTestId("message-input"), "");
    });
    act(() => {
      fireEvent.press(screen.getByTestId("send"));
    });

    expect(mockedSendMessage).not.toHaveBeenCalled();
  });

  afterAll(() => {
    console.warn = originalWarn;
  });
});
