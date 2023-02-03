import { useNavigation } from "@react-navigation/native";
import { DateTime } from "luxon";
import { View } from "react-native";
import { Avatar, Badge, Divider, List, useTheme } from "react-native-paper";

import { IChatPreview } from "../../contexts/ChatsSyncingContext";
import RelativeDateOrTime from "../time/RelativeDateOrTime";

interface ChatsProps {
  chats: IChatPreview[];
}

export default function ChatPreviews({ chats }: ChatsProps) {
  const navigation = useNavigation();
  const theme = useTheme();

  const chatElements = chats.map((chatPreview, i) => {
    return (
      <View key={chatPreview.chatId}>
        <List.Item
          testID={`chat-preview-${i}`}
          title={chatPreview.title}
          description={`${chatPreview.lastMessage?.from.name}: ${chatPreview.lastMessage?.message}`}
          descriptionNumberOfLines={1}
          onPress={() =>
            navigation.navigate("Chat", { chatId: chatPreview.chatId })
          }
          titleStyle={{
            paddingLeft: 8,
          }}
          descriptionStyle={{
            paddingLeft: 8,
          }}
          left={() => (
            <Avatar.Text
              style={{ alignSelf: "center" }}
              size={36}
              label={chatPreview.title
                .split(" ")
                .map((words) => words[0].toUpperCase())
                .join("")}
            />
          )}
          right={() => (
            <View>
              <RelativeDateOrTime
                datetime={DateTime.fromJSDate(chatPreview.lastMessage?.date)}
              />
              {chatPreview.unreadCount > 0 && (
                <Badge style={{ marginTop: 5 }} size={25}>
                  {chatPreview.unreadCount}
                </Badge>
              )}
            </View>
          )}
        />
        <Divider
          style={{
            height: 1,
            backgroundColor: theme.colors.disabled,
          }}
        />
      </View>
    );
  });
  return <>{chatElements}</>;
}
