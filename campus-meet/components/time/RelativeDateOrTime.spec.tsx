import { render, screen } from "@testing-library/react-native";
import { DateTime } from "luxon";

import RelativeDateOrTime from "./RelativeDateOrTime";

describe("RelativeDateOrTime", () => {
  it("displays time as hh:mm on the same day", () => {
    const dt = DateTime.fromObject({ hour: 14, minute: 58 });

    render(<RelativeDateOrTime datetime={dt} />);

    expect(screen.getByText("14:58")).toBeVisible();
  });
});
