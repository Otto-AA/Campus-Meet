import {
  deleteAllAccounts,
  addUser,
  emailToUid,
  ISeedUser,
  ISeedAccount,
  addAccount,
} from "./accounts";
import { db } from "./admin";
import { waitForCreationByMeetingFunction, getChatByTitle } from "./chats";
import { addMeetings, ISeedMeeting } from "./meetings";
import { addMessages, ISeedMessage } from "./messages";

export interface ISeeds {
  accounts: ISeedAccount[];
  users: ISeedUser[];
  meetings: ISeedMeeting[];
  messages: { [chatId: string]: ISeedMessage[] };
}

const deleteEverything = async () => {
  await deleteAllAccounts();

  const collections = await db.listCollections();
  for (const collection of collections) {
    await db.recursiveDelete(collection);
  }
};

const seedUsers = async (users: ISeedUser[]) => {
  await Promise.all(users.map(addUser));
};

const seedAccounts = async (accounts: ISeedAccount[]) => {
  await Promise.all(accounts.map(addAccount));
};

const seedMeetings = async (meetings: ISeedMeeting[]) => {
  // map emails to the generated uids
  const meetingsWithUids = meetings.map((meeting) => {
    return {
      ...meeting,
      creator: emailToUid(meeting.creator),
      members: meeting.members.map(emailToUid),
    };
  });
  const ids = await addMeetings(meetingsWithUids);
  // wait for chats which are automatically created by the firebase functions
  await Promise.all(ids.map(waitForCreationByMeetingFunction));
};

const seedMessages = async (messages: { [chatId: string]: ISeedMessage[] }) => {
  for (const [chatTitle, chatMessages] of Object.entries(messages)) {
    const { id } = await getChatByTitle(chatTitle);
    await addMessages(
      id,
      chatMessages.map((m) => ({
        ...m,
        from: emailToUid(m.from),
      }))
    );
  }
};

export const seed = async (seeds: Partial<ISeeds>) => {
  await deleteEverything();
  await seedAccounts(seeds.accounts ?? []);
  await seedUsers(seeds.users ?? []);
  await seedMeetings(seeds.meetings ?? []);
  await seedMessages(seeds.messages ?? {});
};
