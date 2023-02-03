import { render } from "@testing-library/react-native";
import { DateTime } from "luxon";
import React from "react";

import RelativeDate, { RelativeDateProps } from "./RelativeDate";

describe("RelativeDate", () => {
  const datetime = DateTime.fromObject({
    year: 2021,
    month: 1,
    day: 1,
  });
  const style = {};
  const props: RelativeDateProps = { datetime, style };

  it("should display the date format if the days difference is > 1", () => {
    const datetime = DateTime.fromObject({
      year: 2020,
      month: 12,
      day: 31,
    });
    const props: RelativeDateProps = { datetime, style };
    const { getByText } = render(<RelativeDate {...props} />);
    expect(getByText("31/12/20")).toBeDefined();
  });
});
