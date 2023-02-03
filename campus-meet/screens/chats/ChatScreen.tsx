import Chat from "../../components/chats/Chat";
import { RootStackScreenProps } from "../../types";

export default function ChatScreen({
  route: {
    params: { chatId },
  },
}: RootStackScreenProps<"Chat">) {
  return <Chat chatId={chatId} />;
}
