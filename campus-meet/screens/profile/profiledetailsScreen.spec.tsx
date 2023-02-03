import { render } from "@testing-library/react-native";

import { IProfile } from "../../api/profiles/profileAPI";
import * as mockedAuth from "../../jest/auth.mock";
import { mockedNavigate } from "../../jest/useNavigation.mock";
import ProfiledetailsScreen from "./ProfiledetailsScreen";

// @ts-ignore
mockedAuth.default.getAuth.mockReturnValue({ uid: "test-user" });

const sampleProfile: IProfile = {
  id: "profile-1",
  creator: "user-1",
  name: "Test name",
  studies: "Test studies",
  languages: "Test languages",
  about: "Test about me",
  imageUrl: "http://testimage.com",
};

const routeForProfile = (profile: IProfile) => {
  return { params: { profile } } as any;
};

const originalWarn = console.warn.bind(console);
describe("ProfileDetailsScreen", () => {
  beforeAll(() => {
    console.warn = (msg) =>
      !msg.includes("useNativeDriver") && originalWarn(msg);
  });
  beforeEach(() => {
    mockedNavigate.mockReset();
  });

  it("should render correctly", () => {
    const { getByText, getByTestId } = render(
      <ProfiledetailsScreen
        navigation={null as any}
        route={routeForProfile(sampleProfile)}
      />
    );
    expect(getByText("Test name")).toBeTruthy();
    expect(getByText("Test studies")).toBeTruthy();
    expect(getByText("Test languages")).toBeTruthy();
    expect(getByText("Test about me")).toBeTruthy();
    expect(getByTestId("profile-image")).toBeTruthy();
  });

  it("should load the image correctly", async () => {
    const { getByTestId } = render(
      <ProfiledetailsScreen
        navigation={null as any}
        route={routeForProfile(sampleProfile)}
      />
    );

    // Wait for the image to be loaded
    await new Promise((resolve) => setTimeout(resolve, 500));
    const imageElement = getByTestId("profile-image");

    // Check that the image source is correct
    expect(imageElement.props.source.uri).toBe(sampleProfile.imageUrl);
  });

  it("should render quickly", () => {
    // Measure the time it takes to render the component
    const startTime = performance.now();
    render(
      <ProfiledetailsScreen
        navigation={null as any}
        route={routeForProfile(sampleProfile)}
      />
    );
    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Check that the rendering time is below a certain threshold
    expect(renderTime).toBeLessThan(100);
  });

  afterAll(() => {
    console.warn = originalWarn;
  });
});
