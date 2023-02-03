import { useEffect } from "react";
import { Keyboard, View } from "react-native";

import { createPrivateChat } from "../../api/chats/chatApi";
import { sendMessage } from "../../api/chats/messagesApi";
import Chat from "../../components/chats/Chat";
import EmptyChat from "../../components/chats/EmptyChat";
import { useChatsSync } from "../../hooks/chats/useChatsSync";
import { usePrivateChatId } from "../../hooks/chats/usePrivateChatId";
import { RootStackScreenProps } from "../../types";

/**
 * Displays normal chat screen when the chat already exists, else empty chat screen
 * determines if chat exists by querying for a private chat
 */
export default function PrivateChatScreen({
  navigation,
  route: {
    params: { profile },
  },
}: RootStackScreenProps<"PrivateChat">) {
  const { chatId } = usePrivateChatId(profile.creator);
  const { syncChats } = useChatsSync();

  useEffect(() => {
    navigation.setOptions({
      title: profile.name,
    });
  }, [navigation, profile.name]);

  const onSend = async (message: string) => {
    Keyboard.dismiss();
    const chatId = await createPrivateChat(profile.creator);
    await sendMessage(chatId, message);
    await syncChats();
  };

  if (chatId === undefined) return <View testID="private-chat-loading" />;
  if (chatId === null) return <EmptyChat onSend={onSend} />;
  return <Chat chatId={chatId} />;
}
