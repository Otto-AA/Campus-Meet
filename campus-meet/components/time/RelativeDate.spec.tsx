import { render } from "@testing-library/react-native";
import { DateTime } from "luxon";
import React from "react";

import RelativeDate, { RelativeDateProps } from "./RelativeDate";

describe("RelativeDate", () => {
  it("should display the date format if the days difference is > 1", () => {
    const datetime = DateTime.fromObject({
      year: 2020,
      month: 12,
      day: 31,
    });
    const style = {};
    const props: RelativeDateProps = { datetime, style };
    const { getByText } = render(<RelativeDate {...props} />);
    expect(getByText("31/12/20")).toBeDefined();
  });
});
