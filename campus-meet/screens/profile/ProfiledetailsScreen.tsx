import React from "react";

import ProfileDetails from "../../components/profile/ProfileDetails";
import { RootStackScreenProps } from "../../types";

export default function ProfiledetailsScreen({
  route: {
    params: { profile },
  },
}: RootStackScreenProps<"ProfileDetails">) {
  console.log(profile);

  return <ProfileDetails profile={profile} />;
}
