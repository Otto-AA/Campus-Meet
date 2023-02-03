import { configureFonts, DarkTheme, DefaultTheme } from "react-native-paper";

import { fontConfig } from "./font";

declare global {
  namespace ReactNativePaper {
    interface ThemeColors {
      statusbar: string;
      bell: string;
      names: string;
    }
  }
}

export const customLightTheme: ReactNativePaper.Theme = {
  ...DefaultTheme,
  fonts: configureFonts(fontConfig),
  colors: {
    ...DefaultTheme.colors,
    primary: "#00BFA5",
    statusbar: "#00796B",
    accent: "#5C6BC0",
    surface: "white",
    bell: "#f9c34b",
    names: "#37474F",
  },
};

export const customDarkTheme: ReactNativePaper.Theme = {
  ...DarkTheme,
  fonts: configureFonts(fontConfig),
  colors: {
    ...DarkTheme.colors,
    primary: "#62374E",
    accent: "#007880",
    statusbar: "#33313B",
    bell: "#f9c34b",
    names: "#37474F",
  },
};
