import { DateTime } from "luxon";

import { ISeedUser } from "./utils/accounts";
import { emulatorDefaultLocation } from "./utils/e2eLocation";
import { ISeedMeeting } from "./utils/meetings";
import { ISeedMessage } from "./utils/messages";
import { seed } from "./utils/seed";

const users: ISeedUser[] = [
  {
    email: "test-chat@mail.com",
    password: "123456",
    name: "Jacobo",
  },
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
    title: "Ping Pong",
    creator: "test-chat@mail.com",
    date: DateTime.now().plus({ minutes: 15 }).toJSDate(),
    durationMinutes: 45,
    members: ["test-chat@mail.com", "guest@mail.com"],
    location: emulatorDefaultLocation,
    address: "Piazza Leonardo 1",
  },
  {
    title: "Study session",
    creator: "study@mail.com",
    date: DateTime.now().plus({ days: 1 }).toJSDate(),
    durationMinutes: 180,
    members: ["study@mail.com"],
    location: emulatorDefaultLocation,
    address: "Via Toledo 12",
  },
];

const messages: Record<string, ISeedMessage[]> = {
  "Study session": [
    {
      from: "study@mail.com",
      date: DateTime.now().toJSDate(),
      message: "Anyone out there?",
    },
  ],
  "Ping Pong": [
    {
      from: "test-chat@mail.com",
      date: DateTime.now().minus({ days: 2 }).toJSDate(),
      message: "Hey there",
    },
    {
      from: "guest@mail.com",
      date: DateTime.now().minus({ days: 1, hours: 3 }).toJSDate(),
      message: "Hi",
    },
    {
      from: "test-chat@mail.com",
      date: DateTime.now()
        .startOf("day")
        .plus({ hours: 7, minutes: 24 })
        .toJSDate(),
      message: "So today we go playing?",
    },
    {
      from: "guest@mail.com",
      date: DateTime.now()
        .startOf("day")
        .plus({ hours: 8, minutes: 20 })
        .toJSDate(),
      message: "YES!",
    },
    {
      from: "guest@mail.com",
      date: DateTime.now()
        .startOf("day")
        .plus({ hours: 8, minutes: 25 })
        .toJSDate(),
      message: "Do you have the rackets?",
    },
  ],
};

export const seedsChatPreview = {
  users,
  meetings,
  messages,
};

// seed if run via cli; don't seed if imported by other module
if (require.main === module) {
  seed(seedsChatPreview);
}
