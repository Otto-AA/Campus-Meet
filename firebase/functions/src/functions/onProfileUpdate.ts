import * as functions from "firebase-functions";
import { updateChatsMemberMetadata } from "../utils/chats";
import { IProfile } from "../utils/profiles";

export const onProfileUpdateUpdateReferencedCollections = functions
  .region("europe-west1")
  .firestore.document("profiles/{profileId}")
  .onUpdate(async (change, context) => {
    const { profileId } = context.params;
    const { after, before } = change;
    const dataAfter = after.data() as IProfile;
    const dataBefore = before.data() as IProfile;

    await updateReferencedCollections(dataBefore, dataAfter);
  });

const updateReferencedCollections = async (
  before: IProfile,
  after: IProfile
) => {
  if (nameChanged(before, after) || imageUrlChanged(before, after)) {
    await updateChatsMemberMetadata(after.creator);
  }
};

const nameChanged = (before: IProfile, after: IProfile) => {
  return before.name !== after.name;
};

const imageUrlChanged = (before: IProfile, after: IProfile) => {
  return before.imageUrl !== after.imageUrl;
};
