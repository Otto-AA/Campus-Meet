import * as Notifications from "expo-notifications";
import { useEffect, createContext, useCallback, useState } from "react";

import { useAuthentication } from "../hooks/useAuthentication";
import { registerForPushNotificationsAsync } from "../utils/permissions/pushNotification";
import {
  ICampusMeetNotification,
  isNotficationOfType,
  NotificationEvent,
} from "./NotificationEvent";

type SubscriptionCallbackAnyEvent = (notificationData: {
  [key: string]: unknown;
}) => unknown;

type SubscriptionCallback<E extends NotificationEvent> = (
  notification: ICampusMeetNotification<E>
) => unknown;

type Subscription = {
  remove(): void;
};

type PushNotificationContextValue =
  | { listeningForNotifications: false }
  | {
      listeningForNotifications: true;
      subscribeToAll(callback: SubscriptionCallbackAnyEvent): Subscription;
      subscribeToEvent<E extends NotificationEvent>(
        event: E,
        callback: SubscriptionCallback<E>
      ): Subscription;
    };

export const PushNotificationContext =
  createContext<PushNotificationContextValue>({
    listeningForNotifications: false,
  });

const arrayCopyWithoutElement = <T,>(array: T[], el: T) => {
  if (array.includes(el)) {
    const index = array.indexOf(el);
    return [...array.slice(0, index), ...array.slice(index + 1)];
  }
  return [...array];
};

const createSubscription = <T,>(
  array: T[],
  el: T,
  setNewArray: (arr: T[]) => void
) => {
  return {
    remove: () => setNewArray(arrayCopyWithoutElement(array, el)),
  };
};

export default function NotificationReceiverProvider(
  props: React.PropsWithChildren
) {
  const { user } = useAuthentication();
  const [subscriptionsAll, setSubscriptionsAll] = useState<
    SubscriptionCallbackAnyEvent[]
  >([]);
  const [subscriptionsEvents, setSubscriptionsEvents] = useState<{
    [k in NotificationEvent]?: SubscriptionCallback<k>[];
  }>({});

  const subscribeToAll = (callback: SubscriptionCallbackAnyEvent) => {
    subscriptionsAll.push(callback);
    return createSubscription(subscriptionsAll, callback, setSubscriptionsAll);
  };

  const subscribeToEvent = <E extends NotificationEvent>(
    event: E,
    callback: SubscriptionCallback<E>
  ) => {
    if (!subscriptionsEvents[event]) subscriptionsEvents[event] = [];
    subscriptionsEvents[event]!.push(callback);

    return createSubscription(subscriptionsEvents[event]!, callback, (arr) => {
      // @ts-ignore
      subscriptionsEvents[event] = arr;
      setSubscriptionsEvents(subscriptionsEvents);
    });
  };

  const handleNotification = useCallback(
    (notification: Notifications.Notification, isForeground = true) => {
      const data = notification.request.content.data;
      subscriptionsAll.forEach((callback) => {
        callback(data);
      });
      for (const [eventType, callbacks] of Object.entries(
        subscriptionsEvents
      )) {
        if (isNotficationOfType(data, eventType as NotificationEvent)) {
          data.isBackground = !isForeground;
          data.isForeground = isForeground;
          // TODO remove any
          callbacks.forEach((callback) => callback(data as any));
        }
      }
    },
    [subscriptionsAll, subscriptionsEvents]
  );

  useEffect(() => {
    if (!user) return;

    registerForPushNotificationsAsync();
    const notificationSubscription =
      Notifications.addNotificationReceivedListener(handleNotification);
    const notificationResponseSubscription =
      Notifications.addNotificationResponseReceivedListener(
        (notificationResponse) =>
          handleNotification(notificationResponse.notification, false)
      );

    return () => {
      notificationSubscription.remove();
      notificationResponseSubscription.remove();
    };
  }, [handleNotification, user]);

  return (
    <PushNotificationContext.Provider
      value={{
        listeningForNotifications: true,
        subscribeToAll,
        subscribeToEvent,
      }}
    >
      {props.children}
    </PushNotificationContext.Provider>
  );
}
