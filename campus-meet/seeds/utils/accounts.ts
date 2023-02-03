import { faker } from "@faker-js/faker";

import { auth, db } from "./admin";

export const deleteAllAccounts = async () => {
  const { users: existingUsers } = await auth.listUsers();
  await auth.deleteUsers(existingUsers.map((user) => user.uid));
};

export interface ISeedAccount {
  email: string;
  password: string;
}

export interface ISeedUser extends ISeedAccount {
  name: string;
  imageUrl?: string;
  studies?: string;
  languages?: string;
  about?: string;
}

const _emailToUid: Record<string, string> = {};

export const addUser = async (user: ISeedUser) => {
  await addAccount(user);
  await addProfile(user);
};

export const addAccount = async ({ email, password }: ISeedAccount) => {
  const user = await auth.createUser({ email, password });
  _emailToUid[email] = user.uid;
  return user.uid;
};

export const addProfile = async (profile: ISeedUser) => {
  const userId = emailToUid(profile.email);
  const ref = await getProfilesCollection().add({
    creator: userId,
    name: profile.name,
    studies: profile.studies ?? faker.lorem.words(3),
    languages: profile.languages ?? "EN",
    about: profile.about ?? faker.name.jobTitle(),
    imageUrl: profile.imageUrl ?? faker.image.avatar(),
  });

  return ref.id;
};

export const emailToUid = (email: string) => _emailToUid[email];

const getProfilesCollection = () => db.collection("profiles");
