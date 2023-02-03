import {
  addDoc,
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { getCurrentUserId } from "../../utils/auth/currentUser";
import { getDb } from "../../utils/database/firestore";

export interface IProfileCreationDto {
  name: string;
  studies: string;
  languages: string;
  about: string;
  imageUrl: string;
}

export interface IProfile {
  id: string;
  name: string;
  studies: string;
  languages: string;
  about: string;
  imageUrl: string;
  creator: string;
}

export interface IProfileMetadata {
  name: string;
  imageUrl: string;
}

export const getProfilesCollection = () => collection(getDb(), "profiles");
export const getProfileDoc = (profileId: string) =>
  doc(getProfilesCollection(), profileId);

export const createProfile = async (profile: IProfileCreationDto) => {
  const currentUserId = getCurrentUserId();
  try {
    const profileRef = await addDoc(getProfilesCollection(), {
      name: profile.name,
      studies: profile.studies,
      languages: profile.languages,
      about: profile.about,
      imageUrl: profile.imageUrl,
      creator: currentUserId,
    });
    return profileRef.id;
  } catch (error) {
    throw error;
  }
};

export const getProfile = async (id: string): Promise<IProfile> => {
  const ref = getProfileDoc(id);
  const snapshot = await getDoc(ref);
  const data = snapshot.data();
  if (!data) {
    throw new Error("Could not find profile with id " + id);
  }
  return mapDataToProfile(snapshot.id, data);
};

export const getProfileMetadataByUserId = async (
  userId: string
): Promise<IProfileMetadata> => {
  const profile = await getProfilebyUserId(userId);
  return mapProfileToMetadata(profile);
};

export const getProfilesMetadataByUserIds = async (
  userIds: string[]
): Promise<Record<string, IProfileMetadata>> => {
  const profiles = await getProfilesByUserIds(userIds);
  const metadatas: Record<string, IProfileMetadata> = {};
  for (const profile of profiles) {
    metadatas[profile.creator] = mapProfileToMetadata(profile);
  }
  return metadatas;
};

const mapProfileToMetadata = (profile: IProfile): IProfileMetadata => {
  return {
    name: profile.name,
    imageUrl: profile.imageUrl,
  };
};

export const getProfilebyUserId = async (uid: string): Promise<IProfile> => {
  const profiles = await getProfilesByUserIds([uid]);

  if (!profiles.length)
    throw new Error(`Could not find profile with uid ${uid}`);

  return profiles[0];
};

export const getProfilesByUserIds = async (
  userIds: string[]
): Promise<IProfile[]> => {
  if (userIds.length === 0) return [];

  const querySnapshot = await getDocs(
    query(getProfilesCollection(), where("creator", "in", userIds))
  );
  return querySnapshot.docs.map((doc) => mapDataToProfile(doc.id, doc.data()));
};

export const mapDataToProfile = (id: string, data: DocumentData): IProfile => {
  return {
    id,
    creator: data.creator,
    name: data.name,
    studies: data.studies,
    languages: data.languages,
    about: data.about,
    imageUrl: data.imageUrl,
  };
};

export const updateProfile = async (
  profileId: string,
  profile: IProfileCreationDto
) => {
  const profileDoc = getProfileDoc(profileId);
  await updateDoc(profileDoc, {
    name: profile.name,
    studies: profile.studies,
    languages: profile.languages,
    about: profile.about,
    imageUrl: profile.imageUrl,
  });
};

export const uploadImage = async (imageUri: string): Promise<string> => {
  let filename = filenameFromPath(imageUri);
  const extension = extensionFromFilename(filename);
  const name = filename.split(".").slice(0, -1).join(".");
  filename = name + Date.now() + "." + extension;

  const reference = ref(getStorage(), filename);
  const img = await fetch(imageUri);
  const blob = await img.blob();
  try {
    await uploadBytes(reference, blob);
  } catch (error) {
    console.error(error);
    throw error;
  }
  const url = await getDownloadURL(reference);
  console.log("url", url);
  return url;
};

export const filenameFromPath = (path: string) =>
  path.substring(path.lastIndexOf("/") + 1);
export const extensionFromFilename = (filename: string) =>
  filename.split(".").pop();
