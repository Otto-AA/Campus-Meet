import { DateTime } from "luxon";

import { ISeedUser } from "./utils/accounts";
import { emulatorDefaultLocation } from "./utils/e2eLocation";
import { ISeedMeeting } from "./utils/meetings";
import { ISeedMessage } from "./utils/messages";
import { seed } from "./utils/seed";

const users: ISeedUser[] = [
  {
    email: "guest@mail.com",
    password: "123456",
    name: "Fernando",
  },
  {
    email: "study@mail.com",
    password: "123456",
    name: "Lilia",
  },
];

const meetings: ISeedMeeting[] = [
  {
    title: "Study session",
    creator: "study@mail.com",
    date: DateTime.now().plus({ days: 1 }).toJSDate(),
    durationMinutes: 150,
    members: ["study@mail.com", "guest@mail.com"],
    location: emulatorDefaultLocation,
    address: "Washington street 12",
  },
];

const messages: Record<string, ISeedMessage[]> = {
  "Study session": [
    {
      from: "guest@mail.com",
      date: DateTime.now().minus({ days: 2 }).toJSDate(),
      message: "Anyone out there?",
    },
  ],
};

export const seedsChat = {
  users,
  meetings,
  messages,
};

// seed if run via cli; don't seed if imported by other module
if (require.main === module) {
  seed(seedsChat);
}
