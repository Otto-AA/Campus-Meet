import { View } from "react-native";

import MessageInput from "./MessageInput";
import MessagesContainer from "./MessagesContainer";

interface IEmptyPrivateChatProps {
  onSend: (message: string) => Promise<void>;
}

export default function EmptyChat({ onSend }: IEmptyPrivateChatProps) {
  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <MessagesContainer />
      <View>
        <MessageInput onSend={onSend} />
      </View>
    </View>
  );
}
