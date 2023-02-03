import { DateTime } from "luxon";
import { StyleSheet, View } from "react-native";

import { IDated } from "../../utils/sorter/sortByDate";
import { daysDiff } from "../../utils/time/datetime";
import RelativeDate from "./RelativeDate";

interface IListWithDateDividerProps<T extends IDated> {
  elements: T[];
  renderElement: (element: T, i: number) => JSX.Element;
  renderDivider?: (date: Date, i: number) => JSX.Element;
}

const renderDividerDefault = (date: Date, i: number) => {
  return (
    <View
      style={styles.dateDivider}
      key={`divider-${date.valueOf()}`}
      testID={`date-divider-${i}`}
    >
      <RelativeDate datetime={DateTime.fromJSDate(date)} />
    </View>
  );
};

export default function ListWithDateDivider<T extends IDated>({
  elements,
  renderDivider = renderDividerDefault,
  renderElement,
}: IListWithDateDividerProps<T>) {
  const list: JSX.Element[] = [];
  let currentDay = DateTime.now();

  elements.forEach((el, i) => {
    const elDay = DateTime.fromJSDate(el.date);
    if (daysDiff(currentDay, elDay) !== 0) {
      currentDay = elDay;
      list.push(renderDivider(currentDay.toJSDate(), i));
    }
    list.push(renderElement(el, i));
  });

  return <>{list}</>;
}

const styles = StyleSheet.create({
  dateDivider: {
    flexDirection: "column",
    alignItems: "center",
  },

  dateDividerTime: {
    flex: 1,
  },
});
