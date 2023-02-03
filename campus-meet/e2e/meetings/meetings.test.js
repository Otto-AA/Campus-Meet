import { device, element, by, expect, waitFor } from "detox";

import { seedsMeeting } from "../../seeds/meeting.seeds";
import { seed } from "../../seeds/utils/seed";
import { testLoginAs } from "../utils/signIn";

describe("Meeting", () => {
  beforeEach(async () => {
    await device.launchApp({ delete: true });
    // tell detox not to wait until the firestore long polling to finish
    await device.setURLBlacklist([
      ".*/google.firestore.v1.Firestore/Listen/.*",
      ".*/google.firestore.v1.Firestore/Write/.*",
    ]);
    await seed(seedsMeeting);
    await testLoginAs("test-meeting@mail.com");
  });

  jest.retryTimes(3);
  it("shows only close meetings in discover meetings", async () => {
    await waitFor(element(by.text("Lunch at Leo")))
      .toBeVisible()
      .withTimeout(5000);

    await expect(element(by.text("Far far away"))).not.toBeVisible();
  });

  jest.retryTimes(3);
  it("can create new meeting", async () => {
    await element(by.id("new-meeting-button")).tap();

    await waitFor(element(by.id("input-title")))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id("input-title")).typeText("Testing Fun\n");
    await element(by.id("create")).tap();

    await expect(element(by.id("new-meeting-button"))).toBeVisible();
    await expect(element(by.text("Testing Fun"))).toBeVisible();
  });
});
