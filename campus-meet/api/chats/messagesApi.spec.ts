import { DocumentSnapshot } from "firebase/firestore";

// the mocks must be imported first, afterwards the functions which are tested
import { mockedGetCurrentUserId } from "../../jest/currentUser.mock";
import mockedFirestore from "../../jest/firestore.mock";
import { mockedFunctionType } from "../../utils/types/mockedType";
import { markAsNewestReadMessage } from "./chatApi";
import { fetchMessagesNewerThan, sendMessage } from "./messagesApi";

jest.mock("./chatApi");
const mockedMarkAsNewestReadMessage = mockedFunctionType(
  markAsNewestReadMessage
);
mockedMarkAsNewestReadMessage.mockResolvedValue();

const sampleMessageDoc = {
  from: "someone",
  date: { toDate: () => new Date() },
  message: "hey",
};
const sampleMessageSnapshot = {
  id: "message-id",
  data: () => sampleMessageDoc,
} as DocumentSnapshot<typeof sampleMessageDoc>;

const CURRENT_DATE = new Date();

describe("messagesApi", () => {
  beforeAll(() => {
    jest.useFakeTimers({
      doNotFake: ["nextTick"],
      now: CURRENT_DATE,
    });
  });

  it("sendMessage targets correct messages collection", async () => {
    mockedGetCurrentUserId.mockReturnValue("current-user");
    mockedFirestore.addDoc.mockResolvedValue({ id: "message-1" } as any);

    await sendMessage("chat-1", "What is up?");

    expect(mockedFirestore.collection).toHaveBeenNthCalledWith(
      1,
      undefined,
      "chats"
    );
    expect(mockedFirestore.collection).toHaveBeenNthCalledWith(
      2,
      undefined,
      "chat-1",
      "messages"
    );
  });

  it("sendMessage calls addDoc with correct data", async () => {
    mockedGetCurrentUserId.mockReturnValue("current-user");
    mockedFirestore.addDoc.mockResolvedValue({ id: "message-1" } as any);

    await sendMessage("chat-1", "What is up?");

    expect(mockedFirestore.addDoc).toHaveBeenCalledWith(undefined, {
      from: "current-user",
      message: "What is up?",
      date: new Date(),
    });
  });

  it("sendMessage returns new message id", async () => {
    mockedGetCurrentUserId.mockReturnValue("current-user");
    mockedFirestore.addDoc.mockResolvedValue({ id: "message-1" } as any);

    const id = await sendMessage("chat-1", "Hey");

    expect(id).toBe("message-1");
  });

  it("sendMessage marks message as read", async () => {
    mockedGetCurrentUserId.mockReturnValue("current-user");
    mockedFirestore.addDoc.mockResolvedValue({ id: "message-1" } as any);

    await sendMessage("chat-1", "Hi");

    expect(mockedMarkAsNewestReadMessage).toHaveBeenCalledWith(
      "chat-1",
      CURRENT_DATE
    );
  });

  it("fetchMessagesNewerThan filters messages server side", async () => {
    mockedFirestore.getDocs.mockResolvedValue({ docs: [] } as any);

    await fetchMessagesNewerThan("chat-1", new Date(12345));

    expect(mockedFirestore.where).toHaveBeenCalledWith(
      "date",
      ">",
      new Date(12345)
    );
  });

  it("fetchMessagesNewerThan formats messages", async () => {
    mockedFirestore.getDocs.mockResolvedValue({
      docs: [sampleMessageSnapshot],
    } as any);

    const res = await fetchMessagesNewerThan("chat-1", new Date(12345));

    expect(res).toEqual([
      {
        chatId: "chat-1",
        id: sampleMessageSnapshot.id,
        date: sampleMessageDoc.date.toDate(),
        from: sampleMessageDoc.from,
        message: sampleMessageDoc.message,
      },
    ]);
  });

  afterAll(() => {
    jest.useRealTimers();
  });
});
