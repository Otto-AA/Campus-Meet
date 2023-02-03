import { render, screen } from "@testing-library/react-native";
import { DateTime } from "luxon";

import RelativeDateAndTime from "./RelativeDateAndTime";

describe("RelativeDateAndTime", () => {
  it("displays date as Today and time as hh:mm", () => {
    const dt = DateTime.fromObject({ hour: 14, minute: 58 });

    render(<RelativeDateAndTime datetime={dt} />);

    expect(screen.getByText("today, 14:58")).toBeVisible();
  });

  it("displays the exact date for multiple days ago", () => {
    const dt = DateTime.fromObject({
      year: 2022,
      month: 5,
      day: 25,
      hour: 12,
      minute: 0,
    });

    render(<RelativeDateAndTime datetime={dt} />);

    expect(screen.getByText("25/05/22, 12:00")).toBeVisible();
  });
});
