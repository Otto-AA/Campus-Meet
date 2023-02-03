import { useEffect, useState } from "react";
import { View } from "react-native";

import { getProfilebyUserId, IProfile } from "../../api/profiles/profileAPI";
import ProfileDetails from "../../components/profile/ProfileDetails";
import { useAuthentication } from "../../hooks/useAuthentication";

export default function OwnProfileScreen() {
  const { user } = useAuthentication();
  const [profile, setProfile] = useState<IProfile>();

  useEffect(() => {
    if (user) getProfilebyUserId(user.uid).then(setProfile);
  }, [user]);

  return profile ? <ProfileDetails profile={profile} /> : <View />;
}
