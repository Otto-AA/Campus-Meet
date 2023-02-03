import { useNavigation } from "@react-navigation/native";
import { useContext, useEffect } from "react";

import { NotificationEvent } from "../../contexts/NotificationEvent";
import { PushNotificationContext } from "../../contexts/NotificationReceiverContext";

export default function NotificationReceiver(props: React.PropsWithChildren) {
  const navigation = useNavigation();
  const notificationContext = useContext(PushNotificationContext);

  useEffect(() => {
    if (!notificationContext.listeningForNotifications) return;

    const meetingSubscription = notificationContext.subscribeToEvent(
      NotificationEvent.NewMeetingMember,
      (data) => {
        if (data.isBackground) {
          const content = data.content;
          navigation.navigate("MeetingDetails", { id: content.meetingId });
        }
      }
    );
    const messageSubscription = notificationContext.subscribeToEvent(
      NotificationEvent.NewMessage,
      (data) => {
        if (data.isBackground) {
          const content = data.content;
          navigation.navigate("Chat", { chatId: content.chatId });
        }
      }
    );

    return () => {
      meetingSubscription.remove();
      messageSubscription.remove();
    };
  }, [navigation, notificationContext]);

  return <>{props.children}</>;
}
