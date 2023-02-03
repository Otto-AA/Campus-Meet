import { configureFonts } from "react-native-paper";

import { fontConfig } from "./font";

describe("fontConfig", () => {
  it("has the correct structure and values", () => {
    expect(fontConfig).toEqual({
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
    });
  });

  it("only contains expected properties and values", () => {
    expect(Object.keys(fontConfig)).toEqual(["default"]);
    expect(Object.keys(fontConfig.default)).toEqual([
      "regular",
      "medium",
      "light",
      "thin",
    ]);

    for (const fontType of Object.values(fontConfig.default)) {
      expect(Object.keys(fontType)).toEqual(["fontFamily", "fontWeight"]);
      expect(fontType.fontWeight).toBe("normal");
    }
  });
});