import { fireEvent, render, screen } from "@testing-library/react-native";
import { DateTime } from "luxon";

import { IChatPreview } from "../../contexts/ChatsSyncingContext";
import ChatPreviews from "./ChatPreviews";

const mockedNavigate = jest.fn();
jest.mock("@react-navigation/native", () => {
  return {
    useNavigation: () => ({ navigate: mockedNavigate }),
  };
});

const sampleChatPreviews: IChatPreview[] = [
  {
    chatId: "Foo",
    title: "Lunch",
    lastMessage: {
      id: "xx",
      from: {
        uid: "u-1",
        name: "Peter",
      },
      message: "Where do we meet?",
      date: new Date(),
    },
    unreadCount: 5,
  },
  {
    chatId: "Bar",
    title: "Ping pong",
    lastMessage: {
      id: "yy",
      from: {
        uid: "u-2",
        name: "Jacobo",
      },
      message: "This is a really long message that won't fit on a single line",
      date: new Date("2022-01-02T04:30:10"),
    },
    unreadCount: 0,
  },
  {
    chatId: "FooBar",
    title: "Woop",
    lastMessage: {
      id: "zz",
      from: {
        uid: "u-2",
        name: "Jacobo",
      },
      message: "Some message",
      date: DateTime.now().minus({ days: 1 }).toJSDate(),
    },
    unreadCount: 0,
  },
  {
    chatId: "some-id",
    title: "Some Title",
    lastMessage: {
      id: "aa",
      from: {
        uid: "u-2",
        name: "Jacobo",
      },
      message: "Some message",
      date: DateTime.now().minus({ days: 2 }).toJSDate(),
    },
    unreadCount: 0,
  },
];

describe("ChatPreviews", () => {
  it("displays first chat preview", () => {
    render(<ChatPreviews chats={sampleChatPreviews} />);

    expect(screen.getByText(sampleChatPreviews[0].title)).toBeTruthy();
  });

  it("displays last message and sender", () => {
    const lastMessage = sampleChatPreviews[0].lastMessage;

    render(<ChatPreviews chats={sampleChatPreviews} />);

    expect(
      screen.getByText(`${lastMessage.from.name}: ${lastMessage.message}`)
    ).toBeTruthy();
  });

  it("displays meeting avatar with initial letters in uppercase", () => {
    render(<ChatPreviews chats={sampleChatPreviews} />);

    expect(screen.getByText("PP")).toBeTruthy();
  });

  it("shows only time on same day", () => {
    const date = sampleChatPreviews[0].lastMessage.date;
    const padTo2 = (n: number) =>
      n.toString().length === 1 ? `0${n}` : `${n}`;
    const expectedTime = `${padTo2(date.getHours())}:${padTo2(
      date.getMinutes()
    )}`;

    render(<ChatPreviews chats={sampleChatPreviews} />);

    expect(screen.getByText(expectedTime)).toBeTruthy();
  });

  it("shows exact date for two days ago", () => {
    const expectedDate = DateTime.now().minus({ days: 2 }).toFormat("dd/LL/yy");

    render(<ChatPreviews chats={sampleChatPreviews} />);

    expect(screen.getByText(expectedDate)).toBeTruthy();
  });

  it("navigates to chat when it is pressed", () => {
    const preview = sampleChatPreviews[0];

    render(<ChatPreviews chats={sampleChatPreviews} />);
    fireEvent.press(screen.getByText(preview.title));

    expect(mockedNavigate).toHaveBeenCalledWith("Chat", {
      chatId: preview.chatId,
    });
  });
});
