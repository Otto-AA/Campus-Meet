import { render } from "@testing-library/react-native";
import { DateTime } from "luxon";
import React from "react";

import Time from "./Time";

describe("Time", () => {
  it("applies custom styles", () => {
    const datetime = DateTime.fromObject({ hour: 18, minute: 30 });
    const customStyle = { color: "red" };
    const { getByTestId } = render(
      <Time datetime={datetime} style={customStyle} />
    );

    const text = getByTestId("time-text");
    expect(text).toHaveStyle({ color: "red" });
  });

  it("renders the time in the correct format", () => {
    const datetime = DateTime.fromObject({ hour: 18, minute: 30 });
    const { getByTestId } = render(<Time datetime={datetime} />);
    expect(getByTestId("time-text")).toHaveTextContent("18:30");
  });
});
