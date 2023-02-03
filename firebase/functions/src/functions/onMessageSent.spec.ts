import * as firebaseFunctionsTest from "firebase-functions-test";
import * as sinon from "sinon";
import * as expoPushNotifications from "../utils/expoPushNotifications";
import * as chats from "../utils/chats";
import * as meetings from "../utils/meetings";
import { onMessageSentNotifyRecipients } from "./onMessageSent";
import { firestore } from "firebase-admin";

const test = firebaseFunctionsTest();
const wrappedOnMessageSentNotifyRecipients = test.wrap(
  onMessageSentNotifyRecipients
);

const fakeSnapshot = (data: object) =>
  test.firestore.makeDocumentSnapshot(data, "");

const fakeDocRef = (data: object) => {
  return {
    get: () =>
      Promise.resolve({
        data: () => data,
      }),
  };
};

const fakeDoc = (data: object) => {
  return {
    data: () => data,
  };
};

describe("onMessageSentNotifyRecipients", () => {
  let sendNotificationsToStub: sinon.SinonStub;
  let getChatRefStub: sinon.SinonStub;
  let getMeetingStub: sinon.SinonStub;

  beforeEach(() => {
    sendNotificationsToStub = sinon.stub(
      expoPushNotifications,
      "sendNotificationsTo"
    );
    getChatRefStub = sinon.stub(chats, "getChatRef");
    getMeetingStub = sinon.stub(meetings, "getMeeting");
  });
  afterEach(() => {
    sendNotificationsToStub.restore();
    getChatRefStub.restore();
    getMeetingStub.restore();
  });

  it("sends notification to all but sender", async () => {
    getChatRefStub.returns(
      fakeDocRef({
        members: ["user1", "user2"],
        membersMetadata: {
          user1: { name: 'me' },
          user2: { name: 'xavier' },
        }
      })
    );
    getMeetingStub.resolves(
      fakeDoc({
        title: "Hey",
      })
    );
    const messageSnapshot = fakeSnapshot({
      message: "Hello",
      from: "user1",
      date: new firestore.Timestamp(2, 3),
    });

    await wrappedOnMessageSentNotifyRecipients(messageSnapshot, {
      params: {
        chatId: "chat-123",
        messageId: "message-123",
      },
    });

    sinon.assert.calledOnceWithExactly(sendNotificationsToStub, ["user2"], {
      title: "Hey",
      body: "me: Hello",
      data: {
        event: "newMessage",
        content: {
          id: "message-123",
          chatId: "chat-123",
          from: "user1",
          date: 2000,
          message: "Hello",
        },
      },
    });
  });
});
