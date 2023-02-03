import { openDatabase } from "expo-sqlite";

import { IChat } from "../api/chats/chatApi";
import { IMessage } from "../api/chats/messagesApi";
import { mockedGetCurrentUserId } from "../jest/currentUser.mock";
import { mockedFunctionType } from "../utils/types/mockedType";
import { ChatsDb } from "./chatsDb";

jest.mock("expo-sqlite");
const mockedOpenDatabase = mockedFunctionType(openDatabase);
const mockedExecuteSql = jest.fn();
const mockedTransaction = (
  txCallback: any,
  errCallback: any,
  successCallback: any
) => {
  txCallback({
    executeSql: mockedExecuteSql,
  });
};
mockedOpenDatabase.mockReturnValue({
  transaction: mockedTransaction,
} as any);

const givenDb = () => {
  const db = new ChatsDb();
  mockedExecuteSql.mockReset();
  return db;
};

const getSuccessCallback = () => mockedExecuteSql.mock.lastCall[2];
const returnRows = (_array: any[]) =>
  getSuccessCallback()(null, {
    rows: {
      length: _array.length,
      _array,
    },
  });

const sampleStoredMessage = {
  id: "message-1",
  chatId: "chat-1",
  date: 12345,
  sender: "user-1",
  message: "hey there",
};

const sampleStoredChatPreview = {
  chatId: "chat-1",
  title: "Test IT",
  unread: 5,
  messageId: "message-1",
  messageDate: 12345,
  messageFrom: "user-1",
  messageFromName: "Lilith",
  messageMessage: "hey there",
};

const sampleStoredChatMetadata = [
  {
    id: "chat-1",
    title: "Test IT",
    uid: "user-1",
    name: "Jacobo",
    private: 1,
    imageUrl: "https://example.org/img1.jpg",
  },
  {
    id: "chat-1",
    title: "Test IT",
    uid: "user-2",
    name: "Janna",
    private: 1,
    imageUrl: "https://example.org/img2.jpg",
  },
];

const sampleMessages: IMessage[] = [
  {
    chatId: "chat-1",
    date: new Date(12345),
    from: "user-1",
    id: "message-1",
    message: "hey there",
  },
  {
    chatId: "chat-1",
    date: new Date(23456),
    from: "user-2",
    id: "message-2",
    message: "bye bye",
  },
];

const sampleChats: IChat[] = [
  {
    id: "chat-1",
    title: "test IT",
    members: ["user1"],
    membersMetadata: {
      user1: {
        name: "Jacobo",
        imageUrl: "https://example.org/image",
      },
    },
    readUpTo: {
      user1: new Date(12345),
    },
    meeting: "meeting-1",
    private: false,
  },
];

const mockedUserId = "user-12345";
mockedGetCurrentUserId.mockReturnValue(mockedUserId);

const originalLog = console.log.bind(console.log);
describe("ChatsDb", () => {
  beforeAll(() => {
    console.log = () => {};
  });
  beforeEach(() => {
    mockedExecuteSql.mockReset();
  });

  it("creates tables on creation", () => {
    // eslint-disable-next-line no-new
    new ChatsDb();

    expect(mockedExecuteSql).toHaveBeenCalledTimes(4);
    expect(mockedExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining("CREATE TABLE"),
      expect.anything(),
      undefined,
      expect.any(Function)
    );
  });

  it("getMessages calls executeSql with chatId", async () => {
    const db = givenDb();

    db.getMessages("chat-1");

    expect(mockedExecuteSql).toHaveBeenCalledWith(
      expect.anything(),
      ["chat-1"],
      expect.any(Function),
      expect.any(Function)
    );
  });

  it("getMessages correctly parses date", async () => {
    const db = givenDb();

    const promise = db.getMessages("chat-1");
    returnRows([sampleStoredMessage]);

    const messages = await promise;
    expect(messages).toHaveLength(1);
    expect(messages[0]).toHaveProperty(
      "date",
      new Date(sampleStoredMessage.date)
    );
  });

  it("getChatPreviews correctly parses rows", async () => {
    const db = givenDb();

    const promise = db.getChatPreviews();
    returnRows([sampleStoredChatPreview]);

    const chatPreviews = await promise;
    expect(chatPreviews).toEqual([
      {
        chatId: sampleStoredChatPreview.chatId,
        title: sampleStoredChatPreview.title,
        unreadCount: sampleStoredChatPreview.unread,
        lastMessage: {
          id: sampleStoredChatPreview.messageId,
          date: new Date(sampleStoredChatPreview.messageDate),
          from: {
            uid: sampleStoredChatPreview.messageFrom,
            name: sampleStoredChatPreview.messageFromName,
          },
          message: sampleStoredChatPreview.messageMessage,
        },
      },
    ]);
  });

  it("getChatMetadata correctly parses rows", async () => {
    const db = givenDb();

    const promise = db.getChatMetadata("chat-1");
    returnRows(sampleStoredChatMetadata);

    const metadata = await promise;
    expect(metadata).toEqual({
      id: sampleStoredChatMetadata[0].id,
      title: sampleStoredChatMetadata[0].title,
      members: [
        sampleStoredChatMetadata[0].uid,
        sampleStoredChatMetadata[1].uid,
      ],
      membersMetadata: {
        [sampleStoredChatMetadata[0].uid]: {
          name: sampleStoredChatMetadata[0].name,
          imageUrl: sampleStoredChatMetadata[0].imageUrl,
        },
        [sampleStoredChatMetadata[1].uid]: {
          name: sampleStoredChatMetadata[1].name,
          imageUrl: sampleStoredChatMetadata[1].imageUrl,
        },
      },
      private: true,
    });
  });

  it("getPrivateChatId returns chat id if a private chat with this user exists", async () => {
    const db = givenDb();

    const promise = db.getPrivateChatId("user-0");
    returnRows([{ chatId: "chat-0" }]);

    await expect(promise).resolves.toBe("chat-0");
  });

  it("getPrivateChatId returns null if no private chat with this user exists", async () => {
    const db = givenDb();

    const promise = db.getPrivateChatId("user-0");
    returnRows([]);

    await expect(promise).resolves.toBeNull();
  });

  it("addMessages calls INSERT with appropriate values", async () => {
    const db = givenDb();

    db.addMessages(sampleMessages);

    const args = mockedExecuteSql.mock.lastCall;
    expect(args).toHaveLength(4);
    const [sql, parameters] = args;
    expect(sql.split("?").length - 1).toBe(parameters.length);
  });

  it("addOrUpdateChats updates chats, members and read counts", async () => {
    const db = givenDb();

    db.addOrUpdateChats(sampleChats);

    expect(mockedExecuteSql).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("chats"),
      expect.anything()
    );
    expect(mockedExecuteSql).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("members"),
      expect.anything()
    );
    expect(mockedExecuteSql).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining("read"),
      expect.anything()
    );
  });

  afterAll(() => {
    console.log = originalLog;
  });
});
