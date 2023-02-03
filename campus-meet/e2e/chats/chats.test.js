import { device, element, by, expect, waitFor } from "detox";

import { seedsChat } from "../../seeds/chat.seeds";
import { seed } from "../../seeds/utils/seed";
import { testLoginAs } from "../utils/signIn";

describe("Chat", () => {
  beforeEach(async () => {
    // copmlete relaunching to reset database
    // await device.reloadReactNative();
    await device.launchApp({ delete: true });
    await device.setURLBlacklist([
      ".*/google.firestore.v1.Firestore/Listen/.*",
      ".*/google.firestore.v1.Firestore/Write/.*",
    ]);
    await seed(seedsChat);
    await testLoginAs("study@mail.com");
    await element(by.id("tab-chats")).tap();
    await waitFor(element(by.id("screen-chat-previews")))
      .toBeVisible()
      .withTimeout(5000);
    await waitFor(element(by.id("chat-preview-0")))
      .toBeVisible()
      .withTimeout(5000);
  });

  it("displays seeded messages in chat", async () => {
    await element(by.id("chat-preview-0")).tap();
    await expect(element(by.text("Anyone out there?"))).toBeVisible();
    await expect(element(by.id("from-0"))).toHaveText("Fernando");
  });

  it("can send a new message", async () => {
    const message = "Hi from the test";
    await element(by.id("chat-preview-0")).tap();
    await element(by.id("message-input")).typeText(message);
    await element(by.id("send")).tap();

    // shows author and message
    await expect(element(by.id("from-1"))).toHaveText("You");
    await expect(element(by.text(message))).toBeVisible();
  });

  jest.retryTimes(2);
  it("can start a new private chat", async () => {
    const message = "hey there";

    // open any profile
    await element(by.id("tab-meetings")).tap();
    await waitFor(element(by.id("meeting-0")))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id("meeting-0")).tap();
    await element(by.id("member-0")).tap();

    // open private chat
    await element(by.id("open-private-chat")).tap();

    // send message
    await element(by.id("message-input")).typeText(message);
    await element(by.id("send")).tap();

    // verify message sent
    await expect(element(by.text(message))).toBeVisible();
  });
});
