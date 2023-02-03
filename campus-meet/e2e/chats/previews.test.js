import { device, element, by, expect, waitFor } from "detox";

import { seedsChatPreview } from "../../seeds/preview.seeds";
import { getChatByTitle } from "../../seeds/utils/chats";
import { seed } from "../../seeds/utils/seed";
import { testLoginAs } from "../utils/signIn";

describe("ChatPreview", () => {
  beforeEach(async () => {
    // copmlete relaunching to reset database
    // await device.reloadReactNative();
    await device.launchApp({ delete: true });
    await device.setURLBlacklist([
      ".*/google.firestore.v1.Firestore/Listen/.*",
      ".*/google.firestore.v1.Firestore/Write/.*",
    ]);
    await seed(seedsChatPreview);
    await testLoginAs("test-chat@mail.com");
    await element(by.id("tab-chats")).tap();
    await waitFor(element(by.id("screen-chat-previews")))
      .toBeVisible()
      .withTimeout(5000);
  });

  it("shows seeded chat preview with last message and unread count", async () => {
    await waitFor(element(by.text(`Fernando: Do you have the rackets?`)))
      .toBeVisible()
      .withTimeout(5000);
    await waitFor(element(by.text("Ping Pong")))
      .toBeVisible()
      .withTimeout(5000);
    await expect(element(by.text("5"))).toBeVisible();
  });

  it("should only show chats where one is member of", async () => {
    // 0 is the one tested above
    await waitFor(element(by.id("chat-preview-0")))
      .toBeVisible()
      .withTimeout(5000);

    // there should not be more than one according to the seeds
    await expect(element(by.id("chat-preview-1"))).not.toExist();
  });

  // it does not seem possible to test notifications with detox
  // see https://forums.expo.dev/t/how-do-we-test-expo-push-notifications-with-detox/68957
  it.skip("updates existing preview a new message is received", async () => {
    await waitFor(element(by.id("chat-preview-0")))
      .toBeVisible()
      .withTimeout(5000);

    const { id } = await getChatByTitle("Ping Pong");

    const notification = {
      payload: {
        event: "newMessage",
        content: {
          id: "new-message-id",
          chatId: id,
          from: "test-chat@mail.com",
          message: "ping pong ping pong",
          date: Date.now(),
        },
      },
    };
    await device.sendUserNotification(notification);

    await waitFor(element(by.text(`Jacobo: ping pong ping pong`)))
      .toBeVisible()
      .withTimeout(5000);
  });
});
