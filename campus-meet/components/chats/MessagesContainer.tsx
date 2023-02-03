import { PropsWithChildren } from "react";
import { ImageBackground, ScrollView, View } from "react-native";
import { useTheme } from "react-native-paper";

const chatWallpapers = {
  light: require("../../assets/images/chat-wallpaper-light.png"),
  dark: require("../../assets/images/chat-wallpaper-dark.jpeg"),
};
export default function MessagesContainer({ children }: PropsWithChildren) {
  const theme = useTheme();
  return (
    <ImageBackground
      source={theme.dark ? chatWallpapers.dark : chatWallpapers.light}
      style={{
        flex: 1,
      }}
    >
      {/* double transform to start the scroll at the bottom initially */}
      <ScrollView style={{ transform: [{ scaleY: -1 }] }}>
        <View style={{ transform: [{ scaleY: -1 }], paddingTop: 10 }}>
          {children}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}
