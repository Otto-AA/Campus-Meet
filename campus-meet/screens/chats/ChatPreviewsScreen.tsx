import { useEffect, useState } from "react";
import { ScrollView, RefreshControl, View } from "react-native";
import { Text } from "react-native-paper";

import ChatPreviews from "../../components/chats/ChatPreviews";
import PaddedView from "../../components/styled/PaddedView";
import { useChatsSync } from "../../hooks/chats/useChatsSync";
import { useSortedChatPreviews } from "../../hooks/chats/useSortedChatPreviews";

export default function ChatPreviewsScreen() {
  const { chatPreviews } = useSortedChatPreviews();
  const [refreshing, setRefreshing] = useState(false);
  const { syncChats } = useChatsSync();

  useEffect(() => {
    syncChats();
  }, [syncChats]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await syncChats();
    } catch (err) {
      alert(`Could not synchronize chats: ${(err as Error).message}`);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <PaddedView testID="padded-view">
      <View testID="screen-chat-previews" style={{ flex: 1 }}>
        <ScrollView
          testID="screen-chat-previews1"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {chatPreviews.length > 0 ? (
            <ChatPreviews chats={chatPreviews} />
          ) : (
            <Text>Start a chat in one of your meetings!</Text>
          )}
        </ScrollView>
      </View>
    </PaddedView>
  );
}
