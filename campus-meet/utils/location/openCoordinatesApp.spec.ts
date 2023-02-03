import * as Linking from "expo-linking";
import { Platform } from "react-native";
import { openCoordinatesInMap } from "./openCoordinatesApp";


jest.mock("expo-linking", () => ({
  openURL: jest.fn(),
}));

describe("openCoordinatesInMap", () => {
  it("opens a map with the correct coordinates and label", () => {
    const coordinates = { latitude: 37.4219999, longitude: -122.0840575 };
    const label = "Test Label";
    openCoordinatesInMap(coordinates, label);

    expect(Linking.openURL).toHaveBeenCalledWith(
      "maps:0,0?q=Test Label@37.4219999,-122.0840575"
    );
  });

  it("opens a map with the correct coordinates without label", () => {
    const coordinates = { latitude: 37.4219999, longitude: -122.0840575 };
    openCoordinatesInMap(coordinates);

    expect(Linking.openURL).toHaveBeenCalledWith(
      "maps:0,0?q=Open in map@37.4219999,-122.0840575"
    );
  });

  
});
