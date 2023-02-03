import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useMemo, useState } from "react";

export function useAuthentication() {
  const [user, setUser] = useState<User>();
  const [initialized, setInitialized] = useState(false);
  const auth = useMemo(getAuth, []);

  useEffect(() => {
    const unsubscribeFromAuthStatusChanged = onAuthStateChanged(
      auth,
      (user) => {
        console.log("authenticated as", user?.email);
        if (user) setUser(user);
        else setUser(undefined);
        setInitialized(true);
      }
    );

    return unsubscribeFromAuthStatusChanged;
  }, [auth]);

  return {
    user,
    initialized,
  };
}
