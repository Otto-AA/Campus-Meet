import { screen, render } from "@testing-library/react-native";
import { DateTime } from "luxon";
import { Text } from "react-native-paper";

import { IDated } from "../../utils/sorter/sortByDate";
import ListWithDateDivider from "./ListWithDateDivider";

const now = DateTime.now();

const toDated = (datetime: DateTime): IDated => ({ date: datetime.toJSDate() });

const renderElements = ({ date }: IDated) => (
  <Text key={date.valueOf()}>{date.valueOf()}</Text>
);

describe("ListWithDateDivider", () => {
  beforeAll(() => {
    jest.useFakeTimers({
      doNotFake: ["nextTick"],
      now: now.toJSDate(),
    });
  });

  it("renders no divider if everything is today", () => {
    const elements = [now, now.endOf("day")].map(toDated);

    render(
      <ListWithDateDivider elements={elements} renderElement={renderElements} />
    );

    expect(screen.queryByTestId("date-divider-0")).toBe(null);
  });

  afterAll(() => {
    jest.useRealTimers();
  });
});
