// import * as firebaseFunctionsTest from "firebase-functions-test";
import * as sinon from "sinon";
import * as ExpoPushNotifications from "./expoPushNotifications";
import {expect} from "expect";
import {
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  Firestore,
} from "firebase-admin/firestore";
import * as LibraryGetters from "./libraryGetters";

const {sendNotificationsTo, sendPushNotifications} = ExpoPushNotifications;

describe("onMeetingJoin", () => {
  let isExpoPushTokenStub: sinon.SinonStub;
  let expoStub: sinon.SinonStub;
  let adminFirestoreSpy: sinon.SinonSpy;
  let adminFirestoreStub: sinon.SinonStub;
  let adminStub: sinon.SinonStubbedMember<typeof LibraryGetters["getAdmin"]>;
  let dbStub: sinon.SinonStubbedMember<typeof LibraryGetters["getDb"]>;
  let dbDocFake: sinon.SinonStubbedMember<Firestore["doc"]>;
  let sendPushNotificationsStub: sinon.SinonStubbedMember<
    typeof ExpoPushNotifications["sendPushNotifications"]
  >;

  beforeEach(() => {
    adminStub = sinon.stub(LibraryGetters, "getAdmin");
    dbStub = sinon.stub(LibraryGetters, "getDb");
    dbDocFake = sinon.stub();
    dbStub.returns({doc: dbDocFake} as any as Firestore);
    expoStub = sinon.stub(LibraryGetters, "getExpo");
    isExpoPushTokenStub = sinon.stub();
    expoStub.returns({isExpoPushToken: isExpoPushTokenStub});
    sinon.stub(LibraryGetters, "getExpoInstance");
    sendPushNotificationsStub = sinon.stub(
        ExpoPushNotifications,
        "sendPushNotifications"
    );
  });
  afterEach(() => {
    sendPushNotificationsStub.reset();
  });

  it("sendNotificationsTo calls sendPushNotifications with push tokens", async () => {
    dbDocFake
        .withArgs("pushtokens/uid1")
        .returns({
          get: () =>
            Promise.resolve({
              data: () => {
                return {token: "token-uid1"};
              },
            }),
        } as any as DocumentReference<DocumentData>)
        .withArgs("pushtokens/uid2")
        .returns({
          get: () =>
            Promise.resolve({
              data: () => {
                return {token: "token-uid2"};
              },
            }),
        } as any as DocumentReference<DocumentData>);
    isExpoPushTokenStub.returns(true);

    await sendNotificationsTo(["uid1", "uid2"], {body: "Hey"});

    sinon.assert.calledOnce(sendPushNotificationsStub);
    sinon.assert.calledWithExactly(sendPushNotificationsStub.firstCall, [
      {
        to: "token-uid1",
        body: "Hey",
      },
      {
        to: "token-uid2",
        body: "Hey",
      },
    ]);
  });
});
