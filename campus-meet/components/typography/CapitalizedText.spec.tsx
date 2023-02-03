import { render, screen } from "@testing-library/react-native";

import { CapitalizedText } from "./CapitalizedText";

describe("UppercasedText", () => {
  it("renders the text with uppercase style", () => {
    render(<CapitalizedText>hello</CapitalizedText>);

    expect(screen.getByText("hello")).toHaveStyle({
      textTransform: "capitalize",
    });
  });
});
