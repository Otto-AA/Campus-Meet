import { DateTime } from "luxon";
import { StyleProp, TextStyle } from "react-native";

import { isToday } from "../../utils/time/datetime";
import RelativeDate from "./RelativeDate";
import Time from "./Time";

interface IRelativeDateOrTimeProps {
  datetime: DateTime;
  style?: StyleProp<TextStyle>;
}

export default function RelativeDateOrTime({
  datetime,
  style,
}: IRelativeDateOrTimeProps) {
  return (
    <>
      {isToday(datetime) ? (
        <Time datetime={datetime} style={style} />
      ) : (
        <RelativeDate datetime={datetime} style={style} />
      )}
    </>
  );
}
