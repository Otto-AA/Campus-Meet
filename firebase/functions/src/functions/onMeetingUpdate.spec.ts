import * as firebaseFunctionsTest from "firebase-functions-test";
import * as sinon from "sinon";
import {onMeetingJoinSendNotifications} from "./onMeetingUpdate";
import * as expoPushNotifications from "../utils/expoPushNotifications";
import * as profileUtils from '../utils/profiles'

import {expect} from "expect";

const test = firebaseFunctionsTest();
const wrappedSendNotification = test.wrap(onMeetingJoinSendNotifications);

const fakeMeetingTitle = "Wanna have lunch?";

const getFakeChange = (membersBefore: string[], membersAfter: string[]) => {
  const before = test.firestore.makeDocumentSnapshot(
      {members: membersBefore, title: fakeMeetingTitle},
      "document/meetingId"
  );
  const after = test.firestore.makeDocumentSnapshot(
      {members: membersAfter, title: fakeMeetingTitle},
      "document/meetingId"
  );
  return test.makeChange(before, after);
};

const getFakeProfile = (name: string) => test.firestore.makeDocumentSnapshot({
  name,
}, "document/path")

describe("onMeetingJoin", () => {
  let sendNotificationsToStub: sinon.SinonStub;
  let getProfilesByUserIdsStub: sinon.SinonStub

  beforeEach(() => {
    sendNotificationsToStub = sinon.stub(
        expoPushNotifications,
        "sendNotificationsTo"
    );
    getProfilesByUserIdsStub = sinon.stub(
      profileUtils,
      "getProfilesByUserIds",
    );
  });
  afterEach(() => {
    sendNotificationsToStub.restore();
    getProfilesByUserIdsStub.restore();
  });

  it("sends notification if new member joined", async () => {
    getProfilesByUserIdsStub.returns([getFakeProfile('Frank')])
    const change = getFakeChange(["id1", "id2"], ["id1", "id2", "id3"]);

    await wrappedSendNotification(change);

    sinon.assert.calledOnceWithExactly(
        sendNotificationsToStub,
        ["id1", "id2"],
        {
          title:fakeMeetingTitle,
          body: `Frank joined your meeting`,
          data: {
            event: 'newMeetingMember',
            content: {
              meetingId: 'meetingId',
              newMemberUid: 'id3',
            }
          }
        }
    );
  });

  it("does nothing if somebody left", async () => {
    const change = getFakeChange(["id1", "id2", "id3"], ["id1", "id2"]);

    await wrappedSendNotification(change);

    expect(sendNotificationsToStub.called).toBe(false);
  });
});
