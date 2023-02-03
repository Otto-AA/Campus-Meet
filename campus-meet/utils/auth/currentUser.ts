import { getAuth, User } from "firebase/auth";

export const getCurrentUser = (): User => {
  const { currentUser } = getAuth();
  if (!currentUser) {
    throw new Error("Must be logged in");
  }
  return currentUser;
};

export const getCurrentUserId = () => getCurrentUser().uid;
