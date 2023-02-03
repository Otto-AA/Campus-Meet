import { device, element, by, expect } from "detox";

import { seedsProfiles } from "../../seeds/profiles.seeds";
import { seed } from "../../seeds/utils/seed";
import { testLoginAs, testLoginWithoutProfileAs } from "../utils/signIn";

describe("Profiles", () => {
  beforeEach(async () => {
    await device.launchApp({ delete: true });
    // tell detox not to wait until the firestore long polling to finish
    await device.setURLBlacklist([
      ".*/google.firestore.v1.Firestore/Listen/.*",
      ".*/google.firestore.v1.Firestore/Write/.*",
    ]);
    await seed(seedsProfiles);
  });

  describe("without profile", () => {
    beforeEach(async () => {
      await testLoginWithoutProfileAs("no-profile@mail.com");
    });

    it("shows create profile screen after sign in", async () => {
      await expect(element(by.id("screen-edit-profile"))).toBeVisible();
    });

    it("can create profile", async () => {
      await element(by.id("input-name")).typeText("Jacobo\n");
      await element(by.id("input-study")).typeText("Computer Science\n");
      await element(by.id("input-languages")).typeText("EN\n");
      await element(by.id("input-about")).typeText(
        "I love to play ping pong\n"
      );
      await element(by.id("create-profile")).tap();

      await expect(element(by.id("screen-discover-meetings"))).toBeVisible();
    });
  });

  describe("with profile", () => {
    beforeEach(async () => {
      await testLoginAs("with-profile@mail.com");
    });

    it("shows discover meetings screen after sign in", async () => {
      await expect(element(by.id("screen-discover-meetings"))).toBeVisible();
    });
  });
});
