import { StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { Props as TextProps } from "react-native-paper/lib/typescript/components/Typography/Text";

export type CapitalizedTextProps = Partial<TextProps>;

export function CapitalizedText({
  children,
  style,
  ...props
}: CapitalizedTextProps) {
  return <Text style={[style, styles.text]}>{children}</Text>;
}

const styles = StyleSheet.create({
  text: {
    textTransform: "capitalize",
  },
});
