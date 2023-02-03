import { DateTime } from "luxon";
import { StyleProp, TextStyle } from "react-native";
import { Text } from "react-native-paper";

import RelativeDate from "./RelativeDate";
import Time from "./Time";

export type IRelativeDateAndTimeProps = {
  datetime: DateTime;
  style?: StyleProp<TextStyle>;
};

export default function RelativeDateAndTime({
  datetime,
  style,
}: IRelativeDateAndTimeProps) {
  return (
    <Text style={style}>
      <RelativeDate datetime={datetime} />
      <Text>, </Text>
      <Time datetime={datetime} />
    </Text>
  );
}
