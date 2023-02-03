import { useNavigation } from "@react-navigation/native";
import { DateTime } from "luxon";
import { TouchableWithoutFeedback, View } from "react-native";
import { Avatar, List, Text, useTheme } from "react-native-paper";

import { IMessage } from "../../api/chats/messagesApi";
import {
  getProfilebyUserId,
  IProfileMetadata,
} from "../../api/profiles/profileAPI";
import { useAuthentication } from "../../hooks/useAuthentication";
import ListWithDateDivider from "../time/ListWithDateDivider";
import RelativeDate from "../time/RelativeDate";
import Time from "../time/Time";

interface MessagesProps {
  messages: IMessage[];
  profilesMetadata: Record<string, IProfileMetadata>;
}

const colors = ["red", "limegreen", "#e28743", "#2596be", "#76b5c5", "#873e23"];

const stringToColor = function (str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[hash % colors.length];
};

export default function Messages({
  messages,
  profilesMetadata,
}: MessagesProps) {
  const { user } = useAuthentication();
  const theme = useTheme();
  const navigation = useNavigation();
  const colorBubble = theme.colors.surface;
  const colorTime = theme.colors.placeholder;
  const colorMessage = theme.colors.text;
  const bubbleBorderRadius = 15;
  const bubbleMarginSide = 50;
  const bubbleMarginFixReverse = 8;
  const bubblePadding = 8;

  const openProfile = async (userId: string) => {
    const profile = await getProfilebyUserId(userId);
    navigation.navigate("ProfileDetails", { profile });
  };

  const renderMessage = (message: IMessage, i: number) => {
    const senderMetadata: IProfileMetadata | undefined =
      profilesMetadata[message.from];
    const isMe = message.from === user?.uid;
    const reverse = isMe;
    const timeElement = (
      <Time
        style={{
          color: colorTime,
          fontSize: 12,
        }}
        datetime={DateTime.fromJSDate(message.date)}
      />
    );
    const avatar = (
      <TouchableWithoutFeedback onPress={() => openProfile(message.from)}>
        <Avatar.Image
          size={30}
          source={{ uri: senderMetadata?.imageUrl }}
          style={{
            alignSelf: "flex-end",
            marginBottom: 6,
          }}
        />
      </TouchableWithoutFeedback>
    );

    return (
      <List.Item
        key={message.id}
        testID={`message-${i}`}
        title={({ fontSize }) => (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-end",
              paddingTop: bubblePadding,
              paddingLeft: bubblePadding,
              paddingRight: bubblePadding,
              paddingBottom: bubblePadding / 2,
              borderTopLeftRadius: bubbleBorderRadius,
              borderTopRightRadius: bubbleBorderRadius,
              borderTopWidth: 1,
              borderLeftWidth: 1,
              borderRightWidth: 1,
              borderColor: theme.colors.accent,
              backgroundColor: colorBubble,
              marginRight: reverse ? bubbleMarginFixReverse : bubbleMarginSide,
              marginLeft: reverse ? bubbleMarginSide : 0,
            }}
          >
            <Text
              testID={`from-${i}`}
              style={{
                fontSize,
                color: isMe
                  ? theme.colors.onSurface
                  : stringToColor(message.from),
              }}
            >
              {isMe ? "You" : senderMetadata?.name ?? ""}
            </Text>
            {timeElement}
          </View>
        )}
        description={message.message}
        descriptionStyle={{
          paddingTop: bubblePadding / 2,
          paddingLeft: bubblePadding,
          paddingBottom: bubblePadding,
          borderBottomLeftRadius: reverse ? bubbleBorderRadius : 0,
          borderBottomRightRadius: reverse ? 0 : bubbleBorderRadius,
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderBottomWidth: 1,
          borderColor: theme.colors.accent,
          backgroundColor: colorBubble,
          marginRight: reverse ? bubbleMarginFixReverse : bubbleMarginSide,
          marginLeft: reverse ? bubbleMarginSide : 0,
          color: colorMessage,
        }}
        descriptionNumberOfLines={1000}
        right={() => (reverse ? avatar : <></>)}
        left={() => (reverse ? <></> : avatar)}
      />
    );
  };

  return (
    <ListWithDateDivider
      elements={messages}
      renderElement={renderMessage}
      renderDivider={(date, i) => (
        <View
          key={`divider-${date.valueOf()}`}
          style={{
            alignSelf: "center",
            backgroundColor: theme.colors.surface,
            opacity: 0.7,
            paddingVertical: 3,
            paddingHorizontal: 10,
            borderRadius: 6,
          }}
        >
          <RelativeDate datetime={DateTime.fromJSDate(date)} />
        </View>
      )}
    />
  );
}
