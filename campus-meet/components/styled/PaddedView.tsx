import { View, ViewProps } from "react-native";

export default function PaddedView({ style, ...props }: ViewProps) {
  const padding = 15;
  return (
    <View
      testID="padded-view"
      style={[
        style,
        {
          paddingTop: padding,
          paddingHorizontal: padding,
          flex: 1,
        },
      ]}
      {...props}
    >
      {props.children}
    </View>
  );
}
