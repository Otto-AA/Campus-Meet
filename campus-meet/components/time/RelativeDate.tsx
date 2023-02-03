import { DateTime } from "luxon";
import { StyleProp, TextStyle } from "react-native";

import { daysDiff } from "../../utils/time/datetime";
import { CapitalizedText } from "../typography/CapitalizedText";

export type RelativeDateProps = {
  datetime: DateTime;
  style?: StyleProp<TextStyle>;
};

export default function RelativeDate({ datetime, style }: RelativeDateProps) {
  const absDaysDiff = Math.abs(daysDiff(DateTime.now(), datetime));
  return (
    <CapitalizedText style={style}>
      {absDaysDiff <= 1
        ? datetime.setLocale("en-Gb").toRelativeCalendar()
        : datetime.toFormat("dd/LL/yy")}
    </CapitalizedText>
  );
}
