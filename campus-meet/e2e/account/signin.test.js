import { device, element, by, waitFor } from "detox";

describe("SignIn", () => {
  beforeAll(async () => {
    await device.launchApp();
    // tell detox not to wait for the firestore long polling to finish
    await device.setURLBlacklist([
      ".*/google.firestore.v1.Firestore/Listen/.*",
    ]);
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it("should show welcome screen", async () => {
    await waitFor(element(by.text("Get started now!")))
      .toBeVisible()
      .withTimeout(5000);
  });
});
