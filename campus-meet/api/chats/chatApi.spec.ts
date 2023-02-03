import { DocumentSnapshot } from "firebase/firestore";

// the mocks must be imported first, afterwards the functions which are tested
import { mockedGetCurrentUserId } from "../../jest/currentUser.mock";
import mockedFirestore from "../../jest/firestore.mock";
import {
  fetchOwnChats,
  getChatIdOfMeeting,
  markAsNewestReadMessage,
} from "./chatApi";

const MOCKED_CURRENT_USER = "user-1234";

const sampleChatDoc = {
  type: "meeting",
  title: "test IT",
  members: ["user1", "user2"],
  membersMetadata: {
    user1: {
      name: "Jacobo",
      imageUrl: "https://example.org/image",
    },
    user2: {
      name: "Lilia",
      imageUrl: "https://example.org/image",
    },
  },
  readUpTo: {
    user1: { toDate: () => new Date(12345) },
  },
};
const sampleChatSnapshot = {
  id: "chat-1",
  data: () => sampleChatDoc,
} as DocumentSnapshot<typeof sampleChatDoc>;

describe("chatApi", () => {
  beforeEach(() => {
    mockedGetCurrentUserId.mockReturnValue(MOCKED_CURRENT_USER);
  });

  it("fetchOwnChats filters where member contains current user id", async () => {
    mockedFirestore.getDocs.mockResolvedValue({ docs: [] } as any);

    await fetchOwnChats();

    expect(mockedFirestore.where).toHaveBeenCalledWith(
      "members",
      "array-contains",
      MOCKED_CURRENT_USER
    );
  });

  it("fetchOwnChats formats chats", async () => {
    mockedFirestore.getDocs.mockResolvedValue({
      docs: [sampleChatSnapshot],
    } as any);

    const chats = await fetchOwnChats();

    expect(chats).toHaveLength(1);
    expect(chats).toEqual([
      {
        id: sampleChatSnapshot.id,
        title: sampleChatDoc.title,
        members: sampleChatDoc.members,
        membersMetadata: sampleChatDoc.membersMetadata,
        readUpTo: {
          [sampleChatDoc.members[0]]:
            // @ts-ignore
            sampleChatDoc.readUpTo[sampleChatDoc.members[0]].toDate(),
          [sampleChatDoc.members[1]]: new Date(0),
        },
        private: false,
      },
    ]);
  });

  it("getChatIdOfMeeting filters meetings server side", async () => {
    mockedFirestore.getDocs.mockResolvedValue({ docs: [{ id: "abc" }] } as any);

    await getChatIdOfMeeting("meeting-1");

    expect(mockedFirestore.where).toHaveBeenCalledWith(
      "meeting",
      "==",
      "meeting-1"
    );
  });

  it("getChatIdOfMeeting returns first result", async () => {
    mockedFirestore.getDocs.mockResolvedValue({ docs: [{ id: "abc" }] } as any);

    const id = await getChatIdOfMeeting("meeting-1");

    expect(id).toBe("abc");
  });

  it("markAsNewestReadMessage updates doc for current user", async () => {
    await markAsNewestReadMessage("chat-1", new Date(12345));

    expect(mockedFirestore.updateDoc).toHaveBeenCalledWith(undefined, {
      [`readUpTo.${MOCKED_CURRENT_USER}`]: new Date(12345),
    });
  });
});
