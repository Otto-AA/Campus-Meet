import { ChatsDb } from "../database/chatsDb";
import { mockedClassType } from "../utils/types/mockedType";

jest.mock("../database/chatsDb");
const mockedChatsDbClass = mockedClassType(ChatsDb);

const mockedDbInstance: jest.MockedObject<ChatsDb> = {
  db: {} as any,
  addMessages: jest.fn(),
  addOrUpdateChats: jest.fn(),
  closeAndDelete: jest.fn(),
  getChatMetadata: jest.fn(),
  getChatPreviews: jest.fn(),
  getMessages: jest.fn(),
  initTables: jest.fn(),
  getPrivateChatId: jest.fn(),
} as any;

const mockedGetChatPreviews = jest.fn();
mockedChatsDbClass.mockImplementation(() => {
  return {
    getChatPreviews: mockedGetChatPreviews,
  } as any;
});

mockedChatsDbClass.mockImplementation(() => mockedDbInstance);
export const resetMockedChatsDb = () => {
  mockedDbInstance.addMessages.mockReset();
  mockedDbInstance.addOrUpdateChats.mockReset();
  mockedDbInstance.closeAndDelete.mockReset();
  mockedDbInstance.getChatMetadata.mockReset();
  mockedDbInstance.getChatPreviews.mockReset();
  mockedDbInstance.getMessages.mockReset();
  mockedDbInstance.getPrivateChatId.mockReset();
  // @ts-ignore
  mockedDbInstance["initTables"].mockReset();
};

export const mockedChatsDb = mockedDbInstance;
