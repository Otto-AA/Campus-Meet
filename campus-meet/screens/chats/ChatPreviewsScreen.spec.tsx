import { render, screen } from "@testing-library/react-native";
import { PropsWithChildren } from "react";
import { Text } from "react-native-paper";

import { useChatsSync } from "../../hooks/chats/useChatsSync";
import * as hooks from "../../hooks/chats/useSortedChatPreviews";
import { mockedFunctionType } from "../../utils/types/mockedType";
import ChatPreviewsScreen from "./ChatPreviewsScreen";

const givenChatPreviews = (chatPreviews: any[]) => {
  jest
    .spyOn(hooks, "useSortedChatPreviews")
    .mockImplementation(() => ({ chatPreviews }));
};

const MockText = (content: PropsWithChildren) => (
  <Text>{content.children}</Text>
);

jest.mock("../../components/chats/ChatPreviews", () => () => (
  <MockText>MockedChats</MockText>
));

jest.mock("@react-navigation/native");

jest.mock("../../hooks/chats/useChatsSync");
const mockedUseChatsSync = mockedFunctionType(useChatsSync);
mockedUseChatsSync.mockReturnValue({ syncChats: () => Promise.resolve() });

describe("ChatPreviewsScreen", () => {
  test("given chatPreviews, ChatsScreen renders <Chats>", () => {
    givenChatPreviews(["fake preview 1", "fake preview 2"]);

    render(<ChatPreviewsScreen />);

    expect(screen.getByText("MockedChats")).toBeTruthy();
  });

  test("given no chatPreviews, ChatsScreen renders a start a chat message", async () => {
    givenChatPreviews([]);

    render(<ChatPreviewsScreen />);

    expect(
      screen.getByText("Start a chat in one of your meetings!")
    ).toBeTruthy();
  });

  test("Verify that the scrollView component is rendered with the correct refreshControl prop", () => {
    render(<ChatPreviewsScreen />);

    const { getByTestId } = screen;

    const scrollView = getByTestId("screen-chat-previews1");

    expect(scrollView.props.refreshControl).toBeDefined();
  });

  test("Verify that the scrollView component is rendered with the correct contentContainerStyle prop", async () => {
    const { getByTestId } = render(<ChatPreviewsScreen />);
    const scrollView = getByTestId("screen-chat-previews1");
    expect(scrollView.props.contentContainerStyle).toBe(undefined);
  });
});
