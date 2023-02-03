import { useState } from "react";
import { TextInput } from "react-native-paper";

interface IMessageInputProps {
  onSend: (message: string) => Promise<void>;
}

export default function MessageInput({ onSend }: IMessageInputProps) {
  const [message, setMessage] = useState("");

  const send = async () => {
    if (message) {
      await onSend(message);
      setMessage("");
    }
  };

  return (
    <TextInput
      label="Message"
      testID="message-input"
      value={message}
      onChangeText={setMessage}
      right={<TextInput.Icon icon="send" onPress={send} testID="send" />}
    />
  );
}
