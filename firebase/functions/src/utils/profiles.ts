import { updateChatsMemberMetadata } from "./chats";
import { getDb } from "./libraryGetters";

export interface IProfile {
  name: string;
  studies: string;
  languages: string;
  about: string;
  imageUrl: string;
  creator: string;
}

export const getProfilesByUserIds = async (userIds: string[]) => {
  const snapshot = await getProfilesCollection()
    .where("creator", "in", userIds)
    .get();

  return snapshot.docs
};

const getProfilesCollection = () =>
  getDb().collection(
    "profiles"
  ) as FirebaseFirestore.CollectionReference<IProfile>;
