import { configureFonts } from "react-native-paper";

export const fontConfig: Parameters<typeof configureFonts>[0] = {
  default: {
    regular: {
      fontFamily: "Comfortaa-Regular",
      fontWeight: "normal",
    },
    medium: {
      fontFamily: "Comfortaa-Medium",
      fontWeight: "normal",
    },
    light: {
      fontFamily: "Comfortaa-Light",
      fontWeight: "normal",
    },
    thin: {
      fontFamily: "Comfortaa-Light",
      fontWeight: "normal",
    },
  },
};
