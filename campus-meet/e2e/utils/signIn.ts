import { element, by, waitFor } from "detox";

export const testLoginAs = async (email: string) => {
  const emailInput = element(by.id("email-input"));

  await emailInput.replaceText(email);
  await element(by.id("signInButton")).tap();

  // verify that the login was successful
  await waitFor(element(by.id("screen-discover-meetings")))
    .toBeVisible()
    .withTimeout(5000);
};

export const testLoginWithoutProfileAs = async (email: string) => {
  const emailInput = element(by.id("email-input"));

  await emailInput.replaceText(email);
  await element(by.id("signInButton")).tap();
};
