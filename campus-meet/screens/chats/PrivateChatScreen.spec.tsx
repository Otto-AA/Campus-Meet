import { render, screen } from "@testing-library/react-native";

// eslint-disable-next-line import/order
import { mockedChatsDb } from "../../jest/db.mock";

import { IProfile } from "../../api/profiles/profileAPI";
import ChatsDbProvider from "../../contexts/ChatsDbContext";
import ChatsDbSyncedProvider from "../../contexts/ChatsDbSyncedContext";
import ChatsSyncingContextProvider from "../../contexts/ChatsSyncingContext";
import { mockedNavigation } from "../../jest/useNavigation.mock";
import PrivateChatScreen from "./PrivateChatScreen";

const sampleProfile: IProfile = {
  id: "profile-1",
  creator: "user-1",
  name: "Jacobo",
  languages: "english",
  studies: "Computer Science",
  imageUrl: "https://example.org/image.png",
  about: "hey",
};

const routeFor = (profile: IProfile) =>
  ({
    params: {
      profile,
    },
  } as any);

const sampleRoute = routeFor(sampleProfile);

const customRender = (element: JSX.Element) => {
  return render(
    <ChatsDbProvider>
      <ChatsDbSyncedProvider>
        <ChatsSyncingContextProvider>{element}</ChatsSyncingContextProvider>
      </ChatsDbSyncedProvider>
    </ChatsDbProvider>
  );
};

describe("PrivateChatScreen", () => {
  it("displays nothing while loading", () => {
    // mock that db is not resolving
    mockedChatsDb.getPrivateChatId.mockReturnValue(new Promise(() => {}));

    customRender(
      <PrivateChatScreen
        navigation={mockedNavigation as any}
        route={sampleRoute}
      />
    );

    expect(screen.getByTestId("private-chat-loading")).toBeVisible();
  });
});
