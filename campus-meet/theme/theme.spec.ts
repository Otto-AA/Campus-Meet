import { configureFonts, DarkTheme, DefaultTheme } from "react-native-paper";

import { fontConfig } from "./font";
import { customLightTheme, customDarkTheme } from "./theme";


describe("Custom Light Theme", () => {
  it("should have the correct colors", () => {
    expect(customLightTheme.colors).toEqual({
      ...DefaultTheme.colors,
      primary: "#00BFA5",
      statusbar: "#00796B",
      accent: "#5C6BC0",
      surface: "white",
      bell: "#f9c34b",
      names: "#37474F",
    });
  });

  it("should have the correct fonts configuration", () => {
    expect(customLightTheme.fonts).toEqual(configureFonts(fontConfig));
  });
});

describe("Custom Dark Theme", () => {
  it("should have the correct colors", () => {
    expect(customDarkTheme.colors).toEqual({
      ...DarkTheme.colors,
      primary: "#62374E",
      accent: "#007880",
      statusbar: "#33313B",
      bell: "#f9c34b",
      names: "#37474F",
    });
  });

  it("should have the correct font configuration", () => {
    expect(customDarkTheme.fonts).toEqual(configureFonts(fontConfig));
  });
});