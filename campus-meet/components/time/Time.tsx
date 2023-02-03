import { DateTime } from "luxon";
import { StyleProp, TextStyle } from "react-native";
import { Text } from "react-native-paper";

interface ITimeProps {
  datetime: DateTime;
  style?: StyleProp<TextStyle>;
}

export default function Time({ datetime, style }: ITimeProps) {
  const text = datetime.toFormat("HH:mm");
  return (
    <Text style={style} testID="time-text">
      {text}
    </Text>
  );
}
