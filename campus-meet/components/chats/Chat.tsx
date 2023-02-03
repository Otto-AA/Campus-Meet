import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect } from "react";
import { View, Keyboard } from "react-native";
import { Title, TouchableRipple } from "react-native-paper";

import { getChat, markAsNewestReadMessage } from "../../api/chats/chatApi";
import { sendMessage } from "../../api/chats/messagesApi";
import { getProfilebyUserId } from "../../api/profiles/profileAPI";
import MessageInput from "../../components/chats/MessageInput";
import Messages from "../../components/chats/Messages";
import { useChatMetadata } from "../../hooks/chats/useChatMetadata";
import { useChatsSync } from "../../hooks/chats/useChatsSync";
import { useStoredMessages } from "../../hooks/chats/useStoredMessages";
import { useAuthentication } from "../../hooks/useAuthentication";
import { maxBy } from "../../utils/filter/max";
import { oldestFirst } from "../../utils/sorter/sortByDate";
import MessagesContainer from "./MessagesContainer";

interface IChatProps {
  chatId: string;
}

export default function Chat({ chatId }: IChatProps) {
  const { user } = useAuthentication();
  const navigation = useNavigation();
  const { messages } = useStoredMessages(chatId);
  const { chatMetadata } = useChatMetadata(chatId);
  const { syncChats } = useChatsSync();

  const finishedLoading = !!(messages && chatMetadata);

  const newestMessageTime = messages?.length
    ? maxBy(messages, (message) => message.date.getTime()).date.getTime()
    : undefined;

  const markAsReadAndSync = useCallback(
    async (time: number) => {
      await markAsNewestReadMessage(chatId, new Date(time));
      await syncChats();
    },
    [chatId, syncChats]
  );

  const onTitleClick = useCallback(async () => {
    if (chatMetadata!.private) {
      const otherUser = chatMetadata!.members.filter(
        (member) => member !== user?.uid
      )[0];
      const profile = await getProfilebyUserId(otherUser);
      navigation.navigate("ProfileDetails", { profile });
    } else {
      const chat = await getChat(chatId);
      const meetingId = chat.meeting;
      navigation.navigate("MeetingDetails", { id: meetingId! });
    }
  }, [chatId, chatMetadata, navigation, user?.uid]);

  useEffect(() => {
    if (newestMessageTime) {
      markAsReadAndSync(newestMessageTime);
    }
  }, [newestMessageTime, markAsReadAndSync]);

  useEffect(() => {
    const title = chatMetadata?.title ?? "";
    navigation.setOptions({
      headerTitle: () => (
        <TouchableRipple onPress={onTitleClick}>
          <Title style={{ color: "white", fontWeight: "bold" }}>{title}</Title>
        </TouchableRipple>
      ),
    });
  }, [chatMetadata?.title, navigation, onTitleClick]);

  const send = async (message: string) => {
    Keyboard.dismiss();
    await sendMessage(chatId, message);
    syncChats();
  };

  if (messages) messages.sort(oldestFirst);

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <MessagesContainer>
        {finishedLoading && (
          <Messages
            messages={messages}
            profilesMetadata={chatMetadata?.membersMetadata}
          />
        )}
      </MessagesContainer>
      <View>
        <MessageInput onSend={send} />
      </View>
    </View>
  );
}
