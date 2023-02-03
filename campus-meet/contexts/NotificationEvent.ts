export enum NotificationEvent {
  NewMeetingMember = "newMeetingMember",
  NewMessage = "newMessage",
}

export interface INotificationContents {
  newMeetingMember: {
    meetingId: string;
    newMemberUid: string;
  };
  newMessage: {
    id: string;
    chatId: string;
    from: string;
    message: string;
    date: number;
  };
}

export interface ICampusMeetNotification<E extends NotificationEvent> {
  event: E;
  isForeground: boolean;
  isBackground: boolean;
  content: INotificationContents[E];
}

export const isNotficationOfType = <E extends NotificationEvent>(
  data: { event?: unknown },
  type: E
): data is ICampusMeetNotification<E> => {
  return data.event === type;
};
